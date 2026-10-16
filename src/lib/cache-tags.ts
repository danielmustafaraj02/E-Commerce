import { revalidatePath, revalidateTag } from "next/cache";

// Data every storefront page reads (the header's categories, the shipping
// banner) is cached across requests for a few minutes instead of being queried
// on every page view. Admin edits clear the matching tag so the change shows
// on the next visit rather than after the cache expires.
export const CATALOG_TAG = "catalog";
export const SHIPPING_TAG = "shipping";
export const HOMEPAGE_TAG = "homepage";

// How long the shared storefront data is kept between admin edits.
export const STOREFRONT_DATA_TTL = 300;

/** After a product or category edit: the header menu, the home page's
 *  shelves and every cached page (prices and pieces appear across the whole
 *  storefront) are rebuilt on their next visit. */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidateTag(HOMEPAGE_TAG, { expire: 0 });
  revalidatePath("/[locale]", "layout");
}

/** After a shipping zone or method edit: the banner and FAQ figures, which
 *  every cached page shows. */
export function refreshShipping() {
  revalidateTag(SHIPPING_TAG, { expire: 0 });
  revalidatePath("/[locale]", "layout");
}
