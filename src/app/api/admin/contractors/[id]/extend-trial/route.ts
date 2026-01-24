import { NextRequest, NextResponse } from "next/server";
import { createApiClient, createApiServiceClient } from "@/lib/supabase/api-client";
import { stripe } from "@/lib/stripe/config";

/**
 * Extend trial for a contractor (admin only)
 * POST /api/admin/contractors/[id]/extend-trial
 * Body: { days: 7 }
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
    const { days = 7 } = body;

    if (days < 1 || days > 90) {
      return NextResponse.json(
        { error: "Days must be between 1 and 90" },
        { status: 400 }
      );
    }

    // Use service client for admin operations
    const serviceClient = createApiServiceClient();

    // Get contractor
    const { data: contractor, error: contractorError } = await serviceClient
      .from("contractors")
      .select("id, subscription_id, subscription_status")
      .eq("id", id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // If they have a subscription in Stripe, extend trial there
    if (contractor.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          contractor.subscription_id
        );

        if (subscription.status === "trialing") {
          // Extend the trial end date
          const newTrialEnd = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
          await stripe.subscriptions.update(contractor.subscription_id, {
            trial_end: newTrialEnd,
          });
        }
      } catch (stripeError) {
        console.error("Stripe trial extension error:", stripeError);
        // Continue - we'll still update the local status
      }
    }

    // Update local subscription status to trialing
    const { error: updateError } = await serviceClient
      .from("contractors")
      .update({
        subscription_status: "trialing",
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update contractor status:", updateError);
      return NextResponse.json(
        { error: "Failed to extend trial" },
        { status: 500 }
      );
    }

    // Log analytics
    await serviceClient.from("analytics_events").insert({
      contractor_id: id,
      event_type: "trial_extended_by_admin",
      metadata: {
        days_extended: days,
        extended_by: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Trial extended by ${days} days`,
    });
  } catch (error) {
    console.error("Admin extend trial error:", error);
    return NextResponse.json(
      { error: "Failed to extend trial" },
      { status: 500 }
    );
  }
}
