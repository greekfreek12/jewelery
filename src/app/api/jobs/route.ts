import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

type JobTimeType = "window" | "timeofday" | "exact";
type JobTimeOfDay = "morning" | "afternoon" | "allday";
type JobDuration = "30min" | "1hr" | "2hr" | "3hr" | "4hr" | "half_day" | "full_day";
type JobStatus = "scheduled" | "en_route" | "in_progress" | "completed" | "cancelled";

interface CreateJobBody {
  contact_id?: string;
  customer_lead_id?: string;
  service_type?: string;
  notes?: string;
  scheduled_date: string;
  time_type?: JobTimeType;
  window_start?: string;
  window_end?: string;
  time_of_day?: JobTimeOfDay;
  estimated_duration?: JobDuration;
  address_override?: string;
}

/**
 * List all jobs
 * GET /api/jobs
 * Query params: status, date_from, date_to
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabase
      .from("jobs")
      .select(`
        id,
        contact_id,
        customer_lead_id,
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
        created_at,
        updated_at,
        en_route_at,
        started_at,
        completed_at,
        cancelled_at,
        review_request_id,
        review_requested_at,
        contacts (
          id,
          name,
          phone,
          email,
          address
        )
      `)
      .eq("contractor_id", user.id);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (dateFrom) {
      query = query.gte("scheduled_date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("scheduled_date", dateTo);
    }

    const { data: jobs, error } = await query.order("scheduled_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch jobs:", error);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

/**
 * Create a new job
 * POST /api/jobs
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateJobBody = await request.json();
    const {
      contact_id,
      customer_lead_id,
      service_type,
      notes,
      scheduled_date,
      time_type = "window",
      window_start,
      window_end,
      time_of_day,
      estimated_duration,
      address_override,
    } = body;

    // Validate required fields
    if (!scheduled_date) {
      return NextResponse.json(
        { error: "Scheduled date is required" },
        { status: 400 }
      );
    }

    // Validate time fields based on time_type
    if (time_type === "window" && (!window_start || !window_end)) {
      return NextResponse.json(
        { error: "Window start and end times are required for window time type" },
        { status: 400 }
      );
    }
    if (time_type === "exact" && !window_start) {
      return NextResponse.json(
        { error: "Start time is required for exact time type" },
        { status: 400 }
      );
    }
    if (time_type === "timeofday" && !time_of_day) {
      return NextResponse.json(
        { error: "Time of day is required for timeofday time type" },
        { status: 400 }
      );
    }

    // If contact_id provided, verify it belongs to this contractor
    if (contact_id) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("id", contact_id)
        .eq("contractor_id", user.id)
        .single();

      if (!contact) {
        return NextResponse.json(
          { error: "Contact not found" },
          { status: 404 }
        );
      }
    }

    // Create the job
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        contractor_id: user.id,
        contact_id: contact_id || null,
        customer_lead_id: customer_lead_id || null,
        service_type: service_type || null,
        notes: notes || null,
        scheduled_date,
        time_type,
        window_start: time_type !== "timeofday" ? window_start : null,
        window_end: time_type === "window" ? window_end : null,
        time_of_day: time_type === "timeofday" ? time_of_day : null,
        estimated_duration: estimated_duration || null,
        address_override: address_override || null,
        status: "scheduled" as JobStatus,
      })
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
      console.error("Failed to create job:", error);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "job_created",
      metadata: {
        job_id: job.id,
        contact_id: contact_id || null,
        service_type: service_type || null,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
