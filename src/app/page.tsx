import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStoreSettings } from "@/lib/store-settings";
import { getHomepageData } from "@/lib/homepage-data";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { formatMoney } from "@/lib/format";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { TrustBadges } from "@/components/trust-badges";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

// Swiper pulls in a non-trivial client bundle — each shelf that needs it
// gets its own chunk instead of bloating the shared homepage bundle.
const BestSellersCarousel = dynamic(() =>
  import("@/components/best-sellers-carousel").then((mod) => mod.BestSellersCarousel)
);
const CategoryCarousel = dynamic(() =>
  import("@/components/category-carousel").then((mod) => mod.CategoryCarousel)
);
const TestimonialsCarousel = dynamic(() =>
  import("@/components/testimonials-carousel").then((mod) => mod.TestimonialsCarousel)
);

// Title/description/OG come from the root layout; only the canonical and
// hreflang set live here, so pages that don't define their own no longer
// inherit "/" as their canonical URL.
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: hreflangAlternates("/") },
};

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
      ? [{ question: dict.home.faqShippingQuestion, answer: dict.home.faqShippingAnswer(freeShippingAmount) }]
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

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-surface relative overflow-hidden">
        <div className="hero-glass-bg" aria-hidden="true">
          <span />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-16 sm:grid-cols-2 sm:py-20">
          <div className="flex flex-col gap-4">
            <p className="animate-fade-up text-primary text-sm font-medium">
              {dict.home.heroEyebrow}
            </p>
            <h1
              style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
              className="animate-fade-up text-4xl font-semibold sm:text-5xl"
            >
              {settings.storeName}
            </h1>
            <p
              style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
              className="animate-fade-up text-foreground/70 max-w-md"
            >
              {dict.home.heroSubtitle}
            </p>
            {settings.pricesIncludeTax && (
              <p
                style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
                className="animate-fade-up text-foreground/50 text-sm"
              >
                {dict.home.pricesIncludeTax}
              </p>
            )}
            <Link
              href="/products"
              style={{ "--reveal-delay": "280ms" } as React.CSSProperties}
              className="btn-primary animate-fade-up mt-2 w-fit"
            >
              {dict.home.shopNow}
            </Link>
            <div
              style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
              className="animate-fade-up"
            >
              <TrustBadges trustBadgeText={settings.trustBadgeText} dict={dict.product} />
            </div>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/hero/perla-viola-murano.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-16">
        {bestSellers.length > 0 && (
          <Reveal>
            <section>
              <h2 className="mb-4 text-lg font-medium">{dict.home.bestSellers}</h2>
              <BestSellersCarousel
                products={bestSellers.map((p) => localizedCardProduct(p, locale))}
                locale={settings.defaultLocale}
                outOfStockLabel={dict.product.outOfStock}
                quickAddLabel={dict.product.addToCart}
                prevLabel={dict.home.previousSlide}
                nextLabel={dict.home.nextSlide}
              />
            </section>
          </Reveal>
        )}

        {categoriesWithImage.length > 0 && (
          <Reveal>
            <section>
              <h2 className="mb-4 text-lg font-medium">{dict.home.shopByCategory}</h2>
              <CategoryCarousel
                categories={categoriesWithImage.map((c) => ({ ...c, name: localizedName(c, locale) }))}
                prevLabel={dict.home.previousSlide}
                nextLabel={dict.home.nextSlide}
              />
            </section>
          </Reveal>
        )}

        {products.length > 0 && (
          <Reveal>
            <section>
              <h2 className="mb-4 text-lg font-medium">{dict.home.newArrivals}</h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {products.map((product, i) => (
                  <Reveal key={product.slug} delayMs={i * 60}>
                    <ProductCard
                      product={localizedCardProduct(product, locale)}
                      locale={settings.defaultLocale}
                      outOfStockLabel={dict.product.outOfStock}
                      quickAddLabel={dict.product.addToCart}
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <section>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/home/bead-garland.svg"
              alt=""
              aria-hidden="true"
              className="mb-6 h-16 w-full opacity-80 sm:h-20"
            />
            <h2 className="mb-6 text-lg font-medium">{dict.home.whyUsTitle}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="border-foreground/10 rounded-lg border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div
                  className="animate-badge-breathe mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, #f5c451 22%, transparent)",
                    "--badge-delay": "0ms",
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#b8860b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7h11v9H3z" />
                    <path d="M14 10h4l3 3v3h-7z" />
                    <circle cx="7" cy="18" r="1.5" />
                    <circle cx="17.5" cy="18" r="1.5" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">{dict.home.whyShipping}</h3>
                <p className="text-foreground/70 text-sm">{dict.home.whyShippingBody}</p>
              </div>
              <div className="border-foreground/10 rounded-lg border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div
                  className="animate-badge-breathe mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, #7cc7c0 25%, transparent)",
                    "--badge-delay": "220ms",
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2f6f68"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">{dict.home.whySecure}</h3>
                <p className="text-foreground/70 text-sm">{dict.home.whySecureBody}</p>
              </div>
              <div className="border-foreground/10 rounded-lg border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div
                  className="animate-badge-breathe mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, #e8607f 20%, transparent)",
                    "--badge-delay": "440ms",
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c65b8a"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">{dict.home.whyReturns}</h3>
                <p className="text-foreground/70 text-sm">{dict.home.whyReturnsBody}</p>
              </div>
            </div>
          </section>
        </Reveal>

        {settings.showTestimonials && testimonials.length > 0 && (
          <Reveal>
            <section>
              <h2 className="mb-4 text-lg font-medium">{dict.home.testimonialsTitle}</h2>
              <TestimonialsCarousel
                testimonials={testimonials}
                prevLabel={dict.home.previousSlide}
                nextLabel={dict.home.nextSlide}
              />
            </section>
          </Reveal>
        )}

        <Reveal>
          <section>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: toSafeJsonLd(homeFaqJsonLd) }}
            />
            <h2 className="mb-4 text-lg font-medium">{dict.home.faqTitle}</h2>
            <div className="divide-foreground/10 flex flex-col divide-y">
              {homeFaq.map((item) => (
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
          </section>
        </Reveal>
      </div>

      <Reveal>
        <section className="bg-surface relative overflow-hidden">
          <div className="section-glass-bg" aria-hidden="true" />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 py-14 text-center">
            <h2 className="text-xl font-medium">{dict.home.newsletterCtaTitle}</h2>
            <p className="text-foreground/70 max-w-md text-sm">{dict.home.newsletterCtaBody}</p>
            <div className="mt-2 w-full max-w-sm">
              <NewsletterSignupForm dict={dict.footer} />
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
