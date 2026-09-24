import { cache } from "react";
import { db } from "@/lib/db";

export type StoreSettings = Awaited<ReturnType<typeof getStoreSettings>>;

const defaults = {
  id: "default",
  storeName: "My Store",
  logoUrl: null as string | null,
  primaryColor: "#123D43",
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
  giftCardEnabled: false,
  giftCardPrice: 500,
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

// Next.js replaces `openGraph`/`twitter` wholesale per route rather than
// deep-merging them with the root layout's — so any page that returns its
// own `openGraph` object needs to set `images` itself, or the social
// preview silently loses it. Centralized here so every page falls back to
// the same social image the root layout uses.
export function ogImage(settings: Pick<StoreSettings, "ogImageUrl" | "logoUrl">) {
  return settings.ogImageUrl || settings.logoUrl || undefined;
}

// The header falls back to the bundled /public/logo.png whenever no admin
// logo has been uploaded yet (e.g. before first setup, or if it's cleared).
export function logoSrc(logoUrl: string | null) {
  return logoUrl || "/logo.png";
}

// The bundled logo is a 1808px PNG (~200 KB) — right for emails and social
// previews, far too heavy for a ~50px-tall header slot on every page. The
// header uses a 3x-resolution WebP copy instead; an admin-uploaded logo is
// used as-is.
export function headerLogoSrc(logoUrl: string | null) {
  return !logoUrl || logoUrl === "/logo.png" ? "/logo-header.webp" : logoUrl;
}
