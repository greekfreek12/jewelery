import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * Estimate contact count for a review campaign filter
 * POST /api/reviews/estimate
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
    const { contactFilter } = body;

    // Build the contact query based on filter
    let contactQuery = supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
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

    const { count } = await contactQuery;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Estimate error:", error);
    return NextResponse.json({ error: "Failed to estimate" }, { status: 500 });
  }
}
