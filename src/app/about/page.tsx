import Link from "next/link";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toSafeJsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  // A specific, keyword-carrying description (rather than the generic
  // layout fallback) — this page's own content (history, techniques,
  // authenticity) is exactly what people search and what AI answer engines
  // look to cite, so it benefits from a distinct <title>/description.
  const description =
    locale === "en"
      ? `The history of Murano glassmaking, the techniques behind ${settings.storeName}'s pieces, and how to tell genuine hand-blown glass from imitations.`
      : `La storia della lavorazione del vetro di Murano, le tecniche dietro i pezzi di ${settings.storeName} e come riconoscere il vetro autentico soffiato a mano dalle imitazioni.`;
  const image = ogImage(settings);
  return {
    title: dict.about.title,
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: dict.about.title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.about.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AboutPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);

  const values = [
    { title: dict.about.value1Title, body: dict.about.value1Body },
    { title: dict.about.value2Title, body: dict.about.value2Body },
    { title: dict.about.value3Title, body: dict.about.value3Body },
  ];

  // FAQPage is one of the schema types AI answer engines lean on most
  // heavily when quoting a source directly, and it can also surface as an
  // expandable rich result in Google — the visible <details> below is what
  // makes this markup honest rather than hidden/cloaked content.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.about.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(faqJsonLd) }}
      />
      <h1 className="mb-6 text-3xl font-semibold">{dict.about.title}</h1>
      <p className="text-foreground/80 max-w-2xl text-lg">{dict.about.intro(settings.storeName)}</p>

      <h2 className="mt-12 mb-4 text-xl font-medium">{dict.about.heritageTitle}</h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        <p>{dict.about.heritageBody1}</p>
        <p>{dict.about.heritageBody2}</p>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-medium">{dict.about.techniquesTitle}</h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        <p>{dict.about.techniquesBody}</p>
      </div>

      <h2 id="authenticity" className="mt-10 mb-4 scroll-mt-20 text-xl font-medium">
        {dict.about.authenticityTitle}
      </h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        <p>{dict.about.authenticityBody}</p>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-medium">{dict.about.faqTitle}</h2>
      <div className="divide-foreground/10 flex flex-col divide-y">
        {dict.about.faq.map((item) => (
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

      <h2 className="mt-12 mb-6 text-xl font-medium">{dict.about.valuesTitle}</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="border-foreground/10 rounded border p-5">
            <h3 className="mb-2 font-medium">{value.title}</h3>
            <p className="text-foreground/70 text-sm">{value.body}</p>
          </div>
        ))}
      </div>

      <p className="text-foreground/70 mt-12 text-sm">
        {dict.about.contactCta}
        <Link href="/contact" className="text-primary underline">
          {dict.about.contactLink}
        </Link>
      </p>
    </main>
  );
}
