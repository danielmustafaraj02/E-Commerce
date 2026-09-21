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

// Publishable keys are safe to send to the browser by design (Stripe's own
// term for them) — this is not a secret. Used by the Express Checkout
// button (src/components/express-checkout-button.tsx), which still keeps
// PCI scope at SAQ A: Stripe's Elements render in a Stripe-controlled
// iframe and tokenize client-side, the same guarantee Hosted Checkout gives,
// just embedded on this page instead of after a redirect.
export async function getStripePublishableKey() {
  const settings = await getStoreSettings();
  return settings.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || null;
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
