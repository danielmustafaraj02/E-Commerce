import type { ComponentProps } from "react";
import { Link } from "@/components/localized-link";
import { ShelfItem } from "@/components/shelf-item";
import { db } from "@/lib/db";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import type { ShopCopy } from "@/lib/i18n/shop-copy";
import { localizedCardProduct } from "@/lib/product-i18n";
import type { FilterChip, SortKey } from "@/lib/shop-filters";

/* The parts every product listing shares — /products, /new-collection and
   /category/[slug] — so they read as one shop: the count and sort above the
   grid, the active filters under them, and the grid of pieces itself. */

type Rating = { average: number; count: number };

/** Each piece's average rating, for pieces with at least one review. */
export async function listingRatings(ids: string[]): Promise<Map<string, Rating>> {
  if (!ids.length) return new Map();
  const rows = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: ids } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    rows.flatMap((row) =>
      row._avg.rating === null
        ? []
        : [[row.productId, { average: row._avg.rating, count: row._count._all }] as const]
    )
  );
}

/** The number of pieces, and the sort as a segmented control. */
export function ShopToolbar({
  total,
  copy,
  sort,
  sortHref,
}: {
  total: number;
  copy: ShopCopy;
  sort?: SortKey;
  sortHref: (sort?: SortKey) => string;
}) {
  const options: { key: SortKey | undefined; label: string; short: string }[] = [
    { key: undefined, label: copy.sortNewest, short: copy.sortNewestShort },
    { key: "price-asc", label: copy.sortPriceAsc, short: copy.sortPriceAscShort },
    { key: "price-desc", label: copy.sortPriceDesc, short: copy.sortPriceDescShort },
  ];
  return (
    <div className="shop-toolbar">
      <p className="shop-count" aria-live="polite">
        {copy.pieceCount(total)}
      </p>
      {total > 1 && (
        <nav className="shop-sort" aria-label={copy.sortLabel}>
          <span className="shop-sort-label" aria-hidden="true">
            {copy.sortLabel}
          </span>
          <ul>
            {options.map((option) => (
              <li key={option.key ?? "newest"}>
                <Link
                  href={sortHref(option.key)}
                  // Same pieces, reordered: nothing for a crawler to follow.
                  rel="nofollow"
                  scroll={false}
                  aria-current={sort === option.key ? "true" : undefined}
                  className="shop-sort-link"
                >
                  <span className="shop-sort-full">{option.label}</span>
                  <span className="shop-sort-short" aria-hidden="true">
                    {option.short}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/**
 * The filters in force, as chips above the grid: each one removes itself, and
 * "clear filters" removes them all. Shown on every screen size, so the
 * selection stays visible on a phone, where the filter panel is folded away.
 */
export function ActiveFilters({
  chips,
  clearHref,
  copy,
  clearLabel,
}: {
  chips: FilterChip[];
  clearHref: string;
  copy: ShopCopy;
  clearLabel: string;
}) {
  if (!chips.length) return null;
  return (
    <div className="shop-active" role="group" aria-label={copy.activeFilters}>
      <ul className="shop-active-list">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.href}
              rel="nofollow"
              scroll={false}
              className="shop-active-chip"
              aria-label={applyTemplate(copy.removeFilter, { x: chip.label })}
            >
              {chip.label}
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <Link href={clearHref} rel="nofollow" scroll={false} className="shop-active-clear">
          {clearLabel}
        </Link>
      )}
    </div>
  );
}

type ListingProduct = Parameters<typeof localizedCardProduct>[0] &
  ComponentProps<typeof ShelfItem>["product"] & {
    trackInventory: boolean;
    lowStockThreshold: number;
  };

/** The pieces, with their rating and a "only {n} left" line when it is true. */
export function ShopGrid({
  products,
  ratings,
  locale,
  catalogLocale,
  dict,
}: {
  products: ListingProduct[];
  ratings: Map<string, Rating>;
  locale: Locale;
  /** The store's default language, which formats the prices. */
  catalogLocale: string;
  dict: Dictionary;
}) {
  return (
    <ul className="shop-grid">
      {products.map((product) => {
        const rating = ratings.get(product.id);
        // Untracked pieces have no real stock count, so never claim one.
        const lowStock =
          product.trackInventory && product.stockQty > 0 && product.stockQty <= product.lowStockThreshold;
        return (
          <ShelfItem
            key={product.slug}
            product={localizedCardProduct(product, locale)}
            locale={catalogLocale}
            outOfStockLabel={dict.product.outOfStock}
            quickAddLabel={dict.product.addToCart}
            addedLabel={dict.product.added}
            sizes="(min-width: 40rem) 20vw, 50vw"
            rating={
              rating && {
                ...rating,
                label: `${rating.average.toFixed(1)}/5 · ${applyTemplate(dict.product.reviewCount, { n: rating.count })}`,
              }
            }
            scarcityLabel={
              lowStock ? applyTemplate(dict.product.onlyLeft, { n: product.stockQty }) : undefined
            }
          />
        );
      })}
    </ul>
  );
}
