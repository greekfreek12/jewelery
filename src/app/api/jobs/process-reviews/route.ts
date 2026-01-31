import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";
import { renderTemplate } from "@/lib/reviews/templates";

interface JobForReview {
  id: string;
  contractor_id: string;
  contact_id: string;
  service_type: string | null;
  contacts: {
    id: string;
    name: string;
    phone: string;
    opted_out: boolean;
    has_left_review: boolean;
  } | null;
  contractors: {
    id: string;
    business_name: string;
    phone_number: string | null;
    google_review_link: string | null;
    feature_review_automation: boolean;
    templates: Record<string, { message: string }> | null;
  } | null;
}

/**
 * Process completed jobs that need review requests sent
 * Called by cron job every 5 minutes
 * GET /api/jobs/process-reviews
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

    // Find jobs that:
    // 1. Are completed
    // 2. Have review_requested_at in the past (time to send)
    // 3. Don't have a review_request_id yet (haven't sent)
    const { data, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        id,
        contractor_id,
        contact_id,
        service_type,
        contacts (
          id,
          name,
          phone,
          opted_out,
          has_left_review
        ),
        contractors (
          id,
          business_name,
          phone_number,
          google_review_link,
          feature_review_automation,
          templates
        )
      `)
      .eq("status", "completed")
      .is("review_request_id", null)
      .not("review_requested_at", "is", null)
      .lte("review_requested_at", now)
      .limit(50);

    // Type assertion for the nested relations
    const jobs = data as JobForReview[] | null;

    if (jobsError) {
      console.error("Failed to fetch jobs for review:", jobsError);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const job of jobs) {
      const contact = job.contacts;
      const contractor = job.contractors;

      // Skip if missing required data
      if (!contact || !contractor) {
        skipped++;
        continue;
      }

      // Skip if feature disabled
      if (!contractor.feature_review_automation) {
        skipped++;
        continue;
      }

      // Skip if no phone configured
      if (!contractor.phone_number) {
        skipped++;
        continue;
      }

      // Skip if contact opted out
      if (contact.opted_out) {
        skipped++;
        continue;
      }

      // Skip if already left a review
      if (contact.has_left_review) {
        skipped++;
        continue;
      }

      // Check for existing pending review request (90-day cooldown)
      const { data: existingRequest } = await supabase
        .from("review_requests")
        .select("id")
        .eq("contractor_id", job.contractor_id)
        .eq("contact_id", contact.id)
        .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (existingRequest) {
        // Mark job as already having a review request
        await supabase
          .from("jobs")
          .update({ review_request_id: existingRequest.id })
          .eq("id", job.id);
        skipped++;
        continue;
      }

      try {
        // Get template
        const templates = contractor.templates;
        const template = templates?.review_request?.message ||
          "Hey {{contact_name}}, thanks for choosing {{business_name}}! How'd we do? Reply 1-5";

        // Render template with variables
        const firstName = contact.name?.split(" ")[0] || "there";
        const message = renderTemplate(template, {
          contact_name: firstName,
          business_name: contractor.business_name,
          review_link: contractor.google_review_link || "",
        });

        // Send SMS
        await sendSms(contractor.phone_number, contact.phone, message);

        // Create review request record
        const { data: reviewRequest } = await supabase
          .from("review_requests")
          .insert({
            contractor_id: job.contractor_id,
            contact_id: contact.id,
            status: "sent",
            sent_at: now,
            // Set up drip if enabled
            drip_step: 0,
            next_drip_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select("id")
          .single();

        // Link to job
        if (reviewRequest) {
          await supabase
            .from("jobs")
            .update({ review_request_id: reviewRequest.id })
            .eq("id", job.id);
        }

        // Log analytics
        await supabase.from("analytics_events").insert({
          contractor_id: job.contractor_id,
          event_type: "review_request_sent",
          metadata: {
            contact_id: contact.id,
            job_id: job.id,
            source: "job_completion",
          },
        });

        processed++;
      } catch (err) {
        console.error(`Failed to send review for job ${job.id}:`, err);
        errors.push(job.id);
      }
    }

    return NextResponse.json({
      processed,
      skipped,
      errors: errors.length,
    });
  } catch (error) {
    console.error("Process reviews error:", error);
    return NextResponse.json(
      { error: "Failed to process reviews" },
      { status: 500 }
    );
  }
}
