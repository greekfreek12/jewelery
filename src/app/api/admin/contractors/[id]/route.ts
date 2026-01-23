import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * Update contractor (admin only)
 * PUT /api/admin/contractors/[id]
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

    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from("contractors")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      business_name,
      timezone,
      forwarding_number,
      google_review_link,
      feature_missed_call_text,
      feature_review_automation,
      feature_review_drip,
      feature_ai_responses,
      feature_campaigns,
      is_admin,
      subscription_status,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};

    if (business_name !== undefined) updates.business_name = business_name;
    if (timezone !== undefined) updates.timezone = timezone;
    if (forwarding_number !== undefined) {
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
    if (feature_missed_call_text !== undefined) {
      updates.feature_missed_call_text = feature_missed_call_text;
    }
    if (feature_review_automation !== undefined) {
      updates.feature_review_automation = feature_review_automation;
    }
    if (feature_review_drip !== undefined) {
      updates.feature_review_drip = feature_review_drip;
    }
    if (feature_ai_responses !== undefined) {
      updates.feature_ai_responses = feature_ai_responses;
    }
    if (feature_campaigns !== undefined) {
      updates.feature_campaigns = feature_campaigns;
    }
    if (is_admin !== undefined) {
      updates.is_admin = is_admin;
    }
    if (subscription_status !== undefined) {
      updates.subscription_status = subscription_status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: contractor, error } = await supabase
      .from("contractors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update contractor:", error);
      return NextResponse.json(
        { error: "Failed to update contractor" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contractor });
  } catch (error) {
    console.error("Admin update contractor error:", error);
    return NextResponse.json(
      { error: "Failed to update contractor" },
      { status: 500 }
    );
  }
}

/**
 * Get contractor details (admin only)
 * GET /api/admin/contractors/[id]
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

    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from("contractors")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: contractor, error } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contractor });
  } catch (error) {
    console.error("Admin get contractor error:", error);
    return NextResponse.json(
      { error: "Failed to get contractor" },
      { status: 500 }
    );
  }
}
