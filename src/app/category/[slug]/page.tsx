import { siteBaseUrl } from "@/lib/site-url";
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedDescription, localizedCardProduct } from "@/lib/product-i18n";
import { firstParagraph, paragraphs, truncateAtWord } from "@/lib/text";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { ShelfItem } from "@/components/shelf-item";
import { homeFontClasses } from "@/app/home-fonts";
import "../../home.css";
import "../../shop.css";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";
import { isProductColorKey } from "@/lib/product-colors";

const PAGE_SIZE = 12;

const filtersSchema = z.object({
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["1"]).optional(),
  color: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
});

const getCategory = cache((slug: string) =>
  db.category.findUnique({ where: { slug }, include: { children: true } })
);

export async function generateMetadata({
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
  const descriptionByLocale: Record<Locale, string> = {
    en: `Shop handmade Murano glass ${name.toLowerCase()} at ${settings.storeName}, filterable by price and availability.`,
    it: `Scopri i ${name.toLowerCase()} in vetro di Murano fatto a mano di ${settings.storeName}, filtrabili per prezzo e disponibilità.`,
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
  const isPlainPagination = !raw.minPrice && !raw.maxPrice && !raw.inStock && !raw.color;
  const canonical =
    isPlainPagination && page && /^[2-9]\d*$|^1\d+$/.test(page)
      ? `/category/${category.slug}?page=${page}`
      : `/category/${category.slug}`;
  return {
    title,
    description,
    alternates: { canonical, languages: hreflangAlternates(canonical) },
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

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
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
  const categoryName = localizedName(category, uiLocale);
  const copy = localizedDescription(category, uiLocale);

  const where = {
    active: true,
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
  // grid instead of leaving them wherever createdAt puts them.
  const [allMatchingIds, priceBounds] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, stockQty: true },
    }),
    db.product.aggregate({
      where: { active: true, categoryId: category.id },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);
  const sortedIds = [...allMatchingIds].sort(
    (a, b) => Number(b.stockQty > 0) - Number(a.stockQty > 0)
  );
  const total = sortedIds.length;
  const pageIds = sortedIds
    .slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE)
    .map((p) => p.id);

  const pageProducts = pageIds.length
    ? await db.product.findMany({
        where: { id: { in: pageIds } },
        include: { images: { take: 1, orderBy: { position: "asc" } } },
      })
    : [];
  const productById = new Map(pageProducts.map((p) => [p.id, p]));
  const products = pageIds.map((id) => productById.get(id)!).filter(Boolean);

  const priceMin = (priceBounds._min.price ?? 0) / 100;
  const priceMax = (priceBounds._max.price ?? 0) / 100;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.inStock) params.set("inStock", filters.inStock);
    for (const color of filters.color ?? []) params.append("color", color);
    params.set("page", String(page));
    return `/category/${category.slug}?${params.toString()}`;
  };

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
      <header className="shop-head">
        <div className="shelf-wrap shelf-wrap--wide">
          <h1 className="shop-title">{categoryName}</h1>
          {category.children.length > 0 && (
            <div className="shop-chips">
              {category.children.map((child) => (
                <a key={child.id} href={`/category/${child.slug}`} className="shop-chip">
                  {localizedName(child, uiLocale)}
                </a>
              ))}
            </div>
          )}
          <nav className="shop-chips" aria-label={dict.footer.shopHeading}>
            <Link href="/products" className="shop-chip">
              {dict.footer.allProducts}
            </Link>
            <Link href="/gift-finder" className="shop-chip">
              {dict.giftFinder.metaTitle}
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
        </div>
      </header>

      <div className="shelf-wrap shelf-wrap--wide shop-layout">
        <ProductFilterPanel
          dict={dict.products}
          showCategory={false}
          filters={filters}
          priceMin={priceMin}
          priceMax={priceMax}
          currency={settings.defaultCurrency}
          locale={settings.defaultLocale}
          clearHref={`/category/${category.slug}`}
          priceLabels={{
            min: dict.feedback.minPriceLabel,
            max: dict.feedback.maxPriceLabel,
          }}
        />

        <section className="shop-results">
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
            <ul className="shop-grid">
              {products.map((product) => (
                <ShelfItem
                  key={product.slug}
                  product={localizedCardProduct(product, uiLocale)}
                  locale={settings.defaultLocale}
                  outOfStockLabel={dict.product.outOfStock}
                  quickAddLabel={dict.product.addToCart}
                  addedLabel={dict.product.added}
                  sizes="(min-width: 40rem) 20vw, 50vw"
                />
              ))}
            </ul>
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
    </main>
  );
}
