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

// ---------------------------------------------------------------------------
// Which payment methods to advertise ("we accept" badges)
// ---------------------------------------------------------------------------

/** The Stripe methods this storefront draws a badge for. */
export type StripePaymentMethodId =
  | "klarna"
  | "bancontact"
  | "eps"
  | "satispay"
  | "mbway"
  | "amazonpay";

// Stripe account CAPABILITIES, not a hardcoded list: what Checkout offers is
// decided in Dashboard > Settings > Payment methods, so a list written here
// would start lying the moment one is switched on or off. A capability counts
// only when it is "active" — "pending" means Stripe is still reviewing it and
// the method is not yet offered to anyone.
const BADGE_CAPABILITIES: Record<string, StripePaymentMethodId> = {
  klarna_payments: "klarna",
  bancontact_payments: "bancontact",
  eps_payments: "eps",
  satispay_payments: "satispay",
  mb_way_payments: "mbway",
  amazon_pay_payments: "amazonpay",
};

// One account lookup per hour per key, kept in the module rather than in
// Next's data cache: it is a tiny, account-wide fact, and every page in the
// site renders the footer. A failure is never fatal — the badges simply fall
// back to the methods we can confirm without asking Stripe.
let methodCache: { key: string; at: number; methods: StripePaymentMethodId[] } | null = null;
const METHOD_CACHE_MS = 60 * 60 * 1000;

export async function getStripePaymentMethods(): Promise<StripePaymentMethodId[]> {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) return [];

  if (methodCache?.key === secretKey && Date.now() - methodCache.at < METHOD_CACHE_MS) {
    return methodCache.methods;
  }

  try {
    const stripe = await getStripe();
    // retrieveCurrent(), not retrieve(id): this key's OWN account. Passing an
    // empty id would request /v1/accounts/ instead of /v1/account.
    const account = await stripe.accounts.retrieveCurrent();
    const capabilities = (account.capabilities ?? {}) as Record<string, string | undefined>;
    const methods = Object.entries(BADGE_CAPABILITIES)
      .filter(([capability]) => capabilities[capability] === "active")
      .map(([, id]) => id);
    methodCache = { key: secretKey, at: Date.now(), methods };
    return methods;
  } catch {
    // A restricted key, a network blip or an account that doesn't allow the
    // lookup: show the methods we're sure of rather than failing a page.
    methodCache = { key: secretKey, at: Date.now(), methods: [] };
    return [];
  }
}
