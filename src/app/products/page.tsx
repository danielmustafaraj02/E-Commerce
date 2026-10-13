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
import { localizedName } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { homeFontClasses } from "@/app/home-fonts";
import "../home.css";
import "../shop.css";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";
import { isProductColorKey } from "@/lib/product-colors";
import { getShopCopy } from "@/lib/i18n/shop-copy";
import { formatMoney } from "@/lib/format";
import { activeFilterChips, clearFiltersHref, listingHref, type SortKey } from "@/lib/shop-filters";
import { ActiveFilters, ShopGrid, ShopToolbar, listingRatings } from "@/components/shop-listing";
import { getShippingBanner } from "@/lib/shipping-banner";
import { NEW_COLLECTION, getNewCollectionCopy } from "@/lib/new-collection";

const PAGE_SIZE = 12;

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
  // Only the new collection's pieces (lib/new-collection.ts). Set by the
  // /new-collection page itself, which renders this same listing.
  collection: z.enum(["new"]).optional().catch(undefined),
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
    en: `The full ${settings.storeName} collection: Murano glass necklaces, bracelets and earrings, chosen piece by piece and shipped from Italy.`,
    it: `Tutta la collezione ${settings.storeName}: collane, bracciali e orecchini in vetro di Murano, scelti pezzo per pezzo e spediti dall'Italia.`,
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
    collection: single(raw.collection),
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
    ...(filters.collection === "new" && { slug: { contains: NEW_COLLECTION.slugMarker } }),
    ...(filters.color?.length && { color: { in: filters.color } }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: Math.round(filters.minPrice * 100) }),
        ...(filters.maxPrice !== undefined && { lte: Math.round(filters.maxPrice * 100) }),
      },
    }),
  };

  // Every price in the current selection, but not narrowed by the price
  // filter itself: the chart above the price slider shows the whole spread
  // the shopper is choosing from.
  const { price: _priceFilter, ...withoutPrice } = where as typeof where & { price?: unknown };
  const chartPrices = (
    await db.product.findMany({ where: withoutPrice, select: { price: true } })
  ).map((p) => p.price / 100);

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

  // Just this page's pieces, and their ratings (a piece with no reviews simply
  // shows no stars).
  const [pageProducts, ratingById] = await Promise.all([
    pageIds.length
      ? db.product.findMany({
          where: { id: { in: pageIds } },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        })
      : [],
    listingRatings(pageIds),
  ]);
  const productById = new Map(pageProducts.map((p) => [p.id, p]));
  const products = pageIds.map((id) => productById.get(id)!).filter(Boolean);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* The new collection lives at its own address; its pagination, sorting and
     "clear filters" links stay on it (the collection is implied by the path). */
  const newCollection = filters.collection === "new" ? getNewCollectionCopy(uiLocale) : null;
  const basePath = newCollection ? NEW_COLLECTION.path : "/products";

  const buildPageHref = (page: number) => listingHref(basePath, filters, page);
  const sortHref = (sort?: SortKey) => listingHref(basePath, { ...filters, sort });

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
  const clearHref = clearFiltersHref(basePath, filters);
  const categoryNames = new Map(categories.map((c) => [c.slug, localizedName(c, uiLocale)]));
  const money = (euros: number) =>
    formatMoney(Math.round(euros * 100), settings.defaultCurrency, settings.defaultLocale);
  const chips = activeFilterChips(basePath, filters, {
    category: (slug) => categoryNames.get(slug) ?? slug,
    color: (key) => (isProductColorKey(key) ? dict.products.colors[key] : key),
    price: `${money(filters.minPrice ?? priceMin)} – ${money(filters.maxPrice ?? priceMax)}`,
    inStock: dict.products.inStockOnly,
  });
  const intro = newCollection
    ? newCollection.intro
    : filters.sale
      ? shopCopy.saleIntro
      : shopCopy.catalogIntro;

  const sections: Record<ProductsSectionId, ReactNode> = {
    head: (
      <header className="shop-head">
        <div className="shelf-wrap shelf-wrap--wide">
          <h1 className="shop-title">
            {filters.q
              ? dict.products.resultsFor(filters.q)
              : newCollection
                ? newCollection.title
                : filters.sale
                  ? dict.home.specialSelectionTitle
                  : dict.products.allProducts}
          </h1>
          {!filters.q && <p className="shop-intro">{intro}</p>}
          {/* The reassurances a shopper looks for before committing, in the
              store's own already-translated copy (the product page uses the
              same strings): shipping first, since it is the strongest one.
              The full row is hidden on phones, where it would push the first
              row of pieces below the fold. */}
          {/* One quiet line of practical facts. The ticked badge row that used
              to sit here read like checkboxes, so it now lives only on the
              product page, beside the buy button where it reassures. */}
          {shippingBanner && <p className="shop-promise">{shippingBanner}</p>}
        </div>
      </header>
    ),
    list: (
      <>
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
            prices={chartPrices}
            rangeLabels={{ one: shopCopy.rangeOne, many: shopCopy.rangeMany }}
          />

          <section className="shop-results">
            {products.length > 0 && (
              <ShopToolbar total={total} copy={shopCopy} sort={filters.sort} sortHref={sortHref} />
            )}
            <ActiveFilters
              chips={chips}
              clearHref={clearHref}
              copy={shopCopy}
              clearLabel={dict.products.clearFilters}
            />
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
              <ShopGrid
                products={products}
                ratings={ratingById}
                locale={uiLocale}
                catalogLocale={settings.defaultLocale}
                dict={dict}
              />
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
