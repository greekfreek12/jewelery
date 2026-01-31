import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";

type JobStatus = "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled";

interface StatusChangeBody {
  status: JobStatus;
}

interface JobSettings {
  notifications: {
    send_confirmation: boolean;
    send_day_before_reminder: boolean;
    send_en_route: boolean;
    send_cancellation: boolean;
  };
  review_delay_hours: number;
}

/**
 * Change job status with side effects (notifications, review triggers)
 * POST /api/jobs/[id]/status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: StatusChangeBody = await request.json();
    const { status: newStatus } = body;

    if (!newStatus) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get job with contact and contractor info
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          opted_out
        )
      `)
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const oldStatus = job.status;

    // Don't allow changing from terminal states
    if (oldStatus === "completed" || oldStatus === "cancelled") {
      return NextResponse.json(
        { error: `Cannot change status from ${oldStatus}` },
        { status: 400 }
      );
    }

    // Get contractor settings
    const { data: contractor } = await supabase
      .from("contractors")
      .select("business_name, phone_number, job_settings")
      .eq("id", user.id)
      .single();

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    const jobSettings = (contractor.job_settings || {}) as JobSettings;
    const notifications = jobSettings.notifications || {};

    // Build status update
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status: newStatus };

    switch (newStatus) {
      case "en_route":
        updates.en_route_at = now;
        break;
      case "in_progress":
        updates.started_at = now;
        break;
      case "completed":
        updates.completed_at = now;
        break;
      case "cancelled":
        updates.cancelled_at = now;
        break;
    }

    // Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          opted_out
        )
      `)
      .single();

    if (updateError) {
      console.error("Failed to update job status:", updateError);
      return NextResponse.json(
        { error: "Failed to update job status" },
        { status: 500 }
      );
    }

    // Handle side effects based on new status
    const contact = job.contacts;
    const sideEffects: string[] = [];

    if (contact && contact.phone && !contact.opted_out && contractor.phone_number) {
      const firstName = contact.name?.split(" ")[0] || "there";

      // Send "en route" notification
      if (newStatus === "en_route" && notifications.send_en_route) {
        try {
          await sendSms(
            contractor.phone_number,
            contact.phone,
            `Hi ${firstName}, your technician from ${contractor.business_name} is on the way!`
          );
          sideEffects.push("en_route_notification_sent");
        } catch (err) {
          console.error("Failed to send en route notification:", err);
        }
      }

      // Send cancellation notification
      if (newStatus === "cancelled" && notifications.send_cancellation) {
        try {
          await sendSms(
            contractor.phone_number,
            contact.phone,
            `Hi ${firstName}, your appointment with ${contractor.business_name} has been cancelled. Please call us to reschedule.`
          );
          sideEffects.push("cancellation_notification_sent");
        } catch (err) {
          console.error("Failed to send cancellation notification:", err);
        }
      }

      // Schedule review request when completed
      if (newStatus === "completed") {
        const delayHours = jobSettings.review_delay_hours || 2;
        const reviewAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();

        // Store when review should be sent - cron job will process this
        await supabase
          .from("jobs")
          .update({
            review_requested_at: reviewAt,
          })
          .eq("id", id);

        sideEffects.push("review_request_scheduled");
      }
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "job_status_changed",
      metadata: {
        job_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        side_effects: sideEffects,
      },
    });

    return NextResponse.json({
      job: updatedJob,
      side_effects: sideEffects,
    });
  } catch (error) {
    console.error("Job status change error:", error);
    return NextResponse.json(
      { error: "Failed to change job status" },
      { status: 500 }
    );
  }
}
