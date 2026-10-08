import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { PreviewBridge } from "@/components/layout-preview-bridge-server";
import { isLayoutPreview } from "@/lib/layout-preview-server";
import { pageEntries } from "@/lib/page-layout-store";
import type { PRODUCTS_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import { siteBaseUrl } from "@/lib/site-url";
import { z } from "zod";
import type { Metadata } from "next";
import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { ShelfItem } from "@/components/shelf-item";
import { homeFontClasses } from "@/app/home-fonts";
import "../home.css";
import "../shop.css";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";
import { isProductColorKey } from "@/lib/product-colors";
import { getGiftVoucherCopy } from "@/lib/gift-voucher-copy";
import { getShopCopy } from "@/lib/i18n/shop-copy";
import { applyTemplate } from "@/lib/i18n/format";
import { getShippingBanner } from "@/lib/shipping-banner";
import { TrustBadges } from "@/components/trust-badges";

const PAGE_SIZE = 12;

// Omitted = newest first, the order the catalog already used.
type SortKey = "price-asc" | "price-desc";

const filtersSchema = z.object({
  // `.catch`: a mangled ?sort= only drops the sort, instead of failing the
  // whole parse and silently discarding every filter with it.
  sort: z.enum(["price-asc", "price-desc"]).optional().catch(undefined),
  q: z.string().trim().min(1).optional(),
  category: z.array(z.string().trim().min(1)).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["1"]).optional(),
  // Only discounted pieces — the homepage "Special Selection" button.
  sale: z.enum(["1"]).optional(),
  color: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
});

async function baseMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const [settings, locale, raw] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    searchParams,
  ]);
  const dict = getDictionary(locale);
  const descriptionByLocale: Record<Locale, string> = {
    en: `Browse the full ${settings.storeName} catalog: handmade Murano glass jewelry, from bracelets to necklaces and earrings.`,
    it: `Collane, bracciali e orecchini in vetro di Murano, con perle lavorate a mano. Pezzi unici spediti dall'Italia: scopri il catalogo ${settings.storeName}.`,
    fr: `Parcourez le catalogue complet de ${settings.storeName}.`,
    de: `Durchstöbern Sie den vollständigen Katalog von ${settings.storeName}.`,
    ar: `تصفح كتالوج ${settings.storeName} الكامل.`,
    zh: `浏览 ${settings.storeName} 的完整产品目录。`,
    ru: `Просмотрите полный каталог ${settings.storeName}.`,
    es: `Explora el catálogo completo de ${settings.storeName}.`,
    pt: `Explore o catálogo completo da ${settings.storeName}.`,
    hi: `${settings.storeName} का पूरा कैटलॉग देखें।`,
    ja: `${settings.storeName}の全カタログをご覧ください。`,
  };
  const description = descriptionByLocale[locale];
  const image = ogImage(settings);
  // A search/filtered view (?q=, ?category=, ...) canonicalizes to the plain
  // catalog since it's a thin slice of the same content — but plain
  // pagination (?page=2 with nothing else set) is genuinely different
  // products, so it gets a self-referencing canonical instead of collapsing
  // every page into page 1.
  const isPlainPagination =
    !raw.q &&
    !raw.category &&
    !raw.minPrice &&
    !raw.maxPrice &&
    !raw.inStock &&
    !raw.color &&
    !raw.sale &&
    !raw.sort;
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const canonical =
    isPlainPagination && page && page !== "1" ? `/products?page=${page}` : "/products";
  return {
    title: dict.products.allProducts,
    description,
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
    openGraph: {
      title: dict.products.allProducts,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.products.allProducts,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export async function generateMetadata(
  props: Parameters<typeof baseMetadata>[0]
): Promise<Metadata> {
  return withPageMeta("/products", await baseMetadata(props));
}

type ProductsSectionId = (typeof PRODUCTS_SECTIONS)[number]["id"];

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const preview = await isLayoutPreview(searchParams);
  const entries = await pageEntries("products", { preview });
  const raw = await searchParams;
  const single = (value: string | string[] | undefined) => {
    const v = Array.isArray(value) ? value[0] : value;
    // A GET filter form always submits every field, including ones left at
    // their default ("" for the category <select>, "" for the hidden search
    // query) — treat those the same as "not provided" rather than letting
    // z.string().min(1) reject them and silently discard ALL filters.
    return v === "" ? undefined : v;
  };

  // Checkbox swatches all share name="color", so a real selection arrives as
  // an array (Next only gives a bare string for a single-valued param) —
  // and only real palette keys survive, so a tampered query string can't
  // reach the DB query below with an arbitrary value.
  const colorValues = (Array.isArray(raw.color) ? raw.color : raw.color ? [raw.color] : []).filter(
    isProductColorKey
  );

  // Category checkboxes share name="category" too: several can be ticked.
  const categoryValues = (
    Array.isArray(raw.category) ? raw.category : raw.category ? [raw.category] : []
  ).filter((value) => value.trim() !== "");

  const parsed = filtersSchema.safeParse({
    q: single(raw.q),
    category: categoryValues.length ? categoryValues : undefined,
    minPrice: single(raw.minPrice),
    maxPrice: single(raw.maxPrice),
    inStock: single(raw.inStock),
    sale: single(raw.sale),
    color: colorValues.length ? colorValues : undefined,
    sort: single(raw.sort),
    page: single(raw.page),
  });
  const filters = parsed.success ? parsed.data : { page: 1 };

  const [settings, categories, uiLocale, priceBounds] = await Promise.all([
    getStoreSettings(),
    db.category.findMany({ orderBy: { name: "asc" } }),
    getLocale(),
    db.product.aggregate({
      where: { active: true, unlisted: false },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);
  const dict = getDictionary(uiLocale);
  const shopCopy = getShopCopy(uiLocale);
  const shippingBanner = await getShippingBanner(
    dict.product.shippingBanner,
    settings.defaultCurrency,
    settings.defaultLocale
  );
  const priceMin = (priceBounds._min.price ?? 0) / 100;
  const priceMax = (priceBounds._max.price ?? 0) / 100;

  const where = {
    active: true,
    unlisted: false,
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q } },
        { nameEn: { contains: filters.q } },
        { description: { contains: filters.q } },
        { descriptionEn: { contains: filters.q } },
      ],
    }),
    ...(filters.category?.length && { category: { slug: { in: filters.category } } }),
    ...(filters.inStock && { stockQty: { gt: 0 } }),
    ...(filters.sale && { compareAtPrice: { not: null } }),
    ...(filters.color?.length && { color: { in: filters.color } }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: Math.round(filters.minPrice * 100) }),
        ...(filters.maxPrice !== undefined && { lte: Math.round(filters.maxPrice * 100) }),
      },
    }),
  };

  // Out-of-stock items are pushed to the end of the grid rather than left
  // wherever their creation date puts them — a dead-end "out of stock"
  // card mixed in with buyable ones just wastes the shopper's attention.
  // Prisma can't express "in-stock first" as a single orderBy on a plain
  // Int column, so this fetches the matching set's ids+stock cheaply,
  // resorts in JS (a stable sort, so createdAt-desc order is preserved
  // within each group), then fetches only the current page's ids in full.
  // Price sorts break ties newest-first, and the in-stock-first pass below
  // still applies on top, so a sold-out piece never leads a price-sorted grid.
  const orderBy =
    filters.sort === "price-asc"
      ? [{ price: "asc" as const }, { createdAt: "desc" as const }]
      : filters.sort === "price-desc"
        ? [{ price: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];
  const allMatchingIds = await db.product.findMany({
    where,
    orderBy,
    select: { id: true, stockQty: true, price: true, compareAtPrice: true },
  });
  // Prisma can't compare two columns in a where, so "compare-at above price"
  // (a real discount, same rule as the shelf cards) is checked here.
  const matching = filters.sale
    ? allMatchingIds.filter((p) => p.compareAtPrice !== null && p.compareAtPrice > p.price)
    : allMatchingIds;
  const sortedIds = [...matching].sort((a, b) => Number(b.stockQty > 0) - Number(a.stockQty > 0));
  const total = sortedIds.length;
  const pageIds = sortedIds
    .slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE)
    .map((p) => p.id);

  // One grouped query for the ratings of just this page's pieces; a piece with
  // no reviews has no row, so it simply shows no stars.
  const [pageProducts, ratingRows] = pageIds.length
    ? await Promise.all([
        db.product.findMany({
          where: { id: { in: pageIds } },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        db.review.groupBy({
          by: ["productId"],
          where: { productId: { in: pageIds } },
          _avg: { rating: true },
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const productById = new Map(pageProducts.map((p) => [p.id, p]));
  const products = pageIds.map((id) => productById.get(id)!).filter(Boolean);
  const ratingById = new Map(
    ratingRows.flatMap((row) =>
      row._avg.rating === null
        ? []
        : [[row.productId, { average: row._avg.rating, count: row._count._all }] as const]
    )
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Keeps every active filter; `page` is left out when it is not given, so a
  // sort link always lands back on page 1.
  const buildHref = ({ page, sort }: { page?: number; sort?: SortKey }) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    for (const category of filters.category ?? []) params.append("category", category);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.inStock) params.set("inStock", filters.inStock);
    if (filters.sale) params.set("sale", filters.sale);
    for (const color of filters.color ?? []) params.append("color", color);
    if (sort) params.set("sort", sort);
    if (page !== undefined) params.set("page", String(page));
    return params.size ? `/products?${params.toString()}` : "/products";
  };
  const buildPageHref = (page: number) => buildHref({ page, sort: filters.sort });
  const sortOptions: { key: SortKey | undefined; label: string }[] = [
    { key: undefined, label: shopCopy.sortNewest },
    { key: "price-asc", label: shopCopy.sortPriceAsc },
    { key: "price-desc", label: shopCopy.sortPriceDesc },
  ];

  // Only for the plain, unfiltered catalog view — a search/filter result is
  // a thin, high-cardinality slice that isn't worth asserting as a
  // canonical ItemList.
  const isPlainBrowse =
    !filters.q &&
    !filters.category?.length &&
    !filters.minPrice &&
    !filters.maxPrice &&
    !filters.color &&
    !filters.sale &&
    !filters.sort;
  const itemListJsonLd =
    isPlainBrowse && products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: (filters.page - 1) * PAGE_SIZE + index + 1,
            name: localizedName(product, uiLocale),
            url: `${siteBaseUrl(settings)}/products/${product.slug}`,
          })),
        }
      : null;

  // "Clear filters" keeps the search and the sale view, just drops the rest.
  const clearParams = new URLSearchParams();
  if (filters.q) clearParams.set("q", filters.q);
  if (filters.sale) clearParams.set("sale", filters.sale);
  if (filters.sort) clearParams.set("sort", filters.sort);
  const clearHref = clearParams.size ? `/products?${clearParams.toString()}` : "/products";

  const sections: Record<ProductsSectionId, ReactNode> = {
    head: (
      <header className="shop-head">
        <div className="shelf-wrap shelf-wrap--wide">
          <h1 className="shop-title">
            {filters.q
              ? dict.products.resultsFor(filters.q)
              : filters.sale
                ? dict.home.specialSelectionTitle
                : dict.products.allProducts}
          </h1>
          {/* The reassurances a shopper looks for before committing, in the
              store's own already-translated copy (the product page uses the
              same strings): shipping first, since it is the strongest one.
              The full row is hidden on phones, where it would push the first
              row of pieces below the fold. */}
          {shippingBanner && <p className="shop-promise">{shippingBanner}</p>}
          <div className="hidden sm:block">
            <TrustBadges trustBadgeText={settings.trustBadgeText} dict={dict.product} />
          </div>
        </div>
      </header>
    ),
    list: (
      <>
        {!filters.q && !filters.category?.length && !filters.sale && filters.page === 1 && (
          <nav
            className="shelf-wrap shelf-wrap--wide shop-chips shop-catalog-paths"
            aria-label={dict.footer.shopHeading}
          >
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="shop-chip">
                {localizedName(category, uiLocale)}
              </Link>
            ))}
            <Link href="/gift-finder" className="shop-chip">
              {dict.giftFinder.metaTitle}
            </Link>
            <Link href="/gift-card" className="shop-chip">
              {getGiftVoucherCopy(uiLocale).purchaseLabel}
            </Link>
            {settings.giftCardEnabled && (
              <Link href="/personalised-gift-card" className="shop-chip">
                {dict.giftCard.productName}
              </Link>
            )}
            <Link href="/murano-glass" className="shop-chip">
              {dict.footer.muranoGuide}
            </Link>
          </nav>
        )}

        <div className="shelf-wrap shelf-wrap--wide shop-layout">
          <ProductFilterPanel
            dict={dict.products}
            categories={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: localizedName(c, uiLocale),
            }))}
            filters={filters}
            priceMin={priceMin}
            priceMax={priceMax}
            currency={settings.defaultCurrency}
            locale={settings.defaultLocale}
            clearHref={clearHref}
            priceLabels={{
              min: dict.feedback.minPriceLabel,
              max: dict.feedback.maxPriceLabel,
            }}
          />

          <section className="shop-results">
            {products.length === 0 ? (
              // A dead end loses the shopper; hand them a way back instead.
              <div className="shop-empty">
                <p className="shelf-note">{dict.products.noResults}</p>
                <p className="shop-empty-hint">{shopCopy.emptyHint}</p>
                <div className="shop-chips">
                  <Link href="/products" className="shop-chip">
                    {dict.footer.allProducts}
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="shop-chip"
                    >
                      {localizedName(category, uiLocale)}
                    </Link>
                  ))}
                  <Link href="/gift-finder" className="shop-chip">
                    {dict.giftFinder.metaTitle}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="shop-toolbar">
                  <p className="shop-count" aria-live="polite">
                    {shopCopy.pieceCount(total)}
                  </p>
                  {total > 1 && (
                    <nav className="shop-sort" aria-label={shopCopy.sortLabel}>
                      <span className="shop-sort-label" aria-hidden="true">
                        {shopCopy.sortLabel}
                      </span>
                      <ul>
                        {sortOptions.map((option) => (
                          <li key={option.key ?? "newest"}>
                            <Link
                              href={buildHref({ sort: option.key })}
                              // Same catalog, reordered: nothing for a crawler to follow.
                              rel="nofollow"
                              aria-current={filters.sort === option.key ? "true" : undefined}
                              className="shop-sort-link"
                            >
                              {option.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </div>
                <ul className="shop-grid">
                  {products.map((product) => {
                    const rating = ratingById.get(product.id);
                    // Untracked pieces have no real stock count, so never claim one.
                    const lowStock =
                      product.trackInventory &&
                      product.stockQty > 0 &&
                      product.stockQty <= product.lowStockThreshold;
                    return (
                      <ShelfItem
                        key={product.slug}
                        product={localizedCardProduct(product, uiLocale)}
                        locale={settings.defaultLocale}
                        outOfStockLabel={dict.product.outOfStock}
                        quickAddLabel={dict.product.addToCart}
                        addedLabel={dict.product.added}
                        sizes="(min-width: 40rem) 20vw, 50vw"
                        rating={
                          rating && {
                            ...rating,
                            label: `${rating.average.toFixed(1)}/5 · ${applyTemplate(dict.product.reviewCount, { n: rating.count })}`,
                          }
                        }
                        scarcityLabel={
                          lowStock
                            ? applyTemplate(dict.product.onlyLeft, { n: product.stockQty })
                            : undefined
                        }
                      />
                    );
                  })}
                </ul>
              </>
            )}

            <Pagination
              totalPages={totalPages}
              currentPage={filters.page}
              buildHref={buildPageHref}
              label={dict.feedback.paginationLabel}
            />
          </section>
        </div>
      </>
    ),
  };

  return (
    <main className={`shelf flex flex-1 flex-col ${homeFontClasses}`}>
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(itemListJsonLd) }}
        />
      )}
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry} preview={preview}>
          {entry.custom ? null : sections[entry.id as ProductsSectionId]}
        </LayoutSection>
      ))}
      {preview && <PreviewBridge target="products" />}
    </main>
  );
}
