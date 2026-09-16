import Link from "next/link";
import { PriceRangeSlider } from "@/components/price-range-slider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Category = { id: string; slug: string; name: string };

// Shared by /products (all categories, with a category picker) and
// /category/[slug] (already scoped to one category, so the picker is
// hidden) — same price-range + in-stock filtering either way.
//
// Always expanded — no collapse/toggle, so filters are visible and
// adjustable at a glance rather than tucked behind a click. Sticky on
// desktop (sm:self-start keeps it from stretching to the grid's height,
// which would otherwise make position:sticky a no-op) so it stays on
// screen while the product grid scrolls; on mobile it's static, stacked
// full-width above the grid.
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
    <aside className="w-full shrink-0 sm:w-64 sm:sticky sm:top-24 sm:self-start">
      <div className="rounded-2xl p-5 text-sm">
        <span className="flex items-center gap-2 text-base font-semibold">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f5c451"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="4 4 20 4 14 12.5 14 19 10 21 10 12.5 4 4" />
          </svg>
          {dict.filtersTitle}
          {hasActiveFilters && (
            <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          )}
        </span>

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
      </div>
    </aside>
  );
}
