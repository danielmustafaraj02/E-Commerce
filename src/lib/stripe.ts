import Stripe from "stripe";
import { getStoreSettings } from "@/lib/store-settings";

let cached: { key: string; client: Stripe } | null = null;

// Hosted Stripe Checkout only — card data never touches this server, which
// keeps PCI scope at the lowest tier (SAQ A). Don't build a custom card
// form against this client without re-reading that trade-off.
//
// Checks the DB (Admin > Settings > Payments) first, falling back to the
// env var of the same name — either configuration path works.
export async function getStripeSecretKey() {
  const settings = await getStoreSettings();
  return settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || null;
}

export async function getStripeWebhookSecret() {
  const settings = await getStoreSettings();
  return settings.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null;
}

export async function isStripeConfigured() {
  return Boolean(await getStripeSecretKey());
}

export async function getStripe() {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) {
    throw new Error(
      "Stripe is not configured — add a secret key in Admin > Settings > Payments, or set STRIPE_SECRET_KEY."
    );
  }
  if (cached?.key !== secretKey) {
    cached = { key: secretKey, client: new Stripe(secretKey) };
  }
  return cached.client;
}
