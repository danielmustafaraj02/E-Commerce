import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName } from "@/lib/product-i18n";
import { toSafeJsonLd } from "@/lib/json-ld";
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
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, locale, category] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getCategory(slug),
  ]);
  if (!category) return {};

  const name = localizedName(category, locale);
  const description =
    locale === "en"
      ? `Shop ${name} at ${settings.storeName}, filterable by price and availability.`
      : `Scopri i ${name.toLowerCase()} di ${settings.storeName}, filtrabili per prezzo e disponibilità.`;
  const image = ogImage(settings);
  return {
    title: name,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: name,
      description,
      type: "website",
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

  const [products, total, priceBounds] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { take: 1, orderBy: { position: "asc" } } },
    }),
    db.product.count({ where }),
    db.product.aggregate({
      where: { active: true, categoryId: category.id },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);
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

  const base = settings.siteUrl || "";
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
                product={{ ...product, name: localizedName(product, uiLocale) }}
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
