import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { formatMoney } from "@/lib/format";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { CatalogImage } from "@/components/catalog-image";
import { ShelfItem } from "@/components/shelf-item";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { homeFontClasses } from "./home-fonts";
import "./home.css";

// Title/description/OG come from the root layout; only the canonical and
// hreflang set live here, so pages that don't define their own no longer
// inherit "/" as their canonical URL.
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: hreflangAlternates("/") },
};

// The number of pieces shown per shelf: one row at the widest layout.
const SHELF_SIZE = 4;
// New arrivals fill two rows of four (the loader fetches 8); on phones the CSS
// keeps it to two rows of two.
const NEW_ARRIVALS_SIZE = 8;

export default async function Home() {
  const [settings, locale, { products, categoriesWithImage, bestSellers, reviews }] =
    await Promise.all([getStoreSettings(), getLocale(), getHomepageData()]);
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
                alt=""
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
            <ul className="shelf-categories">
              {categoriesWithImage.map((category) => {
                const name = localizedName(category, locale);
                return (
                  <li key={category.id} className="shelf-category">
                    <div className="shelf-category-photo">
                      {category.image && (
                        <CatalogImage
                          src={category.image.url}
                          alt=""
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
            </ul>
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
