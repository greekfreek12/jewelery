import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createApiServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractorId = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription as string))
              .metadata.contractor_id
          : null;

        if (contractorId) {
          await supabase
            .from("contractors")
            .update({
              subscription_status: "trialing",
              stripe_customer_id: session.customer as string,
            })
            .eq("id", contractorId);

          // Log analytics event
          await supabase.from("analytics_events").insert({
            contractor_id: contractorId,
            event_type: "subscription_started",
            metadata: {
              subscription_id: session.subscription,
              status: "trialing",
            },
          });
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata.contractor_id;

        if (contractorId) {
          await supabase
            .from("contractors")
            .update({
              subscription_status: subscription.status,
            })
            .eq("id", contractorId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata.contractor_id;

        if (contractorId) {
          await supabase
            .from("contractors")
            .update({
              subscription_status: subscription.status,
            })
            .eq("id", contractorId);

          // Log status change
          await supabase.from("analytics_events").insert({
            contractor_id: contractorId,
            event_type: "subscription_updated",
            metadata: {
              subscription_id: subscription.id,
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata.contractor_id;

        if (contractorId) {
          await supabase
            .from("contractors")
            .update({
              subscription_status: "canceled",
            })
            .eq("id", contractorId);

          // Log churn
          await supabase.from("analytics_events").insert({
            contractor_id: contractorId,
            event_type: "subscription_canceled",
            metadata: {
              subscription_id: subscription.id,
              canceled_at: subscription.canceled_at,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as { subscription?: string }).subscription;

        if (subscriptionId) {
          const subscription = subscriptionId as string;
          const sub = await stripe.subscriptions.retrieve(subscription);
          const contractorId = sub.metadata.contractor_id;

          if (contractorId) {
            await supabase
              .from("contractors")
              .update({
                subscription_status: "active",
              })
              .eq("id", contractorId);

            // Log successful payment
            await supabase.from("analytics_events").insert({
              contractor_id: contractorId,
              event_type: "payment_succeeded",
              metadata: {
                invoice_id: invoice.id,
                amount: invoice.amount_paid,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as { subscription?: string }).subscription;

        if (subscriptionId) {
          const subscription = subscriptionId as string;
          const sub = await stripe.subscriptions.retrieve(subscription);
          const contractorId = sub.metadata.contractor_id;

          if (contractorId) {
            await supabase
              .from("contractors")
              .update({
                subscription_status: "past_due",
              })
              .eq("id", contractorId);

            // Log failed payment (churn risk indicator)
            await supabase.from("analytics_events").insert({
              contractor_id: contractorId,
              event_type: "payment_failed",
              metadata: {
                invoice_id: invoice.id,
                attempt_count: invoice.attempt_count,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // 3 days before trial ends
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata.contractor_id;

        if (contractorId) {
          await supabase.from("analytics_events").insert({
            contractor_id: contractorId,
            event_type: "trial_ending_soon",
            metadata: {
              subscription_id: subscription.id,
              trial_end: subscription.trial_end,
            },
          });
          // TODO: Send email reminder about trial ending
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
