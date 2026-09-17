import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getMuranoGuideContent } from "@/lib/murano-guide-content";
import { localizedName } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const content = getMuranoGuideContent(locale);
  const image = ogImage(settings);
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: "/murano-glass", languages: hreflangAlternates("/murano-glass") },
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
  const base = settings.siteUrl || "";
  const pageUrl = `${base}/murano-glass`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.metaDescription,
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
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

      <h1 className="mb-6 text-3xl font-semibold">{content.title}</h1>
      <p className="text-foreground/80 max-w-2xl text-lg leading-relaxed">{content.intro}</p>

      <h2 className="mt-12 mb-4 text-xl font-medium">{content.historyTitle}</h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        {content.historyParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-medium">{content.beadsTitle}</h2>
      <p className="text-foreground/80 text-sm leading-relaxed">{content.beadsBody}</p>

      <h2 id="techniques" className="mt-12 mb-4 scroll-mt-20 text-xl font-medium">
        {content.techniquesTitle}
      </h2>
      <div className="flex flex-col gap-5">
        {content.techniques.map((technique) => (
          <div key={technique.name}>
            <h3 className="text-sm font-semibold">{technique.name}</h3>
            <p className="text-foreground/80 mt-1 text-sm leading-relaxed">{technique.body}</p>
          </div>
        ))}
      </div>

      <h2 id="authenticity" className="mt-12 mb-4 scroll-mt-20 text-xl font-medium">
        {content.authenticityTitle}
      </h2>
      <p className="text-foreground/80 text-sm leading-relaxed">{content.authenticityIntro}</p>
      <ul className="text-foreground/80 mt-4 flex flex-col gap-2 text-sm leading-relaxed">
        {content.authenticitySigns.map((sign, index) => (
          <li key={index} className="flex gap-2">
            <span aria-hidden="true">&middot;</span>
            <span>{sign}</span>
          </li>
        ))}
      </ul>

      <h2 id="care" className="mt-12 mb-2 scroll-mt-20 text-xl font-medium">
        {content.careTitle}
      </h2>
      <p className="text-foreground/80 mb-4 text-sm leading-relaxed">{content.careIntro}</p>
      <ol className="flex flex-col gap-4">
        {content.careSteps.map((step, index) => (
          <li key={step.name} className="flex gap-3">
            <span
              className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
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

      {categories.length > 0 && (
        <div className="border-foreground/10 mt-12 rounded-lg border p-6">
          <h2 className="mb-2 text-lg font-medium">{content.shopCtaTitle}</h2>
          <p className="text-foreground/70 mb-4 text-sm">{content.shopCtaBody}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="border-foreground/20 hover:border-primary hover:text-primary rounded border px-3 py-1.5"
              >
                {localizedName(category, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 id="faq" className="mt-12 mb-4 scroll-mt-20 text-xl font-medium">
        {content.faqTitle}
      </h2>
      <div className="divide-foreground/10 flex flex-col divide-y">
        {content.faq.map((item) => (
          <details key={item.question} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90">
                &rsaquo;
              </span>
              {item.question}
            </summary>
            <p className="text-foreground/70 mt-2 pl-5 text-sm leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
