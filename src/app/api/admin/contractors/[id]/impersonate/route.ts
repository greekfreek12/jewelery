import { NextRequest, NextResponse } from "next/server";
import { createApiClient, createApiServiceClient } from "@/lib/supabase/api-client";

/**
 * Generate an impersonation link for a contractor (admin only)
 * POST /api/admin/contractors/[id]/impersonate
 *
 * Returns a magic link URL that logs in as the contractor
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

    // Use service client for admin operations
    const serviceClient = createApiServiceClient();

    // Get contractor email
    const { data: contractor, error: contractorError } = await serviceClient
      .from("contractors")
      .select("id, email, suspended_at")
      .eq("id", id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    if (contractor.suspended_at) {
      return NextResponse.json(
        { error: "Cannot impersonate a suspended account" },
        { status: 400 }
      );
    }

    // Generate a magic link for the contractor
    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email: contractor.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

    if (linkError || !linkData) {
      console.error("Failed to generate magic link:", linkError);
      return NextResponse.json(
        { error: "Failed to generate impersonation link" },
        { status: 500 }
      );
    }

    // Log the impersonation
    await serviceClient.from("analytics_events").insert({
      contractor_id: id,
      event_type: "admin_impersonation",
      metadata: {
        impersonated_by: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      url: linkData.properties?.action_link,
      message: "Impersonation link generated. Opens in new tab.",
    });
  } catch (error) {
    console.error("Admin impersonate error:", error);
    return NextResponse.json(
      { error: "Failed to generate impersonation link" },
      { status: 500 }
    );
  }
}
