import { siteBaseUrl } from "@/lib/site-url";
import { cache } from "react";
import type { Metadata } from "next";
import { CatalogImage } from "@/components/catalog-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { absoluteUrl, toSafeJsonLd } from "@/lib/json-ld";
import { buildReturnPolicy, buildShippingDetails } from "@/lib/offer-json-ld";
import { productMaterial } from "@/lib/merchant-feed";
import { productSizeDictKey } from "@/lib/product-sizing";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import {
  localizedName,
  localizedDescription,
  localizedCardProduct,
  productImageAlt,
} from "@/lib/product-i18n";
import { buildProductMetaDescription, fitTitle } from "@/lib/seo-text";
import { hreflangAlternates, ogLocale } from "@/lib/hreflang";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import { ShareButtons } from "@/components/share-buttons";
import { ShelfItem } from "@/components/shelf-item";
import { homeFontClasses } from "@/app/home-fonts";
import "../../home.css";
import "../../shop.css";
import { ProductImageZoom } from "@/components/product-image-zoom";
import { TrustBadges } from "@/components/trust-badges";
import { ReviewForm } from "./review-form";
import { hasPurchased } from "./review-actions";

// Module-level, not computed inside the component (react-hooks/purity
// flags Date.now() during render) — evaluated once per server instance,
// which is more than fresh enough for a ~1-year-out validity window.
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

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
  const [settings, locale, product] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getProduct(slug),
  ]);
  if (!product || !product.active) return {};

  const name = localizedName(product, locale);
  // "Murano glass" in the locale's own words is worth having in the title (a
  // high-intent search term), but only when it still fits: search results show
  // ~60 characters and the layout appends " | {store name}". fitTitle() takes
  // the keyword form when it fits and otherwise the plain product name.
  const keywordByLocale: Record<Locale, string> = {
    en: "Murano Glass",
    it: "Vetro di Murano",
    fr: "Verre de Murano",
    de: "Muranoglas",
    ar: "زجاج مورانو",
    zh: "穆拉诺玻璃",
    ru: "Муранское стекло",
    es: "Vidrio de Murano",
    pt: "Vidro de Murano",
    hi: "मुरानो ग्लास",
    ja: "ムラノガラス",
  };
  const title = fitTitle([`${name} — ${keywordByLocale[locale]}`, name], settings.storeName);
  const fallbackDescriptionByLocale: Record<Locale, string> = {
    en: `${name} — handmade Murano glass, from ${settings.storeName}.`,
    it: `${name} — vetro di Murano fatto a mano, da ${settings.storeName}.`,
    fr: `${name} — verre de Murano fait main, par ${settings.storeName}.`,
    de: `${name} — handgefertigtes Muranoglas von ${settings.storeName}.`,
    ar: `${name} — زجاج مورانو مصنوع يدويًا، من ${settings.storeName}.`,
    zh: `${name} — 来自 ${settings.storeName} 的手工穆拉诺玻璃。`,
    ru: `${name} — муранское стекло ручной работы от ${settings.storeName}.`,
    es: `${name} — vidrio de Murano hecho a mano, de ${settings.storeName}.`,
    pt: `${name} — vidro de Murano feito à mão, da ${settings.storeName}.`,
    hi: `${name} — ${settings.storeName} का हाथ से बना मुरानो ग्लास।`,
    ja: `${name} — ${settings.storeName}の手作りムラノガラス。`,
  };
  // Price and a call to action close the snippet (both lift click-through);
  // an out-of-stock product says so instead of inviting a purchase it can't take.
  const dict = getDictionary(locale);
  const description = buildProductMetaDescription({
    description: localizedDescription(product, locale) || fallbackDescriptionByLocale[locale],
    suffix: `${formatMoney(product.price, product.currency, settings.defaultLocale)} · ${
      product.stockQty > 0 ? dict.home.shopNow : dict.product.outOfStock
    }`,
  });
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
      languages: hreflangAlternates(`/products/${product.slug}`),
    },
    openGraph: {
      title: name,
      description,
      type: "website",
      locale: ogLocale(locale),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
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
  const name = localizedName(product, uiLocale);
  const description = localizedDescription(product, uiLocale);
  const categoryName = product.category ? localizedName(product.category, uiLocale) : null;

  // Queried separately (not just found in product.reviews) since that list
  // is capped at the 20 most recent — the signed-in user's own review could
  // be older than that.
  const userId = session?.user?.id;
  const [myReview, relatedProducts, isVerifiedBuyer, wishlistItem, shippingZones] =
    await Promise.all([
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
      userId
        ? db.wishlistItem.findUnique({
            where: { productId_userId: { productId: product.id, userId } },
          })
        : null,
      // Same zones/methods the checkout prices from, so the shipping and return
      // details in the structured data below can't drift from what shoppers get.
      db.shippingZone.findMany({
        include: { countries: true, methods: { include: { method: true } } },
      }),
    ]);

  const outOfStock = product.stockQty <= 0;
  const lowStock = !outOfStock && product.stockQty <= product.lowStockThreshold;
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  const base = siteBaseUrl(settings);
  const productUrl = `${base}/products/${product.slug}`;

  const material = productMaterial(product.category);
  const sizeKey = productSizeDictKey(product.category);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    sku: product.sku,
    image: product.images.map((image) => absoluteUrl(image.url, base)),
    brand: { "@type": "Brand", name: settings.storeName },
    ...(categoryName ? { category: categoryName } : {}),
    ...(material ? { material } : {}),
    inLanguage: uiLocale,
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
      priceValidUntil: PRICE_VALID_UNTIL,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: settings.storeName },
      shippingDetails: buildShippingDetails(shippingZones, {
        priceCents: product.price,
        currency: product.currency,
        freeShippingThresholdCents: settings.freeShippingThreshold,
      }),
      hasMerchantReturnPolicy: buildReturnPolicy(shippingZones, {
        returnPolicyUrl: base ? `${base}/legal/returns` : undefined,
      }),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: productUrl,
    },
  };

  // Breadcrumbs in JSON-LD (not just the in-page back-link) are what let
  // Google render the Home > Category > Product trail under the search
  // result instead of the raw URL — a small CTR win with near-zero cost
  // since the data already exists on this page.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.footer.allProducts, item: `${base}/products` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: `${base}/category/${product.category.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: product.category ? 3 : 2, name, item: productUrl },
    ],
  };

  return (
    <main className={`shelf flex flex-1 flex-col ${homeFontClasses}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(breadcrumbJsonLd) }}
      />
      <section className="shelf-section shop-product">
        <div className="shelf-wrap">
          {product.category && (
            <Link href={`/category/${product.category.slug}`} className="shelf-link shop-back">
              &larr; {categoryName}
            </Link>
          )}

          <div className="shop-product-grid">
            <div className="flex flex-col gap-3">
              {product.images[0] && (
                <ProductImageZoom
                  src={product.images[0].url}
                  alt={productImageAlt(name, uiLocale)}
                />
              )}
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.slice(1).map((image) => (
                    <div key={image.id} className="shop-thumb">
                      <CatalogImage
                        src={image.url}
                        alt={productImageAlt(name, uiLocale)}
                        fill
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="shop-product-title">{name}</h1>
              <p className="shop-price">
                {formatMoney(product.price, product.currency, settings.defaultLocale)}
                {settings.pricesIncludeTax && (
                  <span className="text-foreground/60 ml-2 text-sm">
                    {dict.product.vatIncluded}
                  </span>
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

              {sizeKey && (
                <p className="text-foreground/70 mt-1 text-sm">
                  {dict.product.sizeLabel}: {dict.product[sizeKey]}
                </p>
              )}

              {averageRating !== null && (
                <p className="text-foreground/70 mt-1 text-sm">
                  {averageRating.toFixed(1)} / 5 (
                  {applyTemplate(dict.product.reviewCount, { n: product.reviews.length })})
                </p>
              )}

              <p className="shop-prose">{description}</p>

              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name,
                  price: product.price,
                  currency: product.currency,
                  imageUrl: product.images[0]?.url ?? null,
                  outOfStock,
                }}
                dict={dict.product}
              />

              {userId && !outOfStock && (
                <BuyNowButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name,
                    price: product.price,
                    currency: product.currency,
                    imageUrl: product.images[0]?.url ?? null,
                    outOfStock,
                  }}
                  label={dict.product.buyNow}
                />
              )}

              <WishlistButton
                productId={product.id}
                slug={product.slug}
                name={name}
                price={product.price}
                currency={product.currency}
                imageUrl={product.images[0]?.url ?? null}
                initialSaved={Boolean(wishlistItem)}
                isSignedIn={Boolean(userId)}
                addLabel={dict.product.addToWishlist}
                removeLabel={dict.product.removeFromWishlist}
              />

              <TrustBadges trustBadgeText={settings.trustBadgeText} dict={dict.product} />

              <Link
                href="/murano-glass#authenticity"
                className="text-foreground/60 hover:text-primary mt-2 inline-block text-xs underline"
              >
                {dict.product.authenticityLink}
              </Link>

              <div className="border-foreground/10 mt-6 border-t pt-4">
                <ShareButtons url={productUrl} title={name} dict={dict.product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shelf-section">
        <div className="shelf-wrap shop-reviews">
          <h2 className="shelf-heading">{dict.product.reviews}</h2>
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
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="shelf-section shelf-section--sand">
          <div className="shelf-wrap">
            <h2 className="shelf-heading shop-related-heading">{dict.product.youMightAlsoLike}</h2>
            <ul className="shelf-row">
              {relatedProducts.map((related) => (
                <ShelfItem
                  key={related.slug}
                  product={localizedCardProduct(related, uiLocale)}
                  locale={settings.defaultLocale}
                  outOfStockLabel={dict.product.outOfStock}
                  quickAddLabel={dict.product.addToCart}
                  addedLabel={dict.product.added}
                />
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
