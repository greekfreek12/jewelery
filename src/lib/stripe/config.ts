import Stripe from "stripe";

// Server-only Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Re-export plans for convenience in server code
export { PLANS } from "./plans";

// Stripe price ID will be created dynamically or set in env
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
