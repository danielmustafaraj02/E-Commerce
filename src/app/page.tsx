import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import { Link } from "@/components/localized-link";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { fitTitle } from "@/lib/seo-text";
import { truncateAtWord } from "@/lib/text";
import { CatalogImage } from "@/components/catalog-image";
import { AnimatedHeading } from "@/components/animated-heading";
import { ShelfItem } from "@/components/shelf-item";
import { CategoryStrip } from "@/components/category-strip";
import { Reveal } from "@/components/reveal";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { FaqSection } from "@/components/faq-section";
import { buildFaq } from "@/lib/faq";
import { getShippingFacts } from "@/lib/shipping-banner";
import { GiftFinderArrow } from "@/components/gift-finder-arrow";
import { HeroNecklaceCarousel, type HeroSlide } from "@/components/hero-necklace-carousel";
import { db } from "@/lib/db";
import { getAllLooks } from "@/lib/look-data";
import { LookCard } from "@/components/look-card";
import { ComposePromo } from "@/components/compose-promo";
import { GiftCardAd } from "@/components/gift-card-ad";
import { formatMoney } from "@/lib/format";
import { homeFontClasses } from "./home-fonts";
import "./home.css";

// "Murano Glass Jewelry" in the locale's own words, same idea as the keyword
// carried in products/[slug]/page.tsx and category/[slug]/page.tsx — the
// homepage is the single highest-authority URL on the site, so it shouldn't
// be the one page whose <title>/description fall through to the root
// layout's bare store name and generic "Shop at {storeName}" default.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);

  const titleCandidatesByLocale: Record<Locale, string[]> = {
    en: ["Murano Glass Jewelry, Handmade in Venice, Italy", "Murano Glass Jewelry"],
    it: ["Gioielli in Vetro di Murano, Fatti a Mano a Venezia", "Gioielli in Vetro di Murano"],
    fr: ["Bijoux en Verre de Murano, Faits Main à Venise", "Bijoux en Verre de Murano"],
    de: ["Muranoglas-Schmuck, Handgefertigt in Venedig", "Muranoglas-Schmuck"],
    ar: ["مجوهرات زجاج مورانو، صناعة يدوية في البندقية", "مجوهرات زجاج مورانو"],
    zh: ["穆拉诺玻璃珠宝，威尼斯手工制作", "穆拉诺玻璃珠宝"],
    ru: ["Ювелирные изделия из муранского стекла, Венеция", "Муранское стекло"],
    es: ["Joyería de Vidrio de Murano, Hecha a Mano en Venecia", "Joyería de Vidrio de Murano"],
    pt: ["Joias em Vidro de Murano, Feitas à Mão em Veneza", "Joias em Vidro de Murano"],
    hi: ["मुरानो ग्लास ज्वेलरी, वेनिस में हस्तनिर्मित", "मुरानो ग्लास ज्वेलरी"],
    ja: ["ムラノガラスジュエリー、ヴェネツィアで手作り", "ムラノガラスジュエリー"],
  };
  const candidates = titleCandidatesByLocale[locale];
  const title = fitTitle(candidates, settings.storeName);
  // Admin-entered copy (Settings > SEO) wins when set; otherwise the hero
  // subtitle is already keyword-rich, locale-translated marketing copy, so
  // it makes a far better snippet than the layout's generic fallback.
  const description = settings.metaDescription
    ? settings.metaDescription
    : truncateAtWord(dict.home.heroSubtitle, 155);
  const image = ogImage(settings);
  const canonical = "/";

  return {
    title,
    description,
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
    openGraph: {
      title: candidates[0],
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: candidates[0],
      description,
      images: image ? [image] : undefined,
    },
  };
}

// The number of pieces shown per shelf: one row at the widest layout.
const SHELF_SIZE = 4;
// New arrivals fill two rows of four (the loader fetches 8); on phones the CSS
// keeps it to two rows of two.
const NEW_ARRIVALS_SIZE = 8;

const HERO_SRC = "/hero/handmade-red-murano-glass-necklace.jpg";
const HERO_SIZES = "(min-width: 52rem) 36vw, 100vw";
// Necklaces photographed in the same oval drape as the hero, so the rotation
// reads as one frame changing colour. Slugs match the catalog photos' names.
// Each carries the deep tone of its glass: the hero's button takes it on
// while that necklace is showing (all dark enough for its white text).
const HERO_ACCENT = "#7d1a24";
const HERO_NECKLACES = [
  { slug: "collana-rame-antico-85514c", accent: "#5a3522" },
  { slug: "collana-ametista-9e7d11", accent: "#4b2a5c" },
  { slug: "collana-smeraldo-e-argento-a0dd26", accent: "#1f4d3f" },
  { slug: "collana-perla-rosa-antico-f396d8", accent: "#7a3f52" },
  { slug: "collana-perla-celeste-5e4eb6", accent: "#2e5670" },
];
const HERO_NECKLACE_SLUGS = HERO_NECKLACES.map((n) => n.slug);
const HERO_BACKGROUND_SRC = "/hero/ivory-marble-background.jpg";
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default async function Home() {
  // The hero photo is the LCP element: announce it in <head> with high
  // priority so it's requested alongside the fonts instead of after the
  // whole HTML has streamed in. Same srcSet/sizes as the <Image> below, so
  // the browser picks the same file and downloads it once.
  const hero = getImageProps({ src: HERO_SRC, alt: "", fill: true, sizes: HERO_SIZES }).props;
  preload(hero.src, {
    as: "image",
    imageSrcSet: hero.srcSet,
    imageSizes: hero.sizes,
    fetchPriority: "high",
  });

  const [
    settings,
    locale,
    { products, specialSelection, categoriesWithImage, bestSellers, reviews },
    heroNecklaces,
  ] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getHomepageData(),
    db.product.findMany({
      where: { slug: { in: HERO_NECKLACE_SLUGS }, active: true },
      select: {
        slug: true,
        name: true,
        nameEn: true,
        nameFr: true,
        nameDe: true,
        nameEs: true,
        namePt: true,
        nameJa: true,
        nameZh: true,
        nameRu: true,
        nameAr: true,
        nameHi: true,
      },
    }),
  ]);
  const dict = getDictionary(locale);
  const looks = await getAllLooks(locale, 3);
  const heroSlides: HeroSlide[] = [
    {
      src: HERO_SRC,
      alt: dict.home.heroImageAlt,
      href: null,
      accent: HERO_ACCENT,
    },
    ...HERO_NECKLACES.flatMap(({ slug, accent }) => {
      const product = heroNecklaces.find((p) => p.slug === slug);
      return product
        ? [
            {
              src: `/products/collane-in-vetro-di-murano/${slug}.png`,
              alt: localizedName(product, locale),
              href: `/products/${slug}`,
              accent,
            },
          ]
        : [];
    }),
  ];
  const testimonials = reviews
    .filter((review) => review.comment)
    .map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment as string,
      // First name only — a reviewer's full name is personal data and
      // wasn't collected for public display purposes.
      authorName: review.user.name?.split(" ")[0] || dict.home.verifiedBuyer,
      productName: localizedName(review.product, locale),
    }));

  // The FAQ answers restate the site's own settings: shipping figures come
  // from the shipping zones (lib/shipping-banner.ts), not fixed text.
  const faq = buildFaq(
    dict,
    await getShippingFacts(settings.defaultCurrency, settings.defaultLocale),
    settings.contactEmail
  );

  const shelfProps = {
    locale: settings.defaultLocale,
    outOfStockLabel: dict.product.outOfStock,
    quickAddLabel: dict.product.addToCart,
    addedLabel: dict.product.added,
  };
  const points = [
    { title: dict.home.whyShipping, body: dict.home.whyShippingBody },
    { title: dict.home.whySecure, body: dict.home.whySecureBody },
    { title: dict.home.whyReturns, body: dict.home.whyReturnsBody },
  ];
  const facts = [
    { icon: "badge", text: settings.trustBadgeText },
    { icon: "returns", text: dict.product.returnsBadge },
    { icon: "secure", text: dict.product.secureBadge },
  ].filter((fact): fact is { icon: FactIconName; text: string } => Boolean(fact.text));

  // The design (app/home.css) is scoped to `.shelf`: the glass is the only
  // saturated thing on the page, and the product photos are blended straight
  // into the ground instead of sitting in cards.
  return (
    <main className={`shelf shelf-home flex flex-1 flex-col ${homeFontClasses}`}>
      <section
        className="shelf-hero"
        style={{ "--hero-accent": HERO_ACCENT } as CSSProperties}
      >
        <Image
          src={HERO_BACKGROUND_SRC}
          alt=""
          fill
          loading="eager"
          priority
          quality={90}
          sizes="100vw"
          className="shelf-hero-backdrop"
        />
        <div className="shelf-wrap">
          <div className="shelf-hero-grid">
            <div className="shelf-hero-copy">
              <AnimatedHeading
                as="h1"
                text={settings.storeName}
                className="shelf-title"
                translate="no"
              />
              <p className="shelf-lede">{dict.home.heroSubtitle}</p>
              <Link href="/products" className="shelf-button">
                {dict.home.shopCollection}
                <span aria-hidden="true" className="shelf-button-arrow">
                  →
                </span>
              </Link>
              {settings.pricesIncludeTax && (
                <p className="shelf-note">{dict.home.pricesIncludeTax}</p>
              )}
            </div>
            <HeroNecklaceCarousel
              slides={heroSlides}
              sizes={HERO_SIZES}
              previousLabel={dict.home.previousSlide}
              nextLabel={dict.home.nextSlide}
            />
          </div>
          {facts.length > 0 && (
            <ul className="shelf-facts">
              {facts.map((fact) => (
                <li key={fact.text}>
                  <FactIcon name={fact.icon} />
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.bestSellers}</h2>
            </div>
            <ul className="shelf-row">
              {bestSellers.slice(0, SHELF_SIZE).map((product) => (
                <ShelfItem
                  key={product.id}
                  product={localizedCardProduct(product, locale)}
                  {...shelfProps}
                />
              ))}
            </ul>
          </div>
        </section>
      )}

      {categoriesWithImage.length > 0 && (
        <section className="shelf-section shelf-section--categories">
          <div className="shelf-wrap">
            <Reveal className="home-category-reveal" repeatOnView>
              <div className="shelf-heading-row shelf-heading-row--center">
                <p className="shelf-eyebrow shelf-eyebrow--center">{dict.home.heroTagline}</p>
                <h2 className="shelf-heading">{dict.home.shopByCategory}</h2>
              </div>
              <CategoryStrip className="shelf-categories">
                {categoriesWithImage.map((category, index) => {
                  const name = localizedName(category, locale);
                  return (
                    <li key={category.id} className="shelf-category">
                      <div className="shelf-category-photo">
                        {category.image && (
                          <CatalogImage
                            src={category.image.url}
                            alt={name}
                            fill
                            sizes="(min-width: 64rem) 19rem, (min-width: 48rem) 30vw, 50vw"
                          />
                        )}
                      </div>
                      <span className="shelf-category-index" aria-hidden="true">
                        {ROMAN[index] ?? index + 1}
                      </span>
                      <h3 className="shelf-category-name">
                        <Link href={`/category/${category.slug}`}>{name}</Link>
                      </h3>
                      <span className="shelf-category-cta" aria-hidden="true">
                        {dict.home.shopCollection}
                        <span className="shelf-category-arrow">→</span>
                      </span>
                    </li>
                  );
                })}
              </CategoryStrip>
            </Reveal>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.newArrivals}</h2>
              <Link href="/products" className="shelf-link">
                {dict.footer.allProducts}
              </Link>
            </div>
            <ul className="shelf-row shelf-row--two-rows">
              {products.slice(0, NEW_ARRIVALS_SIZE).map((product) => (
                <ShelfItem
                  key={product.slug}
                  product={localizedCardProduct(product, locale)}
                  {...shelfProps}
                />
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="shelf-section shelf-section--looks">
        <div className="shelf-wrap">
          <Reveal className="home-looks-heading-reveal" repeatOnView>
            <div className="shelf-heading-row shelf-heading-row--center">
              <p className="shelf-eyebrow shelf-eyebrow--center">{dict.look.kicker}</p>
              <h2 className="shelf-heading">{dict.looks.title}</h2>
            </div>
          </Reveal>
          {looks.length > 0 && (
            <div className="look-cards">
              {looks.map((look) => (
                <LookCard
                  key={look.id}
                  look={look}
                  locale={settings.defaultLocale}
                  labels={{
                    view: dict.looks.viewLook,
                    save: dict.look.save,
                    pieces: dict.looks.pieces,
                  }}
                />
              ))}
            </div>
          )}
          <ComposePromo
            labels={{
              kicker: dict.looks.composeKicker,
              title: dict.looks.composeTitle,
              subtitle: dict.looks.composeSubtitle,
              cta: dict.looks.composeCta,
            }}
          />
          {looks.length > 0 && (
            <p className="shelf-looks-more">
              <Link href="/looks" className="shelf-link">
                {dict.looks.allLooks} <span aria-hidden="true">→</span>
              </Link>
            </p>
          )}
        </div>
      </section>

      {specialSelection.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <Reveal>
              <div className="shelf-heading-row">
                <div>
                  <h2 className="shelf-heading">{dict.home.specialSelectionTitle}</h2>
                  <p className="shelf-special-subtitle">{dict.home.specialSelectionSubtitle}</p>
                </div>
              </div>
              <ul className="shelf-row shelf-row--special">
                {specialSelection.map((product) => (
                  <ShelfItem
                    key={product.slug}
                    product={localizedCardProduct(product, locale)}
                    {...shelfProps}
                  />
                ))}
              </ul>
              <div className="shelf-special-cta">
                <Link href="/products?sale=1" className="shelf-button">
                  {dict.home.specialSelectionCta}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="shelf-section">
        <div className="shelf-wrap">
          <FaqSection items={faq} dict={dict} />
        </div>
      </section>

      <section className="shelf-section shelf-section--sand">
        <div className="shelf-wrap">
          <div className="shelf-heading-row">
            <h2 className="shelf-heading">{dict.home.whyUsTitle}</h2>
          </div>
          <ul className="shelf-points">
            {points.map((point) => (
              <li key={point.title} className="shelf-point">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shelf-section shelf-giftfinder-band">
        <Reveal className="shelf-wrap shelf-giftfinder-reveal" repeatOnView>
          <div className="shelf-giftfinder-content">
            <p className="shelf-giftfinder-time">{dict.giftFinder.homeCtaTime}</p>
            <Link href="/gift-finder" className="shelf-giftfinder-link">
              <span>{dict.giftFinder.homeCtaLine}</span>
              <GiftFinderArrow />
            </Link>
            <p className="shelf-giftfinder-details">
              {dict.giftFinder.homeCtaDetails}
            </p>
          </div>
        </Reveal>
      </section>

      {settings.showTestimonials && testimonials.length > 0 && (
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.testimonialsTitle}</h2>
            </div>
            <ul className="shelf-quotes">
              {testimonials.slice(0, 3).map((review) => (
                <li key={review.id}>
                  <figure className="shelf-quote">
                    <span className="shelf-stars" aria-hidden="true">
                      {"\u2605".repeat(review.rating)}
                    </span>
                    <span className="sr-only">{review.rating}/5</span>
                    <blockquote>{review.comment}</blockquote>
                    <figcaption>
                      {review.authorName}, {review.productName}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {settings.giftCardEnabled && (
        <GiftCardAd
          dict={dict.giftCard}
          brand={settings.storeName}
          price={formatMoney(
            settings.giftCardPrice,
            settings.defaultCurrency,
            settings.defaultLocale
          )}
        />
      )}

      <section className="shelf-newsletter shelf-section">
        <div className="shelf-wrap shelf-newsletter-wrap">
          <div className="shelf-newsletter-inner">
            <h2 className="shelf-heading">{dict.home.newsletterCtaTitle}</h2>
            <p>{dict.home.newsletterCtaBody}</p>
            <NewsletterSignupForm dict={dict.footer} />
          </div>
          <span className="shelf-newsletter-discount" aria-hidden="true">
            −10%
          </span>
        </div>
      </section>
    </main>
  );
}

type FactIconName = "badge" | "returns" | "secure";

const FACT_ICON_PATHS: Record<FactIconName, string> = {
  badge: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M8.8 12.2l2.2 2.2 4.4-4.6",
  returns: "M4 9h11a5 5 0 010 10H9 M4 9l4-4 M4 9l4 4",
  secure: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 017 0v3 M12 15v2",
};

function FactIcon({ name }: { name: FactIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={FACT_ICON_PATHS[name]} />
    </svg>
  );
}
