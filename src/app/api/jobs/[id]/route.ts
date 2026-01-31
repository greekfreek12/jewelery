import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

type JobTimeType = "window" | "timeofday" | "exact";
type JobTimeOfDay = "morning" | "afternoon" | "allday";
type JobDuration = "30min" | "1hr" | "2hr" | "3hr" | "4hr" | "half_day" | "full_day";
type JobStatus = "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled";

interface UpdateJobBody {
  contact_id?: string | null;
  service_type?: string;
  notes?: string;
  scheduled_date?: string;
  time_type?: JobTimeType;
  window_start?: string;
  window_end?: string;
  time_of_day?: JobTimeOfDay;
  estimated_duration?: JobDuration | null;
  address_override?: string;
  status?: JobStatus;
}

/**
 * Get a single job
 * GET /api/jobs/[id]
 */
export async function GET(
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

    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          email,
          address
        ),
        customer_leads (
          id,
          name,
          phone,
          email,
          service_type,
          source
        ),
        review_requests (
          id,
          status,
          rating,
          sent_at,
          replied_at
        )
      `)
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Failed to get job" },
      { status: 500 }
    );
  }
}

/**
 * Update a job
 * PUT /api/jobs/[id]
 */
export async function PUT(
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

    // Verify ownership and get current job
    const { data: existing } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body: UpdateJobBody = await request.json();
    const {
      contact_id,
      service_type,
      notes,
      scheduled_date,
      time_type,
      window_start,
      window_end,
      time_of_day,
      estimated_duration,
      address_override,
      status,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};

    if (contact_id !== undefined) updates.contact_id = contact_id;
    if (service_type !== undefined) updates.service_type = service_type || null;
    if (notes !== undefined) updates.notes = notes || null;
    if (scheduled_date !== undefined) updates.scheduled_date = scheduled_date;
    if (time_type !== undefined) updates.time_type = time_type;
    if (window_start !== undefined) updates.window_start = window_start || null;
    if (window_end !== undefined) updates.window_end = window_end || null;
    if (time_of_day !== undefined) updates.time_of_day = time_of_day || null;
    if (estimated_duration !== undefined) updates.estimated_duration = estimated_duration;
    if (address_override !== undefined) updates.address_override = address_override || null;

    // Handle status changes with timestamp updates
    if (status !== undefined && status !== existing.status) {
      updates.status = status;
      const now = new Date().toISOString();

      switch (status) {
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
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          email,
          address
        )
      `)
      .single();

    if (error) {
      console.error("Failed to update job:", error);
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 }
      );
    }

    // Log status change analytics
    if (status !== undefined && status !== existing.status) {
      await supabase.from("analytics_events").insert({
        contractor_id: user.id,
        event_type: "job_status_changed",
        metadata: {
          job_id: id,
          old_status: existing.status,
          new_status: status,
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

/**
 * Delete a job
 * DELETE /api/jobs/[id]
 */
export async function DELETE(
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

    // Verify ownership
    const { data: existing } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete job:", error);
      return NextResponse.json(
        { error: "Failed to delete job" },
        { status: 500 }
      );
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "job_deleted",
      metadata: { job_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
