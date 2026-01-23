import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * List review campaigns
 * GET /api/reviews/campaigns
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

    const { data: campaigns, error } = await supabase
      .from("review_campaigns")
      .select("*")
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch campaigns:", error);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (error) {
    console.error("List campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

/**
 * Create a review campaign (blast)
 * POST /api/reviews/campaigns
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

    const body = await request.json();
    const { name, contactFilter, rateLimitPerHour = 20 } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    // Build the contact query based on filter
    let contactQuery = supabase
      .from("contacts")
      .select("id", { count: "exact" })
      .eq("contractor_id", user.id)
      .eq("opted_out", false);

    // Apply tag filter
    if (contactFilter?.tags?.length > 0) {
      contactQuery = contactQuery.overlaps("tags", contactFilter.tags);
    }

    // Exclude contacts who have already left a review
    if (contactFilter?.excludeReviewed) {
      contactQuery = contactQuery.eq("has_left_review", false);
    }

    // Exclude contacts with pending review requests
    if (contactFilter?.excludePending) {
      const { data: pendingContactIds } = await supabase
        .from("review_requests")
        .select("contact_id")
        .eq("contractor_id", user.id)
        .in("status", ["sent", "reminded_1", "reminded_2"]);

      if (pendingContactIds?.length) {
        const ids = pendingContactIds.map((r) => r.contact_id);
        contactQuery = contactQuery.not("id", "in", `(${ids.join(",")})`);
      }
    }

    const { count: totalContacts } = await contactQuery;

    if (!totalContacts || totalContacts === 0) {
      return NextResponse.json(
        { error: "No contacts match the selected criteria" },
        { status: 400 }
      );
    }

    // Create the campaign
    const { data: campaign, error: insertError } = await supabase
      .from("review_campaigns")
      .insert({
        contractor_id: user.id,
        name,
        status: "draft",
        contact_filter: contactFilter || {},
        total_contacts: totalContacts,
        rate_limit_per_hour: rateLimitPerHour,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create campaign:", insertError);
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
