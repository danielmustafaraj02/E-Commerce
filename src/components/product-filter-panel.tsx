import Link from "next/link";
import { PriceRangeSlider } from "@/components/price-range-slider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Category = { id: string; slug: string; name: string };

// Shared by /products (all categories, with a category picker) and
// /category/[slug] (already scoped to one category, so the picker is
// hidden) — same price-range + in-stock filtering either way.
//
// Collapsed by default (a <details> disclosure, no JS needed) so it doesn't
// push the product grid below the fold on mobile; opens automatically when
// filters are already active so the user can see/adjust what's applied.
export function ProductFilterPanel({
  dict,
  categories,
  showCategory = true,
  filters,
  priceMin,
  priceMax,
  currency,
  locale,
  clearHref,
}: {
  dict: Dictionary["products"];
  categories?: Category[];
  showCategory?: boolean;
  filters: { q?: string; category?: string; minPrice?: number; maxPrice?: number; inStock?: "1" };
  priceMin: number;
  priceMax: number;
  currency: string;
  locale: string;
  clearHref: string;
}) {
  const hasActiveFilters = Boolean(
    (showCategory && filters.category) ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.inStock
  );

  return (
    <aside className="w-full shrink-0 sm:w-64">
      <details open={hasActiveFilters} className="form-card group text-sm">
        <summary className="flex list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            {dict.filtersTitle}
            {hasActiveFilters && (
              <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" aria-hidden="true" />
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/50 shrink-0 transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>

        <form method="GET" className="mt-5 flex flex-col gap-5">
          {filters.q && <input type="hidden" name="q" value={filters.q} />}

          {showCategory && categories && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="font-medium">
                {dict.category}
              </label>
              <select
                id="category"
                name="category"
                defaultValue={filters.category ?? ""}
                className="field"
              >
                <option value="">{dict.all}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-foreground/10 flex flex-col gap-3 border-t pt-5">
            <span className="font-medium">{dict.priceRange}</span>
            <PriceRangeSlider
              min={priceMin}
              max={priceMax}
              defaultMin={filters.minPrice}
              defaultMax={filters.maxPrice}
              currency={currency}
              locale={locale}
              separatorLabel={dict.priceRangeSeparator}
            />
          </div>

          <label className="border-foreground/10 flex cursor-pointer items-center gap-2 border-t pt-5">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={filters.inStock === "1"}
              className="field-checkbox"
            />
            {dict.inStockOnly}
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary flex-1">
              {dict.applyFilters}
            </button>
            {hasActiveFilters && (
              <Link
                href={clearHref}
                className="text-foreground/60 hover:text-primary shrink-0 text-xs transition-colors"
              >
                {dict.clearFilters}
              </Link>
            )}
          </div>
        </form>
      </details>
    </aside>
  );
}
