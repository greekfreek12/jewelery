import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";
import { renderTemplate } from "@/lib/reviews/templates";

/**
 * Process review drip reminders
 * GET /api/reviews/process-drip
 *
 * This should be called by a cron job (e.g., Vercel Cron, every hour)
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
    const now = new Date().toISOString();

    // Find review requests that need a drip reminder
    const { data: pendingDrips, error: fetchError } = await supabase
      .from("review_requests")
      .select(`
        id,
        contractor_id,
        contact_id,
        drip_step,
        contact:contacts(id, name, phone, opted_out)
      `)
      .in("status", ["sent", "reminded_1"])
      .lte("next_drip_at", now)
      .not("next_drip_at", "is", null)
      .limit(50); // Process in batches

    if (fetchError) {
      console.error("Failed to fetch pending drips:", fetchError);
      return NextResponse.json({ error: "Failed to fetch pending drips" }, { status: 500 });
    }

    if (!pendingDrips || pendingDrips.length === 0) {
      return NextResponse.json({ processed: 0, message: "No pending drips" });
    }

    let processed = 0;
    let errors = 0;

    for (const request of pendingDrips) {
      try {
        // contact comes as array from join, get first element
        const contactData = request.contact as unknown;
        const contact = Array.isArray(contactData) ? contactData[0] as { id: string; name: string; phone: string; opted_out: boolean } | undefined : contactData as { id: string; name: string; phone: string; opted_out: boolean } | null;

        // Skip if contact opted out
        if (!contact || contact.opted_out) {
          await supabase
            .from("review_requests")
            .update({ status: "stopped", next_drip_at: null })
            .eq("id", request.id);
          continue;
        }

        // Get contractor info
        const { data: contractor } = await supabase
          .from("contractors")
          .select("phone_number, business_name, templates, feature_review_drip")
          .eq("id", request.contractor_id)
          .single();

        if (!contractor || !contractor.phone_number || !contractor.feature_review_drip) {
          await supabase
            .from("review_requests")
            .update({ next_drip_at: null })
            .eq("id", request.id);
          continue;
        }

        const templates = contractor.templates || {};
        const nextStep = request.drip_step + 1;
        let message: string;
        let newStatus: string;
        let nextDripAt: string | null = null;

        if (nextStep === 1) {
          // First reminder
          const template = templates.review_reminder_1?.message ||
            "Hey {{contact_name}}, just checking in! We'd love to hear how your experience was with {{business_name}}. Reply 1-5 when you get a chance.";
          message = renderTemplate(template, {
            business_name: contractor.business_name,
            contact_name: contact.name.split(" ")[0],
          });
          newStatus = "reminded_1";

          // Schedule second reminder
          const reminder2Days = templates.review_reminder_2?.delay_days || 4;
          nextDripAt = new Date(Date.now() + reminder2Days * 24 * 60 * 60 * 1000).toISOString();
        } else if (nextStep === 2) {
          // Second/final reminder
          const template = templates.review_reminder_2?.message ||
            "Hi {{contact_name}}, last reminder - would you take 30 seconds to rate your experience with {{business_name}}? Reply 1-5. Thanks!";
          message = renderTemplate(template, {
            business_name: contractor.business_name,
            contact_name: contact.name.split(" ")[0],
          });
          newStatus = "reminded_2";
          nextDripAt = null; // No more reminders
        } else {
          // Shouldn't happen, but stop the sequence
          await supabase
            .from("review_requests")
            .update({ next_drip_at: null })
            .eq("id", request.id);
          continue;
        }

        // Send the SMS
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
        const statusCallback = `${baseUrl}/api/textgrid/status/${request.contractor_id}`;

        try {
          await sendSms(
            contractor.phone_number,
            contact.phone,
            message,
            statusCallback
          );

          // Update review request
          await supabase
            .from("review_requests")
            .update({
              status: newStatus,
              drip_step: nextStep,
              next_drip_at: nextDripAt,
            })
            .eq("id", request.id);

          // Log analytics
          await supabase.from("analytics_events").insert({
            contractor_id: request.contractor_id,
            event_type: "review_reminder_sent",
            metadata: {
              contact_id: contact.id,
              review_request_id: request.id,
              drip_step: nextStep,
            },
          });

          processed++;
        } catch (smsError) {
          errors++;
          console.error(`Failed to send drip for request ${request.id}:`, smsError);
        }
      } catch (err) {
        errors++;
        console.error(`Error processing drip for request ${request.id}:`, err);
      }
    }

    return NextResponse.json({
      processed,
      errors,
      total: pendingDrips.length,
    });
  } catch (error) {
    console.error("Process drip error:", error);
    return NextResponse.json({ error: "Failed to process drips" }, { status: 500 });
  }
}
