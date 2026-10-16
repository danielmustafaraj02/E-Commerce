import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { pageEntries } from "@/lib/page-layout-store";
import type { ABOUT_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import { Link } from "@/components/localized-link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates, localizedCanonical, ogLocale } from "@/lib/hreflang";
import { fitTitle } from "@/lib/seo-text";
import { shareImageUrl } from "@/lib/optimized-image";
import { siteBaseUrl } from "@/lib/site-url";
import { toSafeJsonLd } from "@/lib/json-ld";

const HERO_IMAGE = "/blog/burano-colorful-houses-canal.webp";

// English and Italian: a title that says what the shop is, since "About us"
// alone tells a results page nothing.
const SEARCH_TITLE: Partial<Record<Locale, string>> = {
  en: "About Us: Murano Glass Jewelry, Chosen Piece by Piece",
  it: "Chi siamo: gioielli in vetro di Murano scelti uno a uno",
};
import { AnimatedHeading } from "@/components/animated-heading";
import { Reveal } from "@/components/reveal";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfBody } from "@/components/shelf-page";
import { AboutGondolaArt } from "@/components/about-gondola-art";

async function baseMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  // A specific, keyword-carrying description (rather than the generic
  // layout fallback) — this page's own content (brand story + heritage)
  // is exactly what people search and what AI answer engines look to
  // cite, so it benefits from a distinct <title>/description. The deep
  // technique/authenticity/FAQ content lives on /murano-glass instead.
  const descriptionByLocale: Record<Locale, string> = {
    // Not every piece is made by us, so neither line says it is.
    en: `Who is behind ${settings.storeName}, how we choose each Murano glass necklace, bracelet and pair of earrings, and a short history of glass on Murano.`,
    it: `Chi c'è dietro ${settings.storeName}, come scegliamo ogni collana, bracciale e paio di orecchini in vetro di Murano, e una breve storia del vetro a Murano.`,
    fr: `L'histoire de ${settings.storeName} et de la tradition verrière de Murano, vieille de 700 ans, dans laquelle ses pièces sont réalisées.`,
    de: `Die Geschichte von ${settings.storeName} und der 700 Jahre alten Murano-Glasbläsertradition, in der die Stücke gefertigt werden.`,
    ar: `القصة وراء ${settings.storeName} وتقليد صناعة زجاج مورانو العريق الممتد لسبعمائة عام الذي تُصنع به قطعها.`,
    zh: `${settings.storeName} 背后的故事，以及其作品所传承的七百年穆拉诺玻璃制作传统。`,
    ru: `История ${settings.storeName} и семисотлетняя традиция муранского стеклоделия, в которой изготавливаются его изделия.`,
    es: `La historia detrás de ${settings.storeName} y la tradición vidriera de Murano de 700 años con la que se elaboran sus piezas.`,
    pt: `A história por trás da ${settings.storeName} e da tradição de sete séculos da vidraria de Murano com que as suas peças são feitas.`,
    hi: `${settings.storeName} की कहानी और मुरानो की 700 साल पुरानी कांच-निर्माण परंपरा, जिससे इसके टुकड़े बनाए जाते हैं।`,
    ja: `${settings.storeName}の物語と、その作品が作られる700年の歴史を持つムラノガラス製造の伝統。`,
  };
  const description = descriptionByLocale[locale];
  const title = SEARCH_TITLE[locale] ?? dict.about.title;
  // The page's own photograph where it has one to share.
  const image = SEARCH_TITLE[locale] ? shareImageUrl(HERO_IMAGE) : ogImage(settings);
  return {
    title: fitTitle([title], settings.storeName),
    description,
    alternates: {
      canonical: localizedCanonical(locale, "/about"),
      languages: hreflangAlternates("/about"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: ogLocale(locale),
      images: image ? [{ url: image, alt: dict.about.heritageImageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageMeta("/about", await baseMetadata());
}

type AboutSectionId = (typeof ABOUT_SECTIONS)[number]["id"];

export default async function AboutPage() {
  const entries = await pageEntries("about");
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);

  const values = [
    { title: dict.about.value1Title, body: dict.about.value1Body },
    { title: dict.about.value2Title, body: dict.about.value2Body },
    { title: dict.about.value3Title, body: dict.about.value3Body },
  ];

  const points = [
    { title: dict.home.whyShipping, body: dict.home.whyShippingBody },
    { title: dict.home.whySecure, body: dict.home.whySecureBody },
    { title: dict.home.whyReturns, body: dict.home.whyReturnsBody },
  ];

  const base = siteBaseUrl(settings);
  const pageUrl = `${base}${localizedCanonical(locale, "/about")}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: dict.about.title,
      url: pageUrl,
      inLanguage: locale,
      about: { "@type": "Organization", name: settings.storeName, url: base },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: settings.storeName,
          item: `${base}${localizedCanonical(locale, "/")}`,
        },
        { "@type": "ListItem", position: 2, name: dict.about.title, item: pageUrl },
      ],
    },
  ];

  const sections: Record<AboutSectionId, ReactNode> = {
    hero: (
      <section className="about-hero">
        <Image
          src={HERO_IMAGE}
          alt={dict.about.heritageImageAlt}
          fill
          preload
          sizes="100vw"
          className="about-hero-image"
        />
        <div className="about-hero-shade" aria-hidden="true" />
        <div className="about-hero-copy">
          <p className="about-hero-kicker">Murano · Venezia</p>
          <AnimatedHeading text={dict.about.title} className="about-hero-title" />
          <Reveal delayMs={180}>
            <p className="about-hero-intro">{dict.about.intro(settings.storeName)}</p>
          </Reveal>
        </div>
      </section>
    ),
    body: (
      <ShelfBody width="lg" editorial airy>
        <Reveal>
          <AnimatedHeading as="h2" text={dict.about.heritageTitle} className="shop-h2-plain" />
          <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
            <p>{dict.about.heritageBody1}</p>
            <p>{dict.about.heritageBody2}</p>
            <p>
              {dict.about.guideLinkBody}{" "}
              <Link href="/murano-glass" className="shelf-link underline">
                {dict.about.guideLinkCta}
              </Link>
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="about-values-section">
            <AnimatedHeading as="h2" text={dict.about.valuesTitle} className="shop-h2-plain" />
            <div className="grid gap-6 sm:grid-cols-3">
              {values.map((value, index) => (
                <Reveal key={value.title} delayMs={index * 80}>
                  <div className="shop-panel shop-panel-pad">
                    <h3 className="shop-ui mb-2 font-medium">{value.title}</h3>
                    <p className="text-foreground/70 text-sm">{value.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* "Why choose us": the home page's trust strip, restated here as
            three panels in the same family as the values above — where a
            shopper deciding whether to trust the store actually reads. */}
        <Reveal>
          <div className="about-values-section">
            <AnimatedHeading as="h2" text={dict.home.whyUsTitle} className="shop-h2-plain" />
            <div className="grid gap-6 sm:grid-cols-3">
              {points.map((point, index) => (
                <Reveal key={point.title} delayMs={index * 80}>
                  <div className="shop-panel shop-panel-pad">
                    <h3 className="shop-ui mb-2 font-medium">{point.title}</h3>
                    <p className="text-foreground/70 text-sm">{point.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="text-foreground/70 mt-12 text-sm">
          {dict.about.contactCta}
          <Link href="/contact" className="shelf-link underline">
            {dict.about.contactLink}
          </Link>
        </p>

        <p className="text-foreground/70 mt-2 text-sm">
          {dict.about.friendsIntro}
          <a
            href="https://venetianmuranoglass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shelf-link underline"
          >
            {dict.about.friendsLinkText}
          </a>
          {dict.about.friendsOutro}
        </p>
      </ShelfBody>
    ),
    art: <AboutGondolaArt />,
  };

  return (
    <ShelfMain className="about-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonLd(jsonLd) }} />
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry}>
          {entry.custom ? null : sections[entry.id as AboutSectionId]}
        </LayoutSection>
      ))}
    </ShelfMain>
  );
}
