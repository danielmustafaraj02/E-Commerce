import { z } from "zod";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName, localizedCardProduct } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/hreflang";
import { ProductCard } from "@/components/product-card";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 12;

const filtersSchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.enum(["1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
});

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const [settings, locale, raw] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    searchParams,
  ]);
  const dict = getDictionary(locale);
  const description =
    locale === "en"
      ? `Browse the full ${settings.storeName} catalog.`
      : `Sfoglia il catalogo completo di ${settings.storeName}.`;
  const image = ogImage(settings);
  // A search/filtered view (?q=, ?category=, ...) canonicalizes to the plain
  // catalog since it's a thin slice of the same content — but plain
  // pagination (?page=2 with nothing else set) is genuinely different
  // products, so it gets a self-referencing canonical instead of collapsing
  // every page into page 1.
  const isPlainPagination =
    !raw.q && !raw.category && !raw.minPrice && !raw.maxPrice && !raw.inStock;
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const canonical = isPlainPagination && page && page !== "1" ? `/products?page=${page}` : "/products";
  return {
    title: dict.products.allProducts,
    description,
    alternates: { canonical, languages: hreflangAlternates(canonical) },
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

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const raw = await searchParams;
  const single = (value: string | string[] | undefined) => {
    const v = Array.isArray(value) ? value[0] : value;
    // A GET filter form always submits every field, including ones left at
    // their default ("" for the category <select>, "" for the hidden search
    // query) — treat those the same as "not provided" rather than letting
    // z.string().min(1) reject them and silently discard ALL filters.
    return v === "" ? undefined : v;
  };

  const parsed = filtersSchema.safeParse({
    q: single(raw.q),
    category: single(raw.category),
    minPrice: single(raw.minPrice),
    maxPrice: single(raw.maxPrice),
    inStock: single(raw.inStock),
    page: single(raw.page),
  });
  const filters = parsed.success ? parsed.data : { page: 1 };

  const [settings, categories, uiLocale, priceBounds] = await Promise.all([
    getStoreSettings(),
    db.category.findMany({ orderBy: { name: "asc" } }),
    getLocale(),
    db.product.aggregate({ where: { active: true }, _min: { price: true }, _max: { price: true } }),
  ]);
  const dict = getDictionary(uiLocale);
  const priceMin = (priceBounds._min.price ?? 0) / 100;
  const priceMax = (priceBounds._max.price ?? 0) / 100;

  const where = {
    active: true,
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q } },
        { nameEn: { contains: filters.q } },
        { description: { contains: filters.q } },
        { descriptionEn: { contains: filters.q } },
      ],
    }),
    ...(filters.category && { category: { slug: filters.category } }),
    ...(filters.inStock && { stockQty: { gt: 0 } }),
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
  const allMatchingIds = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, stockQty: true },
  });
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.inStock) params.set("inStock", filters.inStock);
    params.set("page", String(page));
    return `/products?${params.toString()}`;
  };

  // Only for the plain, unfiltered catalog view — a search/filter result is
  // a thin, high-cardinality slice that isn't worth asserting as a
  // canonical ItemList.
  const isPlainBrowse = !filters.q && !filters.category && !filters.minPrice && !filters.maxPrice;
  const itemListJsonLd =
    isPlainBrowse && products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: (filters.page - 1) * PAGE_SIZE + index + 1,
            name: localizedName(product, uiLocale),
            url: `${settings.siteUrl || ""}/products/${product.slug}`,
          })),
        }
      : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-16 sm:flex-row">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(itemListJsonLd) }}
        />
      )}
      <ProductFilterPanel
        dict={dict.products}
        categories={categories}
        filters={filters}
        priceMin={priceMin}
        priceMax={priceMax}
        currency={settings.defaultCurrency}
        locale={settings.defaultLocale}
        clearHref={filters.q ? `/products?q=${encodeURIComponent(filters.q)}` : "/products"}
      />

      <section className="flex-1">
        <h1 className="mb-4 text-2xl font-semibold">
          {filters.q ? dict.products.resultsFor(filters.q) : dict.products.allProducts}
        </h1>

        {products.length === 0 ? (
          <p className="text-foreground/70 text-sm">{dict.products.noResults}</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={localizedCardProduct(product, uiLocale)}
                locale={settings.defaultLocale}
                outOfStockLabel={dict.product.outOfStock}
                quickAddLabel={dict.product.addToCart}
              />
            ))}
          </div>
        )}

        <Pagination totalPages={totalPages} currentPage={filters.page} buildHref={buildPageHref} />
      </section>
    </main>
  );
}
