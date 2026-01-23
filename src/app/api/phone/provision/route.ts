import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { purchasePhoneNumberForContractor } from "@/lib/textgrid/client";

/**
 * Provision (purchase) a phone number for the contractor
 * POST /api/phone/provision
 * Body: { phoneNumber: "+15041234567" }
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
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if contractor already has a phone number
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, phone_number, subscription_status")
      .eq("id", user.id)
      .single();

    if (contractor?.phone_number) {
      return NextResponse.json(
        { error: "You already have a phone number assigned" },
        { status: 400 }
      );
    }

    // Check subscription status
    const activeStatuses = ["trialing", "active"];
    if (!activeStatuses.includes(contractor?.subscription_status || "")) {
      return NextResponse.json(
        { error: "Active subscription required to provision phone number" },
        { status: 403 }
      );
    }

    // Purchase the phone number with contractor-specific webhooks
    const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    // Use contractor-specific webhook URLs for routing
    const result = await purchasePhoneNumberForContractor(
      phoneNumber,
      user.id,
      webhookBaseUrl
    );

    // Update contractor with phone number
    const { error: updateError } = await supabase
      .from("contractors")
      .update({
        phone_number: result.phoneNumber,
        phone_sid: result.sid,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update contractor with phone:", updateError);
      // Note: Phone is purchased but not saved - would need manual cleanup
      return NextResponse.json(
        { error: "Phone provisioned but failed to save. Contact support." },
        { status: 500 }
      );
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "phone_provisioned",
      metadata: {
        phone_number: result.phoneNumber,
        phone_sid: result.sid,
      },
    });

    return NextResponse.json({
      success: true,
      phoneNumber: result.phoneNumber,
      message:
        "Phone number provisioned! Note: You need to add it to a campaign in TextGrid dashboard before it can send/receive messages.",
    });
  } catch (error) {
    console.error("Phone provision error:", error);
    return NextResponse.json(
      { error: "Failed to provision phone number" },
      { status: 500 }
    );
  }
}
