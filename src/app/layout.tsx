import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { homeFontClasses } from "./home-fonts";
import { getStoreSettings } from "@/lib/store-settings";
import { ogLocale, ogAlternateLocales } from "@/lib/hreflang";
import { absoluteUrl, isPlaceholderCompany, toSafeJsonLd } from "@/lib/json-ld";
import { isStripeConfigured } from "@/lib/stripe";
import { isPaypalConfigured } from "@/lib/paypal";
import { getLocale, localeDir } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getShippingBanner } from "@/lib/shipping-banner";
import { FloatingCheckoutButton } from "@/components/floating-checkout-button";
import { CookieConsent } from "@/components/cookie-consent";
import { ConsentGatedAnalytics } from "@/components/consent-gated-analytics";
import "./globals.css";

// Only admin screens use the monospace face, so don't preload it on every
// storefront page, where it competed with the hero image.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  preload: false,
  subsets: ["latin"],
});

function siteUrl(settings: Awaited<ReturnType<typeof getStoreSettings>>) {
  return settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const description = settings.metaDescription || `Shop at ${settings.storeName}`;
  const ogImage = settings.ogImageUrl || settings.logoUrl;
  const base = siteUrl(settings);

  return {
    metadataBase: new URL(base),
    title: { default: settings.storeName, template: `%s | ${settings.storeName}` },
    description,
    openGraph: {
      title: settings.storeName,
      description,
      url: base,
      siteName: settings.storeName,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: settings.storeName,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: settings.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
    // Lets "Add to Home Screen" launch without Safari/Chrome browser chrome —
    // manifest.ts covers Android/Chrome, this covers iOS Safari, which
    // ignores most of the manifest and needs its own meta tags.
    appleWebApp: {
      capable: true,
      title: settings.storeName,
      statusBarStyle: "default",
    },
  };
}

// viewportFit: "cover" lets the page draw under the notch/home-indicator
// safe areas instead of leaving a hard browser-chrome band there — the
// components that actually sit near an edge (floating-checkout-button,
// cookie-consent) add env(safe-area-inset-*) themselves so content doesn't
// end up under the home indicator once this is on. themeColor tints the
// browser's own address bar/status bar — white, matching the page itself
// (an earlier version used the brand accent color here, which read as a
// stray colored bar rather than a page background).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, locale, cardsEnabled, paypalEnabled] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    isStripeConfigured(),
    isPaypalConfigured(),
  ]);
  const dict = getDictionary(locale);
  const social = {
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    twitterUrl: settings.twitterUrl,
    tiktokUrl: settings.tiktokUrl,
    youtubeUrl: settings.youtubeUrl,
    linkedinUrl: settings.linkedinUrl,
  };
  const shippingBanner = await getShippingBanner(
    dict.product.shippingBanner,
    settings.defaultCurrency,
    settings.defaultLocale
  );

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      className={`${homeFontClasses} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--store-primary": settings.primaryColor,
          "--store-secondary": settings.secondaryColor,
        } as React.CSSProperties
      }
    >
      <head>
        {/* Organization structured data for Google's Knowledge Panel / rich
            results. type=application/ld+json is inert data, not an executable
            script, so it isn't subject to the nonce-gated CSP script-src. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toSafeJsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: settings.storeName,
              url: siteUrl(settings),
              ...(settings.logoUrl ? { logo: absoluteUrl(settings.logoUrl, siteUrl(settings)) } : {}),
              ...(!isPlaceholderCompany(settings.companyLegalName)
                ? { legalName: settings.companyLegalName }
                : {}),
              // The seed's placeholder (IT00000000000) must never be published as
              // a real VAT ID.
              ...(settings.vatNumber && !/^[A-Z]{2}0+$/.test(settings.vatNumber)
                ? { vatID: settings.vatNumber }
                : {}),
              ...(settings.contactEmail
                ? {
                    contactPoint: {
                      "@type": "ContactPoint",
                      email: settings.contactEmail,
                      contactType: "customer service",
                    },
                  }
                : {}),
              // Only the social profiles actually configured (Admin >
              // Settings) — an empty array is omitted rather than
              // asserting placeholder links that don't exist.
              ...((() => {
                const sameAs = [
                  settings.facebookUrl,
                  settings.instagramUrl,
                  settings.twitterUrl,
                  settings.tiktokUrl,
                  settings.youtubeUrl,
                  settings.linkedinUrl,
                ].filter((url): url is string => Boolean(url));
                return sameAs.length > 0 ? { sameAs } : {};
              })()),
            }),
          }}
        />
        {/* Lets Google show a sitelinks search box under this site's search
            result, pointing at the existing /products?q= search — no new
            functionality needed, just declaring what already exists. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toSafeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: settings.storeName,
              url: siteUrl(settings),
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl(settings)}/products?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className="bg-background text-foreground flex min-h-full flex-col vc-init"
        style={{ fontFamily: `${settings.fontFamily}, var(--font-sans)` }}
      >
        {/* First tab stop: lets keyboard and screen-reader users jump past the
            header and navigation. Targets the page wrapper in template.tsx. */}
        <a
          href="#main-content"
          className="bg-background text-foreground sr-only rounded px-4 py-2 text-sm font-medium shadow-lg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]"
        >
          {dict.a11y.skipToContent}
        </a>
        <Header
          storeName={settings.storeName}
          logoUrl={settings.logoUrl}
          locale={locale}
          dict={dict}
          social={social}
        />
        {children}
        <FloatingCheckoutButton label={dict.cart.checkout} />
        <Footer
          storeName={settings.storeName}
          contactEmail={settings.contactEmail}
          shippingBanner={shippingBanner}
          dict={dict}
          locale={locale}
          giftCardEnabled={settings.giftCardEnabled}
          social={social}
          payments={{
            cards: cardsEnabled,
            paypal: paypalEnabled,
            klarna: settings.klarnaEnabled,
            bankTransfer: settings.bankTransferEnabled,
          }}
        />
        <CookieConsent dict={dict.cookieConsent} />
        <ConsentGatedAnalytics />
      </body>
    </html>
  );
}
