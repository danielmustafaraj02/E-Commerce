import type { CSSProperties } from "react";
import Link from "next/link";
import { PriceRangeSlider } from "@/components/price-range-slider";
import { PRODUCT_COLOR_KEYS, PRODUCT_COLOR_SWATCH } from "@/lib/product-colors";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import "./product-filter-panel.css";


type Category = { id: string; slug: string; name: string };

// Shared by /products (all categories, with a category picker) and
// /category/[slug] (already scoped to one category, so the picker is
// hidden) — same price-range + in-stock filtering either way.
//
// Desktop: always expanded, no collapse — filters are visible and
// adjustable at a glance. Sticky (sm:self-start keeps it from stretching
// to the grid's height, which would otherwise make position:sticky a
// no-op) so it stays on screen while the product grid scrolls.
//
// Mobile: the full panel takes up too much vertical space above the grid
// to leave open by default, so it starts closed (open automatically if
// filters are already active) and expands on tap. No client JS — a
// sr-only checkbox + peer-checked: toggles it, forced back open at sm+
// with sm:flex. (Tried <details>/<summary> first: modern engines hide
// collapsed content through an internal ::details-content box rather
// than display:none on the child, which isn't overridable the way this
// checkbox approach is.)
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
  priceLabels,
}: {
  dict: Dictionary["products"];
  categories?: Category[];
  showCategory?: boolean;
  filters: {
    q?: string;
    category?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: "1";
    sale?: "1";
    color?: string[];
  };
  priceMin: number;
  priceMax: number;
  currency: string;
  locale: string;
  clearHref: string;
  // Accessible names for the two ends of the price slider.
  priceLabels: { min: string; max: string };
}) {
  const hasActiveFilters = Boolean(
    (showCategory && filters.category?.length) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.color?.length
  );

  return (
    <aside
      className="pf w-full shrink-0 sm:sticky sm:top-24 sm:w-72 sm:self-start"
    >
      <div className="pf-card">
        <input
          type="checkbox"
          id="mobile-filters-toggle"
          defaultChecked={hasActiveFilters}
          className="peer sr-only"
        />
        <label htmlFor="mobile-filters-toggle" className="pf-head">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pf-head-icon"
            aria-hidden="true"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span className="pf-title">{dict.filtersTitle}</span>
          {hasActiveFilters && <span className="pf-active-dot" aria-hidden="true" />}
          {/* Phones only: the panel collapses there, so the header toggles it. */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="pf-toggle pf-toggle--closed"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="pf-toggle pf-toggle--open"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </label>

        <form method="GET" className="pf-form">
          {filters.q && <input type="hidden" name="q" value={filters.q} />}
          {filters.sale && <input type="hidden" name="sale" value={filters.sale} />}

          {showCategory && categories && (
            <fieldset className="pf-section">
              <legend className="pf-label">{dict.category}</legend>
              <div className="pf-options">
                {categories.map((category) => (
                  <label key={category.id} className="pf-option">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.slug}
                      defaultChecked={filters.category?.includes(category.slug)}
                      className="pf-check"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="pf-section">
            <span className="pf-label">{dict.priceRange}</span>
            <PriceRangeSlider
              min={priceMin}
              max={priceMax}
              defaultMin={filters.minPrice}
              defaultMax={filters.maxPrice}
              currency={currency}
              locale={locale}
              separatorLabel={dict.priceRangeSeparator}
              minLabel={priceLabels.min}
              maxLabel={priceLabels.max}
            />
          </div>

          <fieldset className="pf-section">
            <legend className="pf-label">{dict.colorLabel}</legend>
            <div className="pf-beads">
              {PRODUCT_COLOR_KEYS.map((key) => (
                <label
                  key={key}
                  className="pf-bead"
                  title={dict.colors[key]}
                  style={{ "--bead": PRODUCT_COLOR_SWATCH[key] } as CSSProperties}
                >
                  <input
                    type="checkbox"
                    name="color"
                    value={key}
                    defaultChecked={filters.color?.includes(key)}
                  />
                  <span className="sr-only">{dict.colors[key]}</span>
                  <span className="pf-bead-glass" aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          <label className="pf-section pf-stock">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={filters.inStock === "1"}
              className="pf-check"
            />
            {dict.inStockOnly}
          </label>

          <div className="pf-actions">
            <button type="submit" className="pf-submit">
              {dict.applyFilters}
              <span aria-hidden="true">→</span>
            </button>
            {hasActiveFilters && (
              <Link href={clearHref} className="pf-clear">
                {dict.clearFilters}
              </Link>
            )}
          </div>

          <p className="pf-signature" aria-hidden="true" translate="no">
            Vetri di Murano
          </p>
        </form>
      </div>
    </aside>
  );
}
