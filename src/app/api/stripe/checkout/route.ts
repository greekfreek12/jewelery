import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { stripe, PLANS } from "@/lib/stripe/config";

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

    // Get contractor record
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, email, business_name, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = contractor.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: contractor.email || user.email,
        name: contractor.business_name || undefined,
        metadata: {
          contractor_id: contractor.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from("contractors")
        .update({ stripe_customer_id: customerId })
        .eq("id", contractor.id);
    }

    // Check if price exists, or create it
    let priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      // Create product and price if not set (first time setup)
      const product = await stripe.products.create({
        name: PLANS.contractor.name,
        description: PLANS.contractor.description,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: PLANS.contractor.price,
        currency: "usd",
        recurring: {
          interval: PLANS.contractor.interval,
        },
      });

      priceId = price.id;
      // Note: You should save this price ID to env for production
      console.log("Created Stripe Price ID:", priceId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=canceled`,
      subscription_data: {
        metadata: {
          contractor_id: contractor.id,
        },
        trial_period_days: 14, // 14-day free trial
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
