import { siteBaseUrl } from "@/lib/site-url";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { ProductCard } from "@/components/product-card";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 12;

const filtersSchema = z.object({
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["1"]).optional(),
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
  const description = descriptionByLocale[locale];
  const image = ogImage(settings);
  // A filtered view (?minPrice=, ?inStock=, ...) is a thin slice of the same
  // category, so it canonicalizes to the plain page. Plain pagination
  // (?page=2 with nothing else) is genuinely different products, so it gets a
  // self-referencing canonical — same rule as /products.
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const isPlainPagination = !raw.minPrice && !raw.maxPrice && !raw.inStock;
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

  const parsed = filtersSchema.safeParse({
    minPrice: single(raw.minPrice),
    maxPrice: single(raw.maxPrice),
    inStock: single(raw.inStock),
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

  const where = {
    active: true,
    categoryId: category.id,
    ...(filters.inStock && { stockQty: { gt: 0 } }),
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
    db.product.findMany({ where, orderBy: { createdAt: "desc" }, select: { id: true, stockQty: true } }),
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-16 sm:flex-row">
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
      <ProductFilterPanel
        dict={dict.products}
        showCategory={false}
        filters={filters}
        priceMin={priceMin}
        priceMax={priceMax}
        currency={settings.defaultCurrency}
        locale={settings.defaultLocale}
        clearHref={`/category/${category.slug}`}
      />

      <section className="flex-1">
        <h1 className="mb-2 text-2xl font-semibold">{categoryName}</h1>

        {category.children.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            {category.children.map((child) => (
              <a
                key={child.id}
                href={`/category/${child.slug}`}
                className="border-foreground/20 hover:text-primary rounded border px-3 py-1"
              >
                {localizedName(child, uiLocale)}
              </a>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-foreground/70 text-sm">
            {total === 0 && filters.page === 1 && !filters.minPrice && !filters.maxPrice && !filters.inStock
              ? dict.products.noProductsInCategory
              : dict.products.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={localizedCardProduct(product, uiLocale)}
                locale={settings.defaultLocale}
                outOfStockLabel={dict.product.outOfStock}
                quickAddLabel={dict.product.addToCart}
                addedLabel={dict.product.added}
              />
            ))}
          </div>
        )}

        <Pagination totalPages={totalPages} currentPage={filters.page} buildHref={buildPageHref} />
      </section>
    </main>
  );
}
