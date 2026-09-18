import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates } from "@/lib/hreflang";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);
  // A specific, keyword-carrying description (rather than the generic
  // layout fallback) — this page's own content (brand story + heritage)
  // is exactly what people search and what AI answer engines look to
  // cite, so it benefits from a distinct <title>/description. The deep
  // technique/authenticity/FAQ content lives on /murano-glass instead.
  const descriptionByLocale: Record<Locale, string> = {
    en: `The story behind ${settings.storeName} and the 700-year Murano glassmaking tradition its pieces are made in.`,
    it: `La storia di ${settings.storeName} e la tradizione vetraria muranese di 700 anni con cui sono realizzati i suoi pezzi.`,
    fr: `L'histoire de ${settings.storeName} et de la tradition verrière de Murano, vieille de 700 ans, dans laquelle ses pièces sont réalisées.`,
    de: `Die Geschichte von ${settings.storeName} und der 700 Jahre alten Murano-Glasbläsertradition, in der die Stücke gefertigt werden.`,
  };
  const description = descriptionByLocale[locale];
  const image = ogImage(settings);
  return {
    title: dict.about.title,
    description,
    alternates: { canonical: "/about", languages: hreflangAlternates("/about") },
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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">{dict.about.title}</h1>
      <p className="text-foreground/80 max-w-2xl text-lg">{dict.about.intro(settings.storeName)}</p>

      <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
        <Image
          src="/about/venice-murano-shopfront.jpg"
          alt={dict.about.heritageImageAlt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>

      <h2 className="mt-12 mb-4 text-xl font-medium">{dict.about.heritageTitle}</h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        <p>{dict.about.heritageBody1}</p>
        <p>{dict.about.heritageBody2}</p>
        <p>
          {dict.about.guideLinkBody}{" "}
          <Link href="/murano-glass" className="text-primary underline">
            {dict.about.guideLinkCta}
          </Link>
        </p>
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
