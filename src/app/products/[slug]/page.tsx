import { siteBaseUrl } from "@/lib/site-url";
import { cache } from "react";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product-gallery";
import { CatalogImage } from "@/components/catalog-image";
import { Link } from "@/components/localized-link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney, formatDiscountPercent } from "@/lib/format";
import { absoluteUrl, toSafeJsonLd } from "@/lib/json-ld";
import { buildReturnPolicy, buildShippingDetails } from "@/lib/offer-json-ld";
import { productMaterial } from "@/lib/merchant-feed";
import { productSizeDictKey } from "@/lib/product-sizing";
import { isProductColorKey, PRODUCT_COLOR_SWATCH } from "@/lib/product-colors";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import {
  localizedName,
  localizedDescription,
  localizedStory,
  localizedCardProduct,
  productImageAlt,
} from "@/lib/product-i18n";
import { buildProductMetaDescription, fitTitle } from "@/lib/seo-text";
import { hreflangAlternates, localizedCanonical, ogLocale } from "@/lib/hreflang";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ShareButtons } from "@/components/share-buttons";
import { ShelfItem } from "@/components/shelf-item";
import { GiftCardAd } from "@/components/gift-card-ad";
import { homeFontClasses } from "@/app/home-fonts";
import "../../home.css";
import "../../shop.css";
import { TrustBadges } from "@/components/trust-badges";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "./review-form";
import { hasPurchased } from "./review-actions";
import { getShippingBanner, getShippingFacts } from "@/lib/shipping-banner";
import { ExpandableText } from "@/components/expandable-text";
import { buildFaq } from "@/lib/faq";
import { FaqSection } from "@/components/faq-section";
import { getLooksForProducts } from "@/lib/look-data";
import { CompleteTheLook } from "@/components/complete-the-look";
import { GiftFinderArrow } from "@/components/gift-finder-arrow";

// Small single-use icons for the gift sections below — same stroke
// convention (1.8, round caps/joins, currentColor) as the existing icons in
// components/trust-badges.tsx, kept local since nothing else on the site
// needs them yet.
function GiftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 9h18v4H3z" />
      <path d="M12 9v12" />
      <path d="M12 9C10 5 6 5 6 7.5S9 9 12 9Z" />
      <path d="M12 9c2-4 6-4 6-1.5S15 9 12 9Z" />
    </svg>
  );
}
function HeartSmallIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}
// Arrow that flips for RTL via a logical transform instead of baking "→"
// into the translated string (Arabic reads right-to-left, so the arrow
// needs to point the other way, and a hardcoded glyph can't do that).
function InlineArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rtl:-scale-x-100"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

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
  const title = fitTitle([`${name} · ${keywordByLocale[locale]}`, name], settings.storeName);
  const fallbackDescriptionByLocale: Record<Locale, string> = {
    en: `${name}, handmade Murano glass, from ${settings.storeName}.`,
    it: `${name}, vetro di Murano fatto a mano, da ${settings.storeName}.`,
    fr: `${name}, verre de Murano fait main, par ${settings.storeName}.`,
    de: `${name}, handgefertigtes Muranoglas von ${settings.storeName}.`,
    ar: `${name}، زجاج مورانو مصنوع يدويًا، من ${settings.storeName}.`,
    zh: `${name}，来自 ${settings.storeName} 的手工穆拉诺玻璃。`,
    ru: `${name}, муранское стекло ручной работы от ${settings.storeName}.`,
    es: `${name}, vidrio de Murano hecho a mano, de ${settings.storeName}.`,
    pt: `${name}, vidro de Murano feito à mão, da ${settings.storeName}.`,
    hi: `${name}, ${settings.storeName} का हाथ से बना मुरानो ग्लास।`,
    ja: `${name}、${settings.storeName}の手作りムラノガラス。`,
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
      canonical: localizedCanonical(locale, `/products/${product.slug}`),
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
  const shippingBanner = await getShippingBanner(
    dict.product.shippingBanner,
    settings.defaultCurrency,
    settings.defaultLocale
  );
  const [look] = await getLooksForProducts([product.id], uiLocale);
  const name = localizedName(product, uiLocale);
  const description = localizedDescription(product, uiLocale);
  const story = localizedStory(product, uiLocale);
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
  const priceDisplay = formatMoney(product.price, product.currency, settings.defaultLocale);
  // Same rule as the shelf cards: only a compare-at price above the current
  // price is a discount (staff can't save an invalid one; see price-history).
  const compareAtPrice =
    product.compareAtPrice !== null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;

  // The same shape AddToCartButton/BuyNowButton/WishlistButton each need —
  // computed once instead of three identical object literals.
  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name,
    price: product.price,
    currency: product.currency,
    imageUrl: product.images[0]?.url ?? null,
    outOfStock,
  };

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

  const faq = buildFaq(
    dict,
    await getShippingFacts(settings.defaultCurrency, settings.defaultLocale),
    settings.contactEmail
  );

  return (
    <main className={`shelf shop-product-page flex flex-1 flex-col ${homeFontClasses}`}>
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
            <ProductGallery images={product.images} alt={productImageAlt(name, uiLocale)} />

            {/* Image → product → story → purchase → reassurance, in one
                readable column (layout in shop.css). */}
            <div className="shop-product-info">
              <h1 className="shop-product-title">{name}</h1>

              {/* Restrained value row — material, provenance, weight — read in
                  one glance, right under the title where a shopper looks first. */}
              <p className="shop-value-row">
                {[material, dict.product.handmadeBadge, dict.product.lightweightBadge]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <p className="shop-price">
                {compareAtPrice !== null && (
                  <s className="shop-price-compare">
                    {formatMoney(compareAtPrice, product.currency, settings.defaultLocale)}
                  </s>
                )}
                {priceDisplay}
                {compareAtPrice !== null && (
                  <span className="shop-discount-badge">
                    {formatDiscountPercent(product.price, compareAtPrice, settings.defaultLocale)}
                  </span>
                )}
                {settings.pricesIncludeTax && (
                  <span className="text-foreground/60 ml-2 text-sm">
                    {dict.product.vatIncluded}
                  </span>
                )}
              </p>

              {averageRating !== null && (
                <p className="mt-1.5 flex items-center gap-2 text-sm">
                  <StarRating rating={averageRating} />
                  <span className="text-foreground/70">({product.reviews.length})</span>
                  <a href="#reviews" className="text-primary hover:underline">
                    {dict.product.seeReviews}
                  </a>
                </p>
              )}

              <p className="mt-1.5 text-sm">
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

              {/* Size and color are both quick specs, not prose — one row
                  instead of two keeps the stack of facts above the
                  description from reading as a long list. */}
              {(sizeKey || isProductColorKey(product.color)) && (
                <p className="text-foreground/70 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {sizeKey && (
                    <span>
                      {dict.product.sizeLabel}: {dict.product[sizeKey]}
                    </span>
                  )}
                  {isProductColorKey(product.color) && (
                    <span className="inline-flex items-center gap-1.5">
                      {dict.products.colorLabel}:
                      <span
                        className="border-foreground/15 inline-block size-3.5 shrink-0 rounded-full border"
                        style={{ background: PRODUCT_COLOR_SWATCH[product.color] }}
                        aria-hidden="true"
                      />
                      {dict.products.colors[product.color]}
                    </span>
                  )}
                </p>
              )}

              {/* The full description with a deliberate "Read more", never a
                  sentence cut off mid-word. */}
              <ExpandableText
                text={description}
                moreLabel={dict.journal.readMore}
                lessLabel={dict.product.readLess}
                className="shop-prose"
              />

              <div className="shop-buy">
                <ProductPurchasePanel
                  product={cartProduct}
                  priceDisplay={priceDisplay}
                  dict={dict.product}
                  cartDict={dict.cart}
                  showBuyNow={!outOfStock}
                  wishlist={{
                    productId: product.id,
                    slug: product.slug,
                    name,
                    price: product.price,
                    currency: product.currency,
                    imageUrl: product.images[0]?.url ?? null,
                    initialSaved: Boolean(wishlistItem),
                    isSignedIn: Boolean(userId),
                    addLabel: dict.product.addToWishlist,
                    removeLabel: dict.product.removeFromWishlist,
                  }}
                />
              </div>

              <TrustBadges trustBadgeText={settings.trustBadgeText} dict={dict.product} />

              <div className="shop-gift-reassurance">
                <GiftIcon />
                <span>
                  <strong className="text-foreground block font-medium">
                    {dict.product.giftReassuranceTitle}
                  </strong>
                  <span className="text-foreground/70">{dict.product.giftReassuranceBody}</span>
                  <Link href="/gift-finder" className="shop-giftfinder-link">
                    <GiftFinderArrow />
                    <span>{dict.giftFinder.productCtaLine}</span>
                  </Link>
                </span>
              </div>

              {settings.giftCardEnabled && (
                <Link href="/personalised-gift-card" className="shop-gift-card-offer">
                  <span className="shop-gift-card-offer-kicker">{dict.giftCard.pdpTitle}</span>
                  <span className="shop-gift-card-offer-line">
                    {applyTemplate(dict.giftCard.pdpLine, {
                      price: formatMoney(
                        settings.giftCardPrice,
                        settings.defaultCurrency,
                        settings.defaultLocale
                      ),
                    })}
                  </span>
                  <span className="shop-gift-card-offer-body">{dict.giftCard.pdpBody}</span>
                  <span className="shop-gift-card-offer-cta">
                    {dict.giftCard.pdpCta} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              )}

              {/* Secondary information grouped instead of many small lines of
                  equal weight: each opens on demand. */}
              <div className="shop-info-details">
                <details>
                  <summary>{dict.product.shippingReturnsLabel}</summary>
                  <div>
                    {shippingBanner && <p>{shippingBanner}</p>}
                    <p>
                      {dict.product.returnsBadge}.{" "}
                      <Link href="/legal/returns">{dict.footer.returns}</Link>
                    </p>
                  </div>
                </details>
                <details>
                  <summary>{dict.product.careLabel}</summary>
                  <div>
                    <p>
                      {dict.product.careNote}{" "}
                      <Link href="/murano-glass#care">{dict.footer.muranoGuide}</Link>
                    </p>
                  </div>
                </details>
                <details>
                  <summary>{dict.footer.muranoGuide}</summary>
                  <div>
                    <p>
                      <Link href="/murano-glass#authenticity">{dict.product.authenticityLink}</Link>
                    </p>
                  </div>
                </details>
              </div>

              <div className="border-foreground/10 mt-6 border-t pt-4">
                <ShareButtons url={productUrl} title={name} dict={dict.product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The gift-box photo is a shared packaging shot reused across the
          catalog's galleries (see ProductGallery), not this product's own
          photography — deliberately, since every piece ships in the same box. */}
      <section className="shelf-section shelf-section--blush">
        <div className="shelf-wrap shop-gift-section">
          <div className="shop-gift-photo">
            <CatalogImage
              src="/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.png"
              alt={dict.product.giftSectionEyebrow}
              fill
              sizes="(min-width: 40rem) 45vw, 100vw"
            />
          </div>
          <div>
            <p className="shop-gift-eyebrow">{dict.product.giftSectionEyebrow}</p>
            <h2 className="shop-gift-headline">{dict.product.giftSectionHeadline}</h2>
            <p className="shop-gift-body">{dict.product.giftSectionBody}</p>
            <a href="#gift-packaging" className="shop-gift-link">
              {dict.product.giftSectionLink}
              <InlineArrowIcon />
            </a>
            <ul className="shop-gift-features">
              <li>
                <GiftIcon />
                {dict.product.giftFeature1}
              </li>
              <li>
                <HeartSmallIcon />
                {dict.product.giftFeature2}
              </li>
              <li>
                <SparkleIcon />
                {dict.product.giftFeature3}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {product.reviews.length > 0 && (
        <section id="reviews" className="shelf-section">
          <div className="shelf-wrap shop-reviews">
            <h2 className="shelf-heading">{dict.product.reviews}</h2>
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
      )}

      <section className="shelf-section">
        <div className="shelf-wrap">
          <div className={story ? "shop-story-faq-grid" : undefined}>
            {story && (
              <div className="shop-story">
                <h2 className="shelf-heading">{dict.product.storyTitle}</h2>
                <p className="shop-story-prose">{story}</p>
                <Link href="/blog/history-of-murano-glass" className="shelf-link">
                  {dict.journal.storyLink} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
            <FaqSection items={faq} dict={dict} variant="compact" />
          </div>
        </div>
      </section>

      {look && (
        <CompleteTheLook
          look={look}
          currentProductId={product.id}
          locale={settings.defaultLocale}
          dict={dict.look}
          outOfStockLabel={dict.product.outOfStock}
        />
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
