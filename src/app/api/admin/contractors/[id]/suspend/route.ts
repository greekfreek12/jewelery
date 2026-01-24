import { NextRequest, NextResponse } from "next/server";
import { createApiClient, createApiServiceClient } from "@/lib/supabase/api-client";

/**
 * Suspend or unsuspend a contractor (admin only)
 * POST /api/admin/contractors/[id]/suspend
 * Body: { suspend: true, reason?: "Payment issues" }
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

    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from("contractors")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow suspending yourself
    if (id === user.id) {
      return NextResponse.json(
        { error: "Cannot suspend your own account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { suspend = true, reason = "" } = body;

    // Use service client for admin operations
    const serviceClient = createApiServiceClient();

    // Check contractor exists
    const { data: contractor, error: contractorError } = await serviceClient
      .from("contractors")
      .select("id, is_admin")
      .eq("id", id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Don't allow suspending other admins
    if (contractor.is_admin) {
      return NextResponse.json(
        { error: "Cannot suspend an admin account" },
        { status: 400 }
      );
    }

    // Update suspension status
    const { error: updateError } = await serviceClient
      .from("contractors")
      .update({
        suspended_at: suspend ? new Date().toISOString() : null,
        suspended_reason: suspend ? reason : null,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update suspension status:", updateError);
      return NextResponse.json(
        { error: "Failed to update suspension status" },
        { status: 500 }
      );
    }

    // Log analytics
    await serviceClient.from("analytics_events").insert({
      contractor_id: id,
      event_type: suspend ? "account_suspended" : "account_unsuspended",
      metadata: {
        reason,
        action_by: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      suspended: suspend,
      message: suspend ? "Account suspended" : "Account unsuspended",
    });
  } catch (error) {
    console.error("Admin suspend error:", error);
    return NextResponse.json(
      { error: "Failed to update suspension status" },
      { status: 500 }
    );
  }
}
