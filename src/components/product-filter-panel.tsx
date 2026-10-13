import type { CSSProperties } from "react";
import { FilterForm } from "@/components/filter-form";
import { Link } from "@/components/localized-link";
import { PriceRangeSlider } from "@/components/price-range-slider";
import { PRODUCT_COLOR_KEYS, PRODUCT_COLOR_SWATCH } from "@/lib/product-colors";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import "./product-filter-panel.css";


type Category = { id: string; slug: string; name: string };

// Shared by /products (all categories, with a category picker) and
// /category/[slug] (already scoped to one category, so the picker is
// hidden) — same price-range + in-stock filtering either way. Every filter
// applies as soon as it changes (components/filter-form.tsx); there is no
// "apply" button unless JavaScript is off.
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
  prices,
  rangeLabels,
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
    // The listing's sort order, carried through the GET form so applying a
    // filter does not reset it. Not a filter: it never lights the active dot.
    sort?: string;
  };
  priceMin: number;
  priceMax: number;
  currency: string;
  locale: string;
  clearHref: string;
  // Accessible names for the two ends of the price slider.
  priceLabels: { min: string; max: string };
  /** Every price in the current selection (euros), for the price chart. */
  prices?: number[];
  /** "1 piece in this range" / "{n} pieces in this range". */
  rangeLabels?: { one: string; many: string };
}) {
  const activeCount =
    (showCategory ? (filters.category?.length ?? 0) : 0) +
    (filters.color?.length ?? 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStock ? 1 : 0);
  const hasActiveFilters = activeCount > 0;
  // The current selection, for the form to re-tick its boxes after a
  // navigation it did not make itself.
  const selected = new URLSearchParams([
    ...(filters.category ?? []).map((value) => ["category", value]),
    ...(filters.color ?? []).map((value) => ["color", value]),
    ...(filters.inStock ? [["inStock", filters.inStock]] : []),
  ]).toString();

  return (
    <aside
      className="pf w-full shrink-0 sm:w-72 sm:self-start"
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
          {hasActiveFilters && (
            <span className="pf-active-count" aria-hidden="true">
              {activeCount}
            </span>
          )}
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

        <FilterForm selected={selected} className="pf-form">
          {filters.q && <input type="hidden" name="q" value={filters.q} />}
          {filters.sale && <input type="hidden" name="sale" value={filters.sale} />}
          {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}

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
              prices={prices}
              rangeLabels={rangeLabels}
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

          {/* Without JavaScript nothing applies on its own: the button is back. */}
          <noscript>
            <button type="submit" className="pf-submit">
              {dict.applyFilters}
              <span aria-hidden="true">→</span>
            </button>
          </noscript>
          {hasActiveFilters && (
            <div className="pf-actions">
              <Link href={clearHref} rel="nofollow" scroll={false} className="pf-clear">
                {dict.clearFilters}
              </Link>
            </div>
          )}

          <p className="pf-signature" aria-hidden="true" translate="no">
            Vetri di Murano
          </p>
        </FilterForm>
      </div>
    </aside>
  );
}
