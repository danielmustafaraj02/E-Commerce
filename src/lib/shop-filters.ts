/**
 * The filters of a product listing: /products (and /new-collection, which is
 * the same listing) and /category/[slug]. Pure helpers, shared by both pages,
 * for the listing's links and for the row of active filters above its grid.
 */
export type SortKey = "price-asc" | "price-desc";

export type ListingFilters = {
  q?: string;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: "1";
  sale?: "1";
  color?: string[];
  sort?: SortKey;
};

/** The listing at `basePath` with these filters; `page` only when given, so a
 *  changed filter or sort always lands back on page 1. */
export function listingHref(basePath: string, filters: ListingFilters, page?: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const category of filters.category ?? []) params.append("category", category);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStock) params.set("inStock", filters.inStock);
  if (filters.sale) params.set("sale", filters.sale);
  for (const color of filters.color ?? []) params.append("color", color);
  if (filters.sort) params.set("sort", filters.sort);
  if (page !== undefined) params.set("page", String(page));
  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

export type FilterChip = { key: string; label: string; href: string };

/**
 * One chip per active filter, each linking to the same listing without it.
 * The search and the sale view are not chips: they are the page's own heading,
 * and "clear filters" keeps them too. The sort is kept on every link.
 */
export function activeFilterChips(
  basePath: string,
  filters: ListingFilters,
  labels: {
    category: (slug: string) => string;
    color: (key: string) => string;
    /** The chosen price range, already formatted ("60,00 € – 100,00 €"). */
    price: string;
    inStock: string;
  }
): FilterChip[] {
  const chips: FilterChip[] = [];
  for (const slug of filters.category ?? []) {
    chips.push({
      key: `category:${slug}`,
      label: labels.category(slug),
      href: listingHref(basePath, { ...filters, category: filters.category?.filter((c) => c !== slug) }),
    });
  }
  for (const color of filters.color ?? []) {
    chips.push({
      key: `color:${color}`,
      label: labels.color(color),
      href: listingHref(basePath, { ...filters, color: filters.color?.filter((c) => c !== color) }),
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: labels.price,
      href: listingHref(basePath, { ...filters, minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (filters.inStock) {
    chips.push({
      key: "inStock",
      label: labels.inStock,
      href: listingHref(basePath, { ...filters, inStock: undefined }),
    });
  }
  return chips;
}

/** The listing with every filter removed but the search, the sale view and the sort. */
export function clearFiltersHref(basePath: string, filters: ListingFilters): string {
  return listingHref(basePath, { q: filters.q, sale: filters.sale, sort: filters.sort });
}
