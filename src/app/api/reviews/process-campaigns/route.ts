import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";
import { renderTemplate } from "@/lib/reviews/templates";

/**
 * Process review campaigns (blasts)
 * GET /api/reviews/process-campaigns
 *
 * This should be called by a cron job (e.g., every 5 minutes)
 * Header: x-cron-secret must match CRON_SECRET env var
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createApiServiceClient();

    // Find active campaigns that need processing
    const { data: activeCampaigns, error: fetchError } = await supabase
      .from("review_campaigns")
      .select("*")
      .eq("status", "sending")
      .limit(10);

    if (fetchError) {
      console.error("Failed to fetch active campaigns:", fetchError);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    if (!activeCampaigns || activeCampaigns.length === 0) {
      return NextResponse.json({ processed: 0, message: "No active campaigns" });
    }

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const campaign of activeCampaigns) {
      try {
        // Get contractor info
        const { data: contractor } = await supabase
          .from("contractors")
          .select("phone_number, business_name, google_review_link, templates, feature_review_automation, feature_review_drip")
          .eq("id", campaign.contractor_id)
          .single();

        if (!contractor || !contractor.phone_number || !contractor.feature_review_automation) {
          // Pause campaign if contractor can't send
          await supabase
            .from("review_campaigns")
            .update({ status: "paused" })
            .eq("id", campaign.id);
          continue;
        }

        // Calculate how many to send this run (rate limit / 12 for 5-minute intervals)
        const sendThisRun = Math.max(1, Math.floor(campaign.rate_limit_per_hour / 12));

        // Build contact query based on filter
        let contactQuery = supabase
          .from("contacts")
          .select("id, name, phone")
          .eq("contractor_id", campaign.contractor_id)
          .eq("opted_out", false);

        const filter = campaign.contact_filter || {};

        // Apply tag filter
        if (filter.tags?.length > 0) {
          contactQuery = contactQuery.overlaps("tags", filter.tags);
        }

        // Exclude reviewed contacts
        if (filter.excludeReviewed) {
          contactQuery = contactQuery.eq("has_left_review", false);
        }

        // Get contacts already in this campaign
        const { data: existingRequests } = await supabase
          .from("review_requests")
          .select("contact_id")
          .eq("campaign_id", campaign.id);

        const existingContactIds = existingRequests?.map((r) => r.contact_id) || [];

        // Exclude contacts already in campaign
        if (existingContactIds.length > 0) {
          contactQuery = contactQuery.not("id", "in", `(${existingContactIds.join(",")})`);
        }

        // Exclude contacts with other pending review requests
        if (filter.excludePending) {
          const { data: pendingRequests } = await supabase
            .from("review_requests")
            .select("contact_id")
            .eq("contractor_id", campaign.contractor_id)
            .neq("campaign_id", campaign.id)
            .in("status", ["sent", "reminded_1", "reminded_2"]);

          const pendingIds = pendingRequests?.map((r) => r.contact_id) || [];
          if (pendingIds.length > 0) {
            contactQuery = contactQuery.not("id", "in", `(${pendingIds.join(",")})`);
          }
        }

        // Get contacts to send to
        const { data: contacts } = await contactQuery.limit(sendThisRun);

        if (!contacts || contacts.length === 0) {
          // Campaign complete!
          await supabase
            .from("review_campaigns")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", campaign.id);
          continue;
        }

        // Get template
        const templates = contractor.templates || {};
        const blastTemplate = templates.review_blast?.message ||
          "Hey {{contact_name}}, hope all is well! We're collecting feedback from customers - would you mind rating your experience with {{business_name}}? Reply 1-5";

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
        let sentCount = 0;
        let errorCount = 0;

        for (const contact of contacts) {
          try {
            // Render message
            const message = renderTemplate(blastTemplate, {
              business_name: contractor.business_name,
              contact_name: contact.name.split(" ")[0],
            });

            // Calculate next drip time if enabled
            const dripEnabled = contractor.feature_review_drip;
            const reminder1Days = templates.review_reminder_1?.delay_days || 3;
            const nextDripAt = dripEnabled
              ? new Date(Date.now() + reminder1Days * 24 * 60 * 60 * 1000).toISOString()
              : null;

            // Create review request
            const { data: reviewRequest } = await supabase
              .from("review_requests")
              .insert({
                contractor_id: campaign.contractor_id,
                contact_id: contact.id,
                campaign_id: campaign.id,
                status: "sent",
                drip_step: 0,
                next_drip_at: nextDripAt,
                sent_at: new Date().toISOString(),
              })
              .select()
              .single();

            // Send SMS
            const statusCallback = `${baseUrl}/api/textgrid/status/${campaign.contractor_id}`;
            try {
              await sendSms(
                contractor.phone_number,
                contact.phone,
                message,
                statusCallback
              );

              sentCount++;

              // Log analytics
              await supabase.from("analytics_events").insert({
                contractor_id: campaign.contractor_id,
                event_type: "review_request_sent",
                metadata: {
                  contact_id: contact.id,
                  review_request_id: reviewRequest?.id,
                  campaign_id: campaign.id,
                },
              });
            } catch (smsError) {
              errorCount++;
              console.error(`SMS send failed for contact ${contact.id}:`, smsError);
              // Mark request as stopped
              if (reviewRequest) {
                await supabase
                  .from("review_requests")
                  .update({ status: "stopped" })
                  .eq("id", reviewRequest.id);
              }
            }
          } catch (err) {
            errorCount++;
            console.error(`Error sending to contact ${contact.id}:`, err);
          }
        }

        // Update campaign stats
        await supabase
          .from("review_campaigns")
          .update({
            sent_count: campaign.sent_count + sentCount,
          })
          .eq("id", campaign.id);

        totalProcessed += sentCount;
        totalErrors += errorCount;
      } catch (err) {
        console.error(`Error processing campaign ${campaign.id}:`, err);
        totalErrors++;
      }
    }

    return NextResponse.json({
      processed: totalProcessed,
      errors: totalErrors,
      campaigns: activeCampaigns.length,
    });
  } catch (error) {
    console.error("Process campaigns error:", error);
    return NextResponse.json({ error: "Failed to process campaigns" }, { status: 500 });
  }
}
