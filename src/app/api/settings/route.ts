import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * Update contractor settings
 * PUT /api/settings
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      business_name,
      timezone,
      forwarding_number,
      google_review_link,
      business_hours_start,
      business_hours_end,
      feature_missed_call_text,
      feature_review_automation,
      feature_review_drip,
      notification_push,
      notification_email,
    } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (business_name !== undefined) updates.business_name = business_name;
    if (timezone !== undefined) updates.timezone = timezone;
    if (forwarding_number !== undefined) {
      // Normalize phone number
      const cleaned = forwarding_number.replace(/\D/g, "");
      if (cleaned) {
        updates.forwarding_number = cleaned.startsWith("1")
          ? `+${cleaned}`
          : `+1${cleaned}`;
      } else {
        updates.forwarding_number = null;
      }
    }
    if (google_review_link !== undefined) {
      updates.google_review_link = google_review_link || null;
    }
    if (business_hours_start !== undefined) {
      updates.business_hours_start = business_hours_start || null;
    }
    if (business_hours_end !== undefined) {
      updates.business_hours_end = business_hours_end || null;
    }
    if (feature_missed_call_text !== undefined) {
      updates.feature_missed_call_text = feature_missed_call_text;
    }
    if (feature_review_automation !== undefined) {
      updates.feature_review_automation = feature_review_automation;
    }
    if (feature_review_drip !== undefined) {
      updates.feature_review_drip = feature_review_drip;
    }
    if (notification_push !== undefined) {
      updates.notification_push = notification_push;
    }
    if (notification_email !== undefined) {
      updates.notification_email = notification_email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: contractor, error } = await supabase
      .from("contractors")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // Log analytics event
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "settings_changed",
      metadata: { fields: Object.keys(updates) },
    });

    return NextResponse.json({ contractor });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * Get contractor settings
 * GET /api/settings
 */
export async function GET() {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contractor, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contractor });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
