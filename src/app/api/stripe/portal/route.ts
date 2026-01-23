import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { stripe } from "@/lib/stripe/config";

export async function POST() {
  try {
    const supabase = await createApiClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get contractor's Stripe customer ID
    const { data: contractor } = await supabase
      .from("contractors")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!contractor?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: contractor.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
