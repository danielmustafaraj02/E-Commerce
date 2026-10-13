import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { PreviewBridge } from "@/components/layout-preview-bridge-server";
import { isLayoutPreview } from "@/lib/layout-preview-server";
import { pageEntries } from "@/lib/page-layout-store";
import type { CATEGORY_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
import { siteBaseUrl } from "@/lib/site-url";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { categoryIntro, getShopCopy } from "@/lib/i18n/shop-copy";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedDescription } from "@/lib/product-i18n";
import { firstParagraph, paragraphs, truncateAtWord } from "@/lib/text";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { homeFontClasses } from "@/app/home-fonts";
import "../../home.css";
import "../../shop.css";
import { Link } from "@/components/localized-link";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";
import { isProductColorKey } from "@/lib/product-colors";
import { formatMoney } from "@/lib/format";
import { getShippingBanner } from "@/lib/shipping-banner";
import { activeFilterChips, clearFiltersHref, listingHref, type SortKey } from "@/lib/shop-filters";
import { ActiveFilters, ShopGrid, ShopToolbar, listingRatings } from "@/components/shop-listing";

const PAGE_SIZE = 12;

const filtersSchema = z.object({
  // Same orders as /products; a mangled ?sort= only drops the sort.
  sort: z.enum(["price-asc", "price-desc"]).optional().catch(undefined),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["1"]).optional(),
  color: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
});

const getCategory = cache((slug: string) =>
  db.category.findUnique({ where: { slug }, include: { children: true } })
);

async function baseMetadata({
  params,
  searchParams,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const raw = await searchParams;
  const [settings, locale, category] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getCategory(slug),
  ]);
  if (!category) return {};

  const name = localizedName(category, locale);
  // "Murano Glass"/"Vetro di Murano" baked into the title deliberately —
  // see the note on home.heroSubtitle in dictionaries.ts for why this
  // store's pages carry store-specific keywords rather than the
  // platform-generic default.
  const titleByLocale: Record<Locale, string> = {
    en: `Murano Glass ${name}`,
    it: `${name} in Vetro di Murano`,
    fr: `${name} en Verre de Murano`,
    de: `${name} aus Muranoglas`,
    ar: `${name} من زجاج مورانو`,
    zh: `穆拉诺玻璃${name}`,
    ru: `${name} из муранского стекла`,
    es: `${name} de Vidrio de Murano`,
    pt: `${name} em Vidro de Murano`,
    hi: `मुरानो ग्लास ${name}`,
    ja: `ムラノガラスの${name}`,
  };
  const title = titleByLocale[locale];
  // English and Italian: each of the three collections gets its own line (one
  // template for all three made the snippets near-duplicates), and none claims
  // the beads are shaped by hand, which is not verified for every piece.
  const store = settings.storeName;
  const collectionLine: Record<string, { en: string; it: string }> = {
    collane: {
      en: `Murano glass necklaces from ${store}: strands of glass beads worn close to the face, in colours from deep ruby to soft sage, each chosen on its own.`,
      it: `Collane in vetro di Murano di ${store}: fili di perle di vetro da portare vicino al viso, dal rosso rubino al verde salvia, scelte una a una.`,
    },
    bracciali: {
      en: `Murano glass bracelets from ${store}: colour and texture gathered around the wrist, glass beads that move with every gesture.`,
      it: `Bracciali in vetro di Murano di ${store}: colore e materia intorno al polso, perle di vetro che si muovono a ogni gesto.`,
    },
    orecchini: {
      en: `Murano glass earrings from ${store}: light to wear, with a small flash of colour each time you turn your head.`,
      it: `Orecchini in vetro di Murano di ${store}: leggeri da portare, con un lampo di colore ogni volta che ti volti.`,
    },
  };
  const collection = Object.entries(collectionLine).find(([prefix]) =>
    category.slug.startsWith(prefix)
  )?.[1];
  const descriptionByLocale: Record<Locale, string> = {
    en:
      collection?.en ??
      `Murano glass ${name.toLowerCase()} from ${store}, chosen piece by piece and shipped from Italy in a gift box.`,
    // No article before the name: "i/le/gli" depends on the category's gender.
    it:
      collection?.it ??
      `${name} in vetro di Murano: una selezione di ${store}, spedita dall'Italia in confezione regalo.`,
    fr: `Découvrez les ${name.toLowerCase()} en verre de Murano fait main de ${settings.storeName}, filtrables par prix et disponibilité.`,
    de: `Entdecken Sie handgefertigte ${name.toLowerCase()} aus Muranoglas von ${settings.storeName}, filterbar nach Preis und Verfügbarkeit.`,
    ar: `تسوق ${name} يدوية الصنع من زجاج مورانو في ${settings.storeName}، قابلة للتصفية حسب السعر والتوفر.`,
    zh: `在 ${settings.storeName} 选购手工穆拉诺玻璃${name}，可按价格和库存筛选。`,
    ru: `Покупайте ${name.toLowerCase()} ручной работы из муранского стекла в ${settings.storeName}, с фильтрацией по цене и наличию.`,
    es: `Compra ${name.toLowerCase()} de vidrio de Murano hechos a mano en ${settings.storeName}, filtrables por precio y disponibilidad.`,
    pt: `Compre ${name.toLowerCase()} em vidro de Murano feitos à mão na ${settings.storeName}, filtráveis por preço e disponibilidade.`,
    hi: `${settings.storeName} पर हाथ से बने मुरानो ग्लास ${name} खरीदें, कीमत और उपलब्धता के अनुसार फ़िल्टर करने योग्य।`,
    ja: `${settings.storeName}で手作りのムラノガラス${name}をお買い求めください。価格や在庫状況で絞り込めます。`,
  };
  // Copy written for this category (admin > Categories) makes a better snippet
  // than the generic line below, which is only the fallback.
  // Only page 1 uses it: later pages show different products under their own
  // canonical, so they keep the generic line rather than repeating page 1's.
  const pageParam = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const copy = localizedDescription(category, locale);
  const description =
    copy && (!pageParam || pageParam === "1")
      ? truncateAtWord(firstParagraph(copy).replace(/\s+/g, " "), 155)
      : descriptionByLocale[locale];
  const image = ogImage(settings);
  // A filtered view (?minPrice=, ?inStock=, ...) is a thin slice of the same
  // category, so it canonicalizes to the plain page. Plain pagination
  // (?page=2 with nothing else) is genuinely different products, so it gets a
  // self-referencing canonical — same rule as /products.
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const isPlainPagination = !raw.minPrice && !raw.maxPrice && !raw.inStock && !raw.color && !raw.sort;
  const canonical =
    isPlainPagination && page && /^[2-9]\d*$|^1\d+$/.test(page)
      ? `/category/${category.slug}?page=${page}`
      : `/category/${category.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: localizedCanonical(locale, canonical),
      languages: hreflangAlternates(canonical),
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export async function generateMetadata(
  props: Parameters<typeof baseMetadata>[0]
): Promise<Metadata> {
  return withPageMeta(`category:${(await props.params).slug}`, await baseMetadata(props));
}

type CategorySectionId = (typeof CATEGORY_SECTIONS)[number]["id"];

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const preview = await isLayoutPreview(searchParams);
  const entries = await pageEntries("category", { preview });
  const { slug } = await params;
  const raw = await searchParams;
  const single = (value: string | string[] | undefined) => {
    const v = Array.isArray(value) ? value[0] : value;
    return v === "" ? undefined : v;
  };

  // See src/app/products/page.tsx for why color needs its own array
  // normalization ahead of the schema parse.
  const colorValues = (Array.isArray(raw.color) ? raw.color : raw.color ? [raw.color] : []).filter(
    isProductColorKey
  );

  const parsed = filtersSchema.safeParse({
    minPrice: single(raw.minPrice),
    maxPrice: single(raw.maxPrice),
    inStock: single(raw.inStock),
    color: colorValues.length ? colorValues : undefined,
    sort: single(raw.sort),
    page: single(raw.page),
  });
  const filters = parsed.success ? parsed.data : { page: 1 };

  const [settings, uiLocale, category] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getCategory(slug),
  ]);

  if (!category) notFound();
  const dict = getDictionary(uiLocale);
  const shopCopy = getShopCopy(uiLocale);
  const categoryName = localizedName(category, uiLocale);
  const copy = localizedDescription(category, uiLocale);
  const shippingBanner = await getShippingBanner(
    dict.product.shippingBanner,
    settings.defaultCurrency,
    settings.defaultLocale
  );

  const where = {
    active: true,
    unlisted: false,
    categoryId: category.id,
    ...(filters.inStock && { stockQty: { gt: 0 } }),
    ...(filters.color?.length && { color: { in: filters.color } }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: Math.round(filters.minPrice * 100) }),
        ...(filters.maxPrice !== undefined && { lte: Math.round(filters.maxPrice * 100) }),
      },
    }),
  };

  // See src/app/products/page.tsx for why this doesn't just add stockQty
  // to the Prisma orderBy — pushes out-of-stock items to the end of the
  // grid instead of leaving them wherever createdAt puts them. Price sorts
  // break ties newest-first, as there.
  // Every price in the current selection, but not narrowed by the price
  // filter itself: the chart above the price slider shows the whole spread
  // the shopper is choosing from (as on /products).
  const { price: _priceFilter, ...withoutPrice } = where as typeof where & { price?: unknown };
  const [allMatchingIds, priceBounds, chartRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy:
        filters.sort === "price-asc"
          ? [{ price: "asc" }, { createdAt: "desc" }]
          : filters.sort === "price-desc"
            ? [{ price: "desc" }, { createdAt: "desc" }]
            : [{ createdAt: "desc" }],
      select: { id: true, stockQty: true },
    }),
    db.product.aggregate({
      where: { active: true, unlisted: false, categoryId: category.id },
      _min: { price: true },
      _max: { price: true },
    }),
    db.product.findMany({ where: withoutPrice, select: { price: true } }),
  ]);
  const chartPrices = chartRows.map((p) => p.price / 100);
  const sortedIds = [...allMatchingIds].sort(
    (a, b) => Number(b.stockQty > 0) - Number(a.stockQty > 0)
  );
  const total = sortedIds.length;
  const pageIds = sortedIds
    .slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE)
    .map((p) => p.id);

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

  const priceMin = (priceBounds._min.price ?? 0) / 100;
  const priceMax = (priceBounds._max.price ?? 0) / 100;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const basePath = `/category/${category.slug}`;
  const buildPageHref = (page: number) => listingHref(basePath, filters, page);
  const sortHref = (sort?: SortKey) => listingHref(basePath, { ...filters, sort });
  const clearHref = clearFiltersHref(basePath, filters);
  const money = (euros: number) =>
    formatMoney(Math.round(euros * 100), settings.defaultCurrency, settings.defaultLocale);
  const chips = activeFilterChips(basePath, filters, {
    category: (slug) => slug,
    color: (key) => (isProductColorKey(key) ? dict.products.colors[key] : key),
    price: `${money(filters.minPrice ?? priceMin)} – ${money(filters.maxPrice ?? priceMax)}`,
    inStock: dict.products.inStockOnly,
  });
  const intro = categoryIntro(shopCopy, category.slug);

  const base = siteBaseUrl(settings);
  const categoryUrl = `${base}/category/${category.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: settings.storeName, item: base || undefined },
      { "@type": "ListItem", position: 2, name: categoryName, item: categoryUrl },
    ],
  };

  // A lightweight ItemList of the current page's products — lets an AI
  // answer engine (or Google) enumerate what this category actually
  // contains without having to render/parse the product grid itself.
  const itemListJsonLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: (filters.page - 1) * PAGE_SIZE + index + 1,
            name: localizedName(product, uiLocale),
            url: `${base}/products/${product.slug}`,
          })),
        }
      : null;

  const sections: Record<CategorySectionId, ReactNode> = {
    head: (
      <header className="shop-head">
        <div className="shelf-wrap shelf-wrap--wide">
          <h1 className="shop-title">{categoryName}</h1>
          {intro && <p className="shop-intro">{intro}</p>}
          {shippingBanner && <p className="shop-promise">{shippingBanner}</p>}
          {category.children.length > 0 && (
            <div className="shop-chips">
              {category.children.map((child) => (
                <Link key={child.id} href={`/category/${child.slug}`} className="shop-chip">
                  {localizedName(child, uiLocale)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
    ),
    list: (
      <>
        <div className="shelf-wrap shelf-wrap--wide shop-layout">
          <ProductFilterPanel
            dict={dict.products}
            showCategory={false}
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
              <p className="shelf-note">
                {total === 0 &&
                filters.page === 1 &&
                !filters.minPrice &&
                !filters.maxPrice &&
                !filters.inStock &&
                !filters.color?.length
                  ? dict.products.noProductsInCategory
                  : dict.products.noResults}
              </p>
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

            {filters.page === 1 && copy && (
              <section className="shop-copy">
                {paragraphs(copy).map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
              </section>
            )}
          </section>
        </div>
      </>
    ),
  };

  return (
    <main className={`shelf flex flex-1 flex-col ${homeFontClasses}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(itemListJsonLd) }}
        />
      )}
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry} preview={preview}>
          {entry.custom ? null : sections[entry.id as CategorySectionId]}
        </LayoutSection>
      ))}
      {preview && <PreviewBridge target="category" />}
    </main>
  );
}
