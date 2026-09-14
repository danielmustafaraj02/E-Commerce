import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { toSafeJsonLd } from "@/lib/json-ld";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ShareButtons } from "@/components/share-buttons";
import { ProductCard } from "@/components/product-card";
import { ProductImageZoom } from "@/components/product-image-zoom";
import { TrustBadges } from "@/components/trust-badges";
import { ReviewForm } from "./review-form";
import { hasPurchased } from "./review-actions";

// cache() dedupes this between generateMetadata and the page component so a
// single render only queries the DB once for the same slug.
const getProduct = cache((slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  })
);

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, product] = await Promise.all([getStoreSettings(), getProduct(slug)]);
  if (!product || !product.active) return {};

  const description =
    product.description?.slice(0, 160) || `Buy ${product.name} at ${settings.storeName}`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;

  const [settings, uiLocale, product, session] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getProduct(slug),
    auth(),
  ]);

  if (!product || !product.active) notFound();
  const dict = getDictionary(uiLocale);

  // Queried separately (not just found in product.reviews) since that list
  // is capped at the 20 most recent — the signed-in user's own review could
  // be older than that.
  const userId = session?.user?.id;
  const [myReview, relatedProducts, isVerifiedBuyer] = await Promise.all([
    userId
      ? db.review.findUnique({
          where: { productId_userId: { productId: product.id, userId } },
        })
      : null,
    product.categoryId
      ? db.product.findMany({
          where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        })
      : [],
    userId ? hasPurchased(product.id, userId) : false,
  ]);

  const outOfStock = product.stockQty <= 0;
  const lowStock = !outOfStock && product.stockQty <= product.lowStockThreshold;
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    ...(averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${settings.siteUrl || ""}/products/${product.slug}`,
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(productJsonLd) }}
      />
      {product.category && (
        <Link
          href={`/category/${product.category.slug}`}
          className="text-foreground/70 hover:text-primary mb-6 inline-block text-sm"
        >
          &larr; {product.category.name}
        </Link>
      )}

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          {product.images[0] && (
            <ProductImageZoom
              src={product.images[0].url}
              alt={product.images[0].altText || product.name}
            />
          )}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((image) => (
                <div key={image.id} className="relative h-16 w-16 overflow-hidden rounded">
                  <Image
                    src={image.url}
                    alt={image.altText || product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-xl">
            {formatMoney(product.price, product.currency, settings.defaultLocale)}
            {settings.pricesIncludeTax && (
              <span className="text-foreground/60 ml-2 text-sm">{dict.product.vatIncluded}</span>
            )}
          </p>

          <p className="mt-1 text-sm">
            {outOfStock ? (
              <span className="text-danger">{dict.product.outOfStock}</span>
            ) : lowStock ? (
              <span className="text-warning">
                {applyTemplate(dict.product.onlyLeft, { n: product.stockQty })}
              </span>
            ) : (
              <span className="text-success">{dict.product.inStock}</span>
            )}
          </p>

          {averageRating !== null && (
            <p className="text-foreground/70 mt-1 text-sm">
              {averageRating.toFixed(1)} / 5 (
              {applyTemplate(dict.product.reviewCount, { n: product.reviews.length })})
            </p>
          )}

          <p className="text-foreground/80 mt-6 whitespace-pre-line">{product.description}</p>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              currency: product.currency,
              imageUrl: product.images[0]?.url ?? null,
              outOfStock,
            }}
            dict={dict.product}
          />

          <TrustBadges trustBadgeText={settings.trustBadgeText} dict={dict.product} />

          <div className="border-foreground/10 mt-6 border-t pt-4">
            <ShareButtons
              url={`${settings.siteUrl || ""}/products/${product.slug}`}
              title={product.name}
              dict={dict.product}
            />
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-4 text-lg font-medium">{dict.product.reviews}</h2>
        {product.reviews.length === 0 ? (
          <p className="text-foreground/70 text-sm">{dict.product.noReviews}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {product.reviews.map((review) => (
              <li key={review.id} className="border-foreground/10 border-b pb-4">
                <p className="text-sm font-medium">
                  {review.user.name ?? "Anonymous"} &middot; {review.rating}/5
                </p>
                {review.comment && (
                  <p className="text-foreground/80 mt-1 text-sm">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {!userId ? (
          <p className="text-foreground/70 mt-4 text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {dict.product.signInToReview}
            </Link>
          </p>
        ) : isVerifiedBuyer || myReview ? (
          <ReviewForm
            productId={product.id}
            slug={product.slug}
            existing={myReview ? { rating: myReview.rating, comment: myReview.comment } : null}
            dict={dict.product}
          />
        ) : (
          <p className="text-foreground/70 mt-4 text-sm">{dict.product.verifiedPurchaseOnly}</p>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-foreground/10 mt-16 border-t pt-10">
          <h2 className="mb-4 text-lg font-medium">{dict.product.youMightAlsoLike}</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.slug}
                product={related}
                locale={settings.defaultLocale}
                outOfStockLabel={dict.product.outOfStock}
                quickAddLabel={dict.product.addToCart}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
