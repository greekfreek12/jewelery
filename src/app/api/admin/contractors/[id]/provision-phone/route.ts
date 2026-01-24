import { NextRequest, NextResponse } from "next/server";
import { createApiClient, createApiServiceClient } from "@/lib/supabase/api-client";
import { purchasePhoneNumberForContractor } from "@/lib/textgrid/client";

/**
 * Provision phone number for a contractor (admin only)
 * POST /api/admin/contractors/[id]/provision-phone
 * Body: { phoneNumber: "+15041234567" }
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

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Use service client for admin operations
    const serviceClient = createApiServiceClient();

    // Check if contractor exists and doesn't already have a number
    const { data: contractor, error: contractorError } = await serviceClient
      .from("contractors")
      .select("id, phone_number, business_name")
      .eq("id", id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    if (contractor.phone_number) {
      return NextResponse.json(
        { error: "Contractor already has a phone number assigned" },
        { status: 400 }
      );
    }

    // Purchase the phone number with contractor-specific webhooks
    const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    const result = await purchasePhoneNumberForContractor(
      phoneNumber,
      id,
      webhookBaseUrl
    );

    // Update contractor with phone number
    const { error: updateError } = await serviceClient
      .from("contractors")
      .update({
        phone_number: result.phoneNumber,
        phone_sid: result.sid,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update contractor with phone:", updateError);
      return NextResponse.json(
        { error: "Phone provisioned but failed to save. Contact support." },
        { status: 500 }
      );
    }

    // Log analytics
    await serviceClient.from("analytics_events").insert({
      contractor_id: id,
      event_type: "phone_provisioned_by_admin",
      metadata: {
        phone_number: result.phoneNumber,
        phone_sid: result.sid,
        provisioned_by: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      phoneNumber: result.phoneNumber,
      message: "Phone number provisioned successfully!",
    });
  } catch (error) {
    console.error("Admin phone provision error:", error);
    return NextResponse.json(
      { error: "Failed to provision phone number" },
      { status: 500 }
    );
  }
}
