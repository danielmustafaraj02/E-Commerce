import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { getStoreSettings } from "@/lib/store-settings";
import { hreflangAlternates } from "@/lib/hreflang";
import { toSafeJsonLd } from "@/lib/json-ld";
import { isStripeConfigured } from "@/lib/stripe";
import { isPaypalConfigured } from "@/lib/paypal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function siteUrl(settings: Awaited<ReturnType<typeof getStoreSettings>>) {
  return settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const description = settings.metaDescription || `Shop at ${settings.storeName}`;
  const ogImage = settings.ogImageUrl || settings.logoUrl;
  const base = siteUrl(settings);

  return {
    metadataBase: new URL(base),
    title: { default: settings.storeName, template: `%s | ${settings.storeName}` },
    description,
    alternates: { canonical: "/", languages: hreflangAlternates("/") },
    openGraph: {
      title: settings.storeName,
      description,
      url: base,
      siteName: settings.storeName,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
      locale: "en_US",
      alternateLocale: ["it_IT"],
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
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, locale, cardsEnabled, paypalEnabled] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    isStripeConfigured(),
    isPaypalConfigured(),
  ]);
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
              ...(settings.logoUrl ? { logo: settings.logoUrl } : {}),
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
        className="bg-background text-foreground flex min-h-full flex-col"
        style={{ fontFamily: `${settings.fontFamily}, var(--font-sans)` }}
      >
        <Header
          storeName={settings.storeName}
          logoUrl={settings.logoUrl}
          locale={locale}
          dict={dict}
        />
        {children}
        <Footer
          storeName={settings.storeName}
          contactEmail={settings.contactEmail}
          dict={dict}
          social={{
            facebookUrl: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            twitterUrl: settings.twitterUrl,
            tiktokUrl: settings.tiktokUrl,
            youtubeUrl: settings.youtubeUrl,
            linkedinUrl: settings.linkedinUrl,
          }}
          payments={{
            cards: cardsEnabled,
            paypal: paypalEnabled,
            klarna: settings.klarnaEnabled,
            bankTransfer: settings.bankTransferEnabled,
            cashOnDelivery: settings.codEnabled,
          }}
        />
        <CookieConsent dict={dict.cookieConsent} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
