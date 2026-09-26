import { siteBaseUrl } from "@/lib/site-url";
import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getMuranoGuideContent } from "@/lib/murano-guide-content";
import { localizedName } from "@/lib/product-i18n";
import { absoluteUrl, toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { AnimatedHeading } from "@/components/animated-heading";
import { Reveal } from "@/components/reveal";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfBody } from "@/components/shelf-page";
import { MuranoFurnaceArt, MuranoSeagullArt } from "@/components/murano-guide-art";
import { SeagullFlight } from "@/components/seagull-flight";

const GUIDE_ART_CAPTIONS: Record<Locale, { furnace: string }> = {
  en: { furnace: "Inside a Murano furnace" },
  it: { furnace: "Dentro una fornace di Murano" },
  fr: { furnace: "Dans un four de Murano" },
  de: { furnace: "In einem Murano-Glasofen" },
  ar: { furnace: "داخل فرن مورانو" },
  zh: { furnace: "穆拉诺玻璃窑炉" },
  ru: { furnace: "В печи Мурано" },
  es: { furnace: "Dentro de un horno de Murano" },
  pt: { furnace: "Dentro de um forno de Murano" },
  hi: { furnace: "मुरानो की भट्टी के भीतर" },
  ja: { furnace: "ムラーノのガラス窯" },
};

// Cycled across the numbered care-step badges below so the list reads as a
// row of distinct steps at a glance, not one flat brand-colored repeat.
const STEP_NUMBER_COLORS = ["bg-accent/10 text-accent-deep"];

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const content = getMuranoGuideContent(locale);
  const image = ogImage(settings);
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: {
      canonical: localizedCanonical(locale, "/murano-glass"),
      languages: hreflangAlternates("/murano-glass"),
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function MuranoGlassGuidePage() {
  const [settings, locale, categories] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
  ]);
  const content = getMuranoGuideContent(locale);
  const artCaptions = GUIDE_ART_CAPTIONS[locale];
  const base = siteBaseUrl(settings);
  const pageUrl = `${base}/murano-glass`;
  const image = ogImage(settings);

  // Google's Article rich-result guidelines require an `image`, unlike the
  // metadata-only OG/Twitter tags above — same image, since the page has no
  // dedicated hero photo of its own to point to instead.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.metaDescription,
    image: image ? [absoluteUrl(image, base)] : undefined,
    inLanguage: locale,
    mainEntityOfPage: pageUrl,
    author: { "@type": "Organization", name: settings.storeName },
    publisher: { "@type": "Organization", name: settings.storeName },
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content.careTitle,
    description: content.careIntro,
    step: content.careSteps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.body,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: settings.storeName, item: base || undefined },
      { "@type": "ListItem", position: 2, name: content.title, item: pageUrl },
    ],
  };

  return (
    <ShelfMain>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(breadcrumbJsonLd) }}
      />

      <header className="shop-head murano-guide-head">
        <div className="shelf-wrap--wide murano-guide-hero">
          <div className="murano-guide-hero-copy">
            <p className="murano-guide-kicker">Murano · Venezia</p>
            <AnimatedHeading text={content.title} className="shop-title murano-guide-title" />
            <Reveal delayMs={150}>
              <p className="murano-guide-intro">{content.intro}</p>
            </Reveal>
          </div>
          <div className="murano-gondola-scene" aria-hidden="true">
            <svg viewBox="0 0 560 560" role="presentation" focusable="false">
              <defs>
                <linearGradient id="lagoon-sky" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0" stopColor="#eee8dc" />
                  <stop offset="0.58" stopColor="#d7c5a4" />
                  <stop offset="1" stopColor="#b7c9c5" />
                </linearGradient>
                <linearGradient id="lagoon-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7c9c99" />
                  <stop offset="1" stopColor="#123d43" />
                </linearGradient>
                <linearGradient id="arch-wash" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fffaf0" stopOpacity="0.64" />
                  <stop offset="1" stopColor="#b89a62" stopOpacity="0.08" />
                </linearGradient>
                <clipPath id="scene-clip">
                  <rect x="0" y="0" width="560" height="560" rx="3" />
                </clipPath>
              </defs>
              <g clipPath="url(#scene-clip)">
                <rect width="560" height="560" fill="url(#lagoon-sky)" />
                <circle cx="394" cy="126" r="71" fill="#fff9e9" opacity="0.7" />
                <circle cx="394" cy="126" r="93" fill="none" stroke="#fff9e9" strokeOpacity="0.5" />
                <path className="venetian-gull venetian-gull--one" d="M202 171q9-8 18 0t18 0" />
                <path className="venetian-gull venetian-gull--two" d="M276 136q7-6 14 0t14 0" />
                <path className="venetian-gull venetian-gull--three" d="M244 208q6-5 12 0t12 0" />
                <path d="M42 338V186c0-102 73-168 168-168s168 66 168 168v152" fill="url(#arch-wash)" stroke="#fff7e8" strokeOpacity="0.74" strokeWidth="2" />
                <path d="M68 337V188c0-87 60-143 142-143s142 56 142 143v149" fill="none" stroke="#b89a62" strokeOpacity="0.3" />
                <path d="M0 284h92v53H0zm94-35h70v88H94zm72 17h67v71h-67zm70-44h56v115h-56zm61 33h95v82h-95zm98-47h72v129h-72zm74 22h91v107h-91z" fill="#5e6d68" opacity="0.42" />
                <path d="M0 313h104v24H0zm106-49h62v49h-62zm64 12h67v37h-67zm70-47h59v72h-59zm61 31h94v41h-94zm96-39h66v80h-66zm68 18h95v62h-95z" fill="#fcf7ed" opacity="0.64" />
                <path d="M0 335h560v225H0z" fill="url(#lagoon-water)" />
                <path className="gondola-ripple gondola-ripple--one" d="M18 386c50-8 95-8 142 0m206-1c57-8 111-8 166 0M67 435c48-6 91-6 134 0m208 1c42-6 82-6 124 0" fill="none" stroke="#e2d7c3" strokeOpacity="0.4" strokeWidth="1.4" />
                <path className="gondola-ripple gondola-ripple--two" d="M-10 468c56-7 105-7 156 0m222-1c57-7 111-7 171 0M19 523c46-6 91-6 137 0m217 0c49-6 101-6 154 0" fill="none" stroke="#e2d7c3" strokeOpacity="0.27" strokeWidth="1.2" />
                {/* One clean crescent hull, stern (left) and prow (right)
                    rising, with the gondolier standing on the stern. */}
                <g className="gondola-boat">
                  <ellipse cx="282" cy="447" rx="172" ry="7" fill="#0b2a2e" opacity="0.28" />
                  <path
                    d="M86 380C120 398 190 404 280 404C370 404 430 398 474 360C462 402 404 438 284 440C170 442 112 420 86 380Z"
                    fill="#102f33"
                  />
                  <path
                    d="M100 391C170 404 380 406 462 372"
                    fill="none"
                    stroke="#c3a264"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M472 362q9-9 7-25" fill="none" stroke="#b89a62" strokeWidth="4" strokeLinecap="round" />
                  <path d="M216 405q6-13 12 0" fill="none" stroke="#b89a62" strokeWidth="3" strokeLinecap="round" />

                  <g className="gondolier-body">
                    <path d="M151 311c5 11 14 19 25 15" fill="none" stroke="#9c6a51" strokeWidth="6" strokeLinecap="round" />
                    <path d="M150 347h22l3 49h-8l-6-36-6 36h-8Z" fill="#173a3d" />
                    <path d="M143 397.5h12m10 0h13" stroke="#0c2427" strokeWidth="3.4" strokeLinecap="round" />
                    <path
                      d="M148 313c1-6 6-8 13-8s12 2 13 8l-2 35h-22Z"
                      fill="#f8f3ea"
                      stroke="#123d43"
                      strokeOpacity="0.35"
                    />
                    <path d="M150 318h22M150 326h22M150.5 334h21M150.5 342h21" stroke="#123d43" strokeWidth="2.2" />
                    <path d="M150 347.5h22" stroke="#b89a62" strokeWidth="3" />
                    <path d="M158 301h6v6h-6Z" fill="#ad775c" />
                    <circle cx="161" cy="294" r="9.5" fill="#ad775c" />
                    <path d="M150.5 283v-9q0-3 3-3h15q3 0 3 3v9Z" fill="#b89a62" />
                    <path d="M150.5 279.5h21" stroke="#123d43" strokeWidth="3.5" />
                    <ellipse cx="161" cy="284" rx="17" ry="3" fill="#b89a62" />
                    <g className="gondolier-oar">
                      <path d="M170 316 252 456" stroke="#4b3328" strokeWidth="5" strokeLinecap="round" />
                      <path d="M245 444 254 460" stroke="#4b3328" strokeWidth="9" strokeLinecap="round" />
                      <path d="M236 462q16 6 32 0" fill="none" stroke="#e2d7c3" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                    <path d="M171 310c9 6 15 20 17 36" fill="none" stroke="#ad775c" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="176" cy="326" r="3.4" fill="#9c6a51" />
                    <circle cx="188" cy="347" r="3.4" fill="#ad775c" />
                  </g>
                </g>
                <path d="M0 336h560" stroke="#f6f0e4" strokeOpacity="0.76" strokeWidth="2" />
                <path d="M28 38h504M28 522h504" stroke="#fff8ed" strokeOpacity="0.44" />
                <text x="34" y="500" fill="#fff8ed" fillOpacity="0.75" fontFamily="Georgia,serif" fontSize="12" letterSpacing="3">LAGUNA VENEZIANA</text>
              </g>
            </svg>
          </div>
        </div>
      </header>
      <ShelfBody width="full" editorial airy className="murano-guide-body">
        <Reveal className="murano-guide-section">
          <AnimatedHeading as="h2" text={content.historyTitle} className="shop-h2-plain" />
          <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
            {content.historyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal className="murano-guide-art-reveal">
          <MuranoFurnaceArt caption={artCaptions.furnace} />
        </Reveal>

        <Reveal className="murano-guide-section">
          <AnimatedHeading as="h2" text={content.beadsTitle} className="shop-h2-plain" />
          <p className="text-foreground/80 text-sm leading-relaxed">{content.beadsBody}</p>
        </Reveal>

        <Reveal className="murano-guide-art-reveal murano-guide-art-reveal--seagull">
          <MuranoSeagullArt />
        </Reveal>
        {/* His chick: waits under the big gull's legs, then flies down the
            page to the footer as you scroll. */}
        <SeagullFlight from=".murano-art-scene--seagull .seagull-legs" lane=".murano-guide-section" />

        <Reveal className="murano-guide-section">
          <AnimatedHeading
            as="h2"
            id="techniques"
            text={content.techniquesTitle}
            className="shop-h2-plain scroll-mt-20"
          />
          <div className="flex flex-col gap-5">
            {content.techniques.map((technique) => (
              <div key={technique.name}>
                <h3 className="shop-ui text-sm font-semibold">{technique.name}</h3>
                <p className="text-foreground/80 mt-1 text-sm leading-relaxed">{technique.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="murano-guide-section">
          <AnimatedHeading
            as="h2"
            id="authenticity"
            text={content.authenticityTitle}
            className="shop-h2-plain scroll-mt-20"
          />
          <p className="text-foreground/80 text-sm leading-relaxed">{content.authenticityIntro}</p>
          <ul className="text-foreground/80 mt-4 flex flex-col gap-2 text-sm leading-relaxed">
            {content.authenticitySigns.map((sign, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">&middot;</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="murano-guide-section">
          <AnimatedHeading
            as="h2"
            id="care"
            text={content.careTitle}
            className="shop-h2-plain scroll-mt-20"
          />
          <p className="text-foreground/80 mb-4 text-sm leading-relaxed">{content.careIntro}</p>
          <ol className="flex flex-col gap-4">
            {content.careSteps.map((step, index) => (
              <li key={step.name} className="flex gap-3">
                <span
                  className={`${STEP_NUMBER_COLORS[index % STEP_NUMBER_COLORS.length]} flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="text-sm font-medium">{step.name}</span>
                  <span className="text-foreground/80 mt-0.5 block text-sm leading-relaxed">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        {categories.length > 0 && (
          <Reveal className="murano-guide-cta-wrap">
            <div className="shop-panel shop-cta p-6">
              <h2 className="shop-cta-title">{content.shopCtaTitle}</h2>
              <p className="text-foreground/70 mb-4 text-sm">{content.shopCtaBody}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`} className="shop-chip">
                    {localizedName(category, locale)}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal className="murano-guide-section">
          <AnimatedHeading
            as="h2"
            id="faq"
            text={content.faqTitle}
            className="shop-h2-plain scroll-mt-20"
          />
          <div className="divide-foreground/10 flex flex-col divide-y">
            {content.faq.map((item) => (
              <details key={item.question} className="group py-3">
                <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">
                    &rsaquo;
                  </span>
                  {item.question}
                </summary>
                <p className="text-foreground/70 mt-2 pl-5 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </ShelfBody>
    </ShelfMain>
  );
}
