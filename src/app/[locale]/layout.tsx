import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/locale";
import { SiteDocument, siteMetadata, siteViewport } from "@/components/site-document";

// The storefront's root layout. The locale is the first path segment
// (/it/products/…): a root parameter, so any server component can read it
// (lib/i18n/locale.ts) and pages can be prerendered and cached per language
// instead of rendered on every request.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
// Cached pages are rebuilt in the background at most every 5 minutes, and
// immediately after an admin edit (see lib/cache-tags.ts and the admin
// actions). Pages that read the visitor's session, cookies or search
// parameters (cart, checkout, account, filtered listings) stay per request.
export const revalidate = 300;

export const viewport: Viewport = siteViewport;

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata();
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // Only the site's languages exist: /zz/… is a 404. (Not `dynamicParams =
  // false` here: Next applies that to every route below, and product, look
  // and article pages are rendered on their first visit.)
  if (!locales.includes(locale as Locale)) notFound();
  return <SiteDocument>{children}</SiteDocument>;
}
