import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates } from "@/lib/hreflang";
import { AnimatedHeading } from "@/components/animated-heading";
import { Reveal } from "@/components/reveal";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";

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
    ar: `القصة وراء ${settings.storeName} وتقليد صناعة زجاج مورانو العريق الممتد لسبعمائة عام الذي تُصنع به قطعها.`,
    zh: `${settings.storeName} 背后的故事，以及其作品所传承的七百年穆拉诺玻璃制作传统。`,
    ru: `История ${settings.storeName} и семисотлетняя традиция муранского стеклоделия, в которой изготавливаются его изделия.`,
    es: `La historia detrás de ${settings.storeName} y la tradición vidriera de Murano de 700 años con la que se elaboran sus piezas.`,
    pt: `A história por trás da ${settings.storeName} e da tradição de sete séculos da vidraria de Murano com que as suas peças são feitas.`,
    hi: `${settings.storeName} की कहानी और मुरानो की 700 साल पुरानी कांच-निर्माण परंपरा, जिससे इसके टुकड़े बनाए जाते हैं।`,
    ja: `${settings.storeName}の物語と、その作品が作られる700年の歴史を持つムラノガラス製造の伝統。`,
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
    <ShelfMain>
      <ShelfHead
        width="lg"
        heading={<AnimatedHeading text={dict.about.title} className="shop-title" />}
      >
        <Reveal delayMs={150}>
          <p className="shop-lede max-w-2xl">{dict.about.intro(settings.storeName)}</p>
        </Reveal>
      </ShelfHead>
      <ShelfBody width="lg" editorial airy>
        <Reveal delayMs={250}>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/about/venice-moored-gondolas.jpg"
              alt={dict.about.heritageImageAlt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

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
    </ShelfMain>
  );
}
