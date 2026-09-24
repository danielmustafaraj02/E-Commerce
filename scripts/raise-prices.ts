/**
 * Raises every product's price by a flat amount (in whole euros).
 *
 * Usage:
 *   npx tsx scripts/raise-prices.ts <euros> [--dry-run]
 *   npx tsx scripts/raise-prices.ts 10 --dry-run
 *   npx tsx scripts/raise-prices.ts 10
 */
import { db } from "../src/lib/db";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const euroArg = process.argv[2];
  const euros = Number(euroArg);

  if (!euroArg || !Number.isFinite(euros) || euros <= 0) {
    console.error("Usage: npx tsx scripts/raise-prices.ts <euros> [--dry-run]");
    process.exit(1);
  }
  const increaseCents = Math.round(euros * 100);

  const products = await db.product.findMany({ select: { id: true, name: true, price: true } });

  for (const p of products) {
    const from = `€${(p.price / 100).toFixed(2)}`;
    const to = `€${((p.price + increaseCents) / 100).toFixed(2)}`;
    console.log(`${dryRun ? "[dry-run] would set" : "Setting"} "${p.name}": ${from} -> ${to}`);
  }

  if (dryRun) {
    console.log(`\nDone. ${products.length} product(s) would increase by €${euros.toFixed(2)}.`);
    return;
  }

  // A price change ends any discount: its compare-at price was checked against
  // the old price history (lib/price-history.ts), not this one.
  await db.product.updateMany({
    data: { price: { increment: increaseCents }, compareAtPrice: null },
  });

  console.log(`\nDone. ${products.length} product(s) increased by €${euros.toFixed(2)}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
