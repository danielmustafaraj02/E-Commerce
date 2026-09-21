/**
 * Makes shipping free everywhere in the storefront:
 *   - Zeroes out every ShippingMethod.basePrice (what checkout actually
 *     charges — see src/lib/pricing.ts). Matches the checkout UI, which no
 *     longer shows a shipping-method picker or a "Shipping: X" line, just a
 *     "free shipping" badge (src/app/checkout/checkout-client.tsx).
 *   - Sets StoreSettings.freeShippingThreshold to 0, so the cart page's
 *     existing "spend €X more for free shipping" progress bar always shows
 *     the already-unlocked state instead (src/app/cart/cart-client.tsx) —
 *     without this, a threshold like €50 would keep telling customers they
 *     need to spend more, even though shipping is already free.
 *
 * Deliberately does NOT touch ShippingZone/ShippingZoneCountry: those still
 * drive which countries the checkout country dropdown offers and what
 * src/lib/offer-json-ld.ts reports for shipping/returns — removing them
 * would break both.
 *
 * Only pricePerKg is left alone: it's stored on the model and shown in
 * Admin > Shipping, but src/lib/pricing.ts never reads it, so it has no
 * effect on what a customer is charged.
 *
 * Safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/waive-shipping.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const methods = await db.shippingMethod.findMany({
    select: { id: true, name: true, basePrice: true },
  });
  const methodsToUpdate = methods.filter((m) => m.basePrice !== 0);

  const settings = await getStoreSettings();
  const thresholdNeedsChange = settings.freeShippingThreshold !== 0;

  if (methodsToUpdate.length === 0 && !thresholdNeedsChange) {
    console.log("Shipping is already free everywhere — nothing to do.");
    return;
  }

  for (const m of methodsToUpdate) {
    console.log(
      `${dryRun ? "[dry-run] would set" : "Setting"} method "${m.name}": €${(m.basePrice / 100).toFixed(2)} -> €0.00`
    );
  }
  if (thresholdNeedsChange) {
    const current =
      settings.freeShippingThreshold === null
        ? "(disabled)"
        : `€${(settings.freeShippingThreshold / 100).toFixed(2)}`;
    console.log(
      `${dryRun ? "[dry-run] would set" : "Setting"} free-shipping threshold: ${current} -> €0.00 (always met)`
    );
  }

  if (dryRun) {
    console.log(
      `\nDone. ${methodsToUpdate.length} method(s) and ${thresholdNeedsChange ? 1 : 0} setting would change.`
    );
    return;
  }

  if (methodsToUpdate.length > 0) {
    await db.shippingMethod.updateMany({
      where: { id: { in: methodsToUpdate.map((m) => m.id) } },
      data: { basePrice: 0 },
    });
  }
  if (thresholdNeedsChange) {
    await db.storeSettings.upsert({
      where: { id: settings.id },
      update: { freeShippingThreshold: 0 },
      create: { id: settings.id, freeShippingThreshold: 0 },
    });
  }

  console.log(
    `\nDone. ${methodsToUpdate.length} method(s) and ${thresholdNeedsChange ? 1 : 0} setting updated.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
