import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getStoreSettings } from "@/lib/store-settings";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
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

const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export default async function Home() {
  const [settings, locale, products, categories, topSellingItems, reviews] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    db.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
    }),
    db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" }, take: 6 }),
    db.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { in: REVENUE_STATUSES } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    // Only real, written reviews — never fabricated copy. Highest-rated
    // first so the shelf leads with the store's best real feedback.
    db.review.findMany({
      where: { comment: { not: null } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 9,
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
    }),
  ]);
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
      productName: review.product.name,
    }));

  // Best sellers is real sales data (not a fixed shelf), so it fetches by ID
  // in ranked order rather than a single findMany — a plain where-in query
  // would come back in whatever order the database feels like.
  const bestSellersUnordered = await db.product.findMany({
    where: { id: { in: topSellingItems.map((item) => item.productId) }, active: true },
    include: { images: { take: 1, orderBy: { position: "asc" } } },
  });
  const bestSellers = topSellingItems
    .map((item) => bestSellersUnordered.find((p) => p.id === item.productId))
    .filter((p) => p !== undefined);

  // A different product photo per visit rather than always the same one —
  // the random pick happens in SQL (RANDOM() is supported the same way on
  // SQLite and Postgres) rather than via Math.random() here, since picking
  // randomly during render would make this component impure.
  const categoriesWithImage = await Promise.all(
    categories.map(async (category) => {
      const [image = null] = await db.$queryRaw<{ url: string; altText: string }[]>`
        SELECT "ProductImage"."url" as url, "ProductImage"."altText" as altText
        FROM "ProductImage"
        JOIN "Product" ON "Product"."id" = "ProductImage"."productId"
        WHERE "Product"."categoryId" = ${category.id} AND "Product"."active" = true
        ORDER BY RANDOM()
        LIMIT 1
      `;
      return { ...category, image };
    })
  );

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
              className="animate-fade-up bg-primary mt-2 inline-block w-fit rounded px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
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
                products={bestSellers}
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
                categories={categoriesWithImage}
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
                      product={product}
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
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, #f5c451 22%, transparent)" }}
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
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, #7cc7c0 25%, transparent)" }}
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
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, #e8607f 20%, transparent)" }}
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
