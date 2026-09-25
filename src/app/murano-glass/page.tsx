import { siteBaseUrl } from "@/lib/site-url";
import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getMuranoGuideContent } from "@/lib/murano-guide-content";
import { localizedName } from "@/lib/product-i18n";
import { absoluteUrl, toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { AnimatedHeading } from "@/components/animated-heading";
import { Reveal } from "@/components/reveal";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";

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

      <ShelfHead
        width="lg"
        heading={<AnimatedHeading text={content.title} className="shop-title" />}
      >
        <Reveal delayMs={150}>
          <p className="shop-lede max-w-2xl">{content.intro}</p>
        </Reveal>
      </ShelfHead>
      <ShelfBody width="lg" editorial airy>
        <Reveal>
          <AnimatedHeading as="h2" text={content.historyTitle} className="shop-h2-plain" />
          <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
            {content.historyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <AnimatedHeading as="h2" text={content.beadsTitle} className="shop-h2-plain" />
          <p className="text-foreground/80 text-sm leading-relaxed">{content.beadsBody}</p>
        </Reveal>

        <Reveal>
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

        <Reveal>
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

        <Reveal>
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
          <Reveal>
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

        <Reveal>
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
