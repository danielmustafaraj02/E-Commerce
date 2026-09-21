/**
 * Marks every product as dropshipped and always available:
 *   - trackInventory = false  (checkout skips the stock check/decrement —
 *     see src/lib/pricing.ts and src/app/api/checkout/route.ts)
 *   - stockQty = 999          (the storefront's "in stock" badges/filters
 *     key off stockQty directly, not trackInventory — see
 *     src/app/products/[slug]/page.tsx, category/product listing filters,
 *     shelf-item.tsx, wishlist page, and the Google Merchant feed)
 *   - active = true           (visible in the storefront)
 *
 * This does NOT set supplierId/supplierSku/costPrice — those are per-supplier
 * bookkeeping fields (margin reporting) with no default that would be correct
 * for every product; set them per-product in Admin > Products if you want
 * margin tracking.
 *
 * Safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/enable-dropshipping-availability.ts [--dry-run]
 */
import { db } from "../src/lib/db";

const STOCK_QTY = 999;

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const products = await db.product.findMany({
    select: { id: true, name: true, trackInventory: true, stockQty: true, active: true },
  });

  const needsChange = products.filter(
    (p) => p.trackInventory || p.stockQty !== STOCK_QTY || !p.active
  );

  if (dryRun) {
    for (const p of needsChange) {
      console.log(
        `[dry-run] "${p.name}": trackInventory ${p.trackInventory}->false, ` +
          `stockQty ${p.stockQty}->${STOCK_QTY}, active ${p.active}->true`
      );
    }
    console.log(
      `\nDone. ${needsChange.length} of ${products.length} product(s) would change.`
    );
    return;
  }

  const result = await db.product.updateMany({
    data: { trackInventory: false, stockQty: STOCK_QTY, active: true },
  });

  console.log(`Done. ${result.count} of ${products.length} product(s) updated.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
