import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { formatMoney } from "@/lib/format";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { fitTitle } from "@/lib/seo-text";
import { truncateAtWord } from "@/lib/text";
import { CatalogImage } from "@/components/catalog-image";
import { ShelfItem } from "@/components/shelf-item";
import { CategoryStrip } from "@/components/category-strip";
import { Reveal } from "@/components/reveal";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
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
    alternates: { canonical, languages: hreflangAlternates(canonical) },
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

export default async function Home() {
  const [
    settings,
    locale,
    { products, specialSelection, categoriesWithImage, bestSellers, reviews },
  ] = await Promise.all([getStoreSettings(), getLocale(), getHomepageData()]);
  const dict = getDictionary(locale);
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

  const freeShippingAmount = settings.freeShippingThreshold
    ? formatMoney(settings.freeShippingThreshold, settings.defaultCurrency, settings.defaultLocale)
    : null;
  const homeFaq = [
    ...dict.home.faq,
    ...(freeShippingAmount
      ? [
          {
            question: dict.home.faqShippingQuestion,
            answer: dict.home.faqShippingAnswer(freeShippingAmount),
          },
        ]
      : []),
  ];
  // Direct-answer FAQ content, marked up as FAQPage — the format AI answer
  // engines (Perplexity, ChatGPT, etc.) lean on most for quoting a source
  // directly, and it can also render as an expandable rich result in
  // Google. Kept honest by only asserting what's actually configured
  // (e.g. the shipping answer is skipped if no free-shipping threshold is
  // set, rather than guessing at a number).
  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

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
    settings.trustBadgeText,
    dict.product.returnsBadge,
    dict.product.secureBadge,
  ].filter(Boolean);

  // The design (app/home.css) is scoped to `.shelf`: the glass is the only
  // saturated thing on the page, and the product photos are blended straight
  // into the ground instead of sitting in cards.
  return (
    <main className={`shelf shelf-home flex flex-1 flex-col ${homeFontClasses}`}>
      <section className="shelf-hero">
        <div className="shelf-wrap">
          <div className="shelf-hero-grid">
            <div className="shelf-hero-copy">
              <h1 className="shelf-title">
                <span translate="no">{settings.storeName}</span>
              </h1>
              <p className="shelf-lede">{dict.home.heroSubtitle}</p>
              {settings.pricesIncludeTax && (
                <p className="shelf-note">{dict.home.pricesIncludeTax}</p>
              )}
              <Link href="/products" className="shelf-button">
                {dict.home.shopNow}
              </Link>
              <ul className="shelf-facts">
                {facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <div className="shelf-bead">
              <Image
                src="/hero/perla-viola-murano.jpg"
                alt={dict.home.heroImageAlt}
                fill
                priority
                sizes="(min-width: 52rem) 36vw, 100vw"
              />
            </div>
          </div>
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
        <section className="shelf-section">
          <div className="shelf-wrap">
            <div className="shelf-heading-row">
              <h2 className="shelf-heading">{dict.home.shopByCategory}</h2>
            </div>
            <CategoryStrip className="shelf-categories">
              {categoriesWithImage.map((category) => {
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
                    <h3 className="shelf-category-name">
                      <Link href={`/category/${category.slug}`}>{name}</Link>
                    </h3>
                  </li>
                );
              })}
            </CategoryStrip>
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

      <section className="shelf-section">
        <div className="shelf-wrap">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toSafeJsonLd(homeFaqJsonLd) }}
          />
          <div className="shelf-heading-row">
            <h2 className="shelf-heading">{dict.home.faqTitle}</h2>
          </div>
          <div className="shelf-faq">
            {homeFaq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="shelf-newsletter shelf-section">
        <div className="shelf-wrap">
          <div className="shelf-newsletter-inner">
            <h2 className="shelf-heading">{dict.home.newsletterCtaTitle}</h2>
            <p>{dict.home.newsletterCtaBody}</p>
            <NewsletterSignupForm dict={dict.footer} />
          </div>
        </div>
      </section>
    </main>
  );
}
