import { cache } from "react";
import { db } from "@/lib/db";

export type StoreSettings = Awaited<ReturnType<typeof getStoreSettings>>;

const defaults = {
  id: "default",
  storeName: "My Store",
  logoUrl: null as string | null,
  primaryColor: "#111827",
  secondaryColor: "#4F46E5",
  fontFamily: "Inter",
  defaultCurrency: "EUR",
  defaultLocale: "en-US",
  contactEmail: "hello@example.com",
  vatNumber: null as string | null,
  companyLegalName: null as string | null,
  companyAddress: null as string | null,
  pricesIncludeTax: true,
  freeShippingThreshold: null as number | null,
  trustBadgeText: null as string | null,
  showTestimonials: true,
  siteUrl: null as string | null,
  metaDescription: null as string | null,
  ogImageUrl: null as string | null,
  googleSiteVerification: null as string | null,
  stripeSecretKey: null as string | null,
  stripePublishableKey: null as string | null,
  stripeWebhookSecret: null as string | null,
  klarnaEnabled: false,
  paypalClientId: null as string | null,
  paypalClientSecret: null as string | null,
  paypalWebhookId: null as string | null,
  resendApiKey: null as string | null,
  emailFrom: null as string | null,
  turnstileSiteKey: null as string | null,
  turnstileSecretKey: null as string | null,
  upstashRedisUrl: null as string | null,
  upstashRedisToken: null as string | null,
  googleClientId: null as string | null,
  googleClientSecret: null as string | null,
  bankTransferEnabled: false,
  bankAccountHolder: null as string | null,
  bankIban: null as string | null,
  bankBic: null as string | null,
  codEnabled: false,
  codFee: null as number | null,
  facebookUrl: null as string | null,
  instagramUrl: null as string | null,
  twitterUrl: null as string | null,
  tiktokUrl: null as string | null,
  youtubeUrl: null as string | null,
  linkedinUrl: null as string | null,
};

// Single-row white-label config. Falls back to hardcoded neutral defaults
// only if the row is missing (e.g. before the first seed/admin setup) —
// components should never hardcode brand values themselves.
//
// Wrapped in React's cache() so the many independent call sites (layout,
// header, and nearly every page) that each need this within one request
// share a single DB round trip instead of re-querying per call.
export const getStoreSettings = cache(async () => {
  const settings = await db.storeSettings.findFirst();
  return settings ?? defaults;
});
