import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * Get campaign details
 * GET /api/reviews/campaigns/[id]
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

    const { data: campaign, error } = await supabase
      .from("review_campaigns")
      .select("*")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get review requests for this campaign
    const { data: requests } = await supabase
      .from("review_requests")
      .select(`
        *,
        contact:contacts(id, name, phone)
      `)
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      campaign,
      requests: requests || [],
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    return NextResponse.json({ error: "Failed to get campaign" }, { status: 500 });
  }
}

/**
 * Update campaign (start, pause, resume)
 * PATCH /api/reviews/campaigns/[id]
 */
export async function PATCH(
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

    const body = await request.json();
    const { action } = body;

    // Get campaign
    const { data: campaign, error: fetchError } = await supabase
      .from("review_campaigns")
      .select("*")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (action === "start") {
      if (campaign.status !== "draft" && campaign.status !== "paused") {
        return NextResponse.json(
          { error: "Campaign can only be started from draft or paused status" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("review_campaigns")
        .update({
          status: "sending",
          started_at: campaign.started_at || new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to start campaign" }, { status: 500 });
      }

      // Log analytics
      await supabase.from("analytics_events").insert({
        contractor_id: user.id,
        event_type: "blast_started",
        metadata: { campaign_id: id },
      });

      return NextResponse.json({ success: true, status: "sending" });
    }

    if (action === "pause") {
      if (campaign.status !== "sending") {
        return NextResponse.json(
          { error: "Can only pause a sending campaign" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("review_campaigns")
        .update({ status: "paused" })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to pause campaign" }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "paused" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

/**
 * Delete campaign
 * DELETE /api/reviews/campaigns/[id]
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

    // Verify ownership and status
    const { data: campaign } = await supabase
      .from("review_campaigns")
      .select("status")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "sending") {
      return NextResponse.json(
        { error: "Cannot delete a campaign that is currently sending" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("review_campaigns")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
