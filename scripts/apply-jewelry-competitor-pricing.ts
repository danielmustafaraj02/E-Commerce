/**
 * Price-matches every jewelry product (Bracciali/Collane/Orecchini) against
 * https://venetianmuranoglass.com/collections/jewelry.
 *
 * Our catalog's piece names don't correspond 1:1 with that store's product
 * line (different designs, different sellers), so this matches at the
 * category level using that store's modal price per type:
 *   - Bracelets:           EUR 70.00 (their standard line; only their
 *                          budget "Candy" line is EUR 60, we have no
 *                          equivalent budget line)
 *   - Earrings:            EUR 70.00 (every earring SKU there is EUR 70)
 *   - Necklaces:           EUR 90.00, or EUR 110.00 for pieces whose
 *                          description marks them as a long/opera-length
 *                          necklace (matches their "Long Necklace" EUR 110
 *                          tier vs regular EUR 90 tier)
 *
 * Safe to re-run: only touches products whose slug matches a manifest entry.
 *
 * Usage:
 *   npx tsx scripts/apply-jewelry-competitor-pricing.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import manifest from "./murano-manifest.json";
import type { ManifestEntry } from "./i18n-fields";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const BRACELET_PRICE = 7000;
const EARRING_PRICE = 7000;
const NECKLACE_PRICE = 9000;
const LONG_NECKLACE_PRICE = 11000;

function targetPriceCents(entry: ManifestEntry): number | null {
  switch (entry.category) {
    case "Bracciali":
      return BRACELET_PRICE;
    case "Orecchini":
      return EARRING_PRICE;
    case "Collane": {
      const isLong = /\blung[ao]\b/i.test(entry.description ?? "");
      return isLong ? LONG_NECKLACE_PRICE : NECKLACE_PRICE;
    }
    default:
      return null;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const entries = Object.values(manifest as Record<string, ManifestEntry>);
  const byNameSlug = new Map<string, ManifestEntry>();
  for (const entry of entries) {
    byNameSlug.set(slugify(entry.name), entry);
  }

  const products = await db.product.findMany({
    select: { id: true, slug: true, name: true, price: true },
  });

  let updated = 0;
  let unmatched = 0;
  let skippedNonJewelry = 0;

  for (const product of products) {
    const nameSlugPrefix = product.slug.replace(/-[0-9a-f]{6}$/i, "");
    const entry = byNameSlug.get(nameSlugPrefix);

    if (!entry) {
      unmatched++;
      continue;
    }

    const price = targetPriceCents(entry);
    if (price === null) {
      skippedNonJewelry++;
      continue;
    }

    const from = `€${(product.price / 100).toFixed(2)}`;
    const to = `€${(price / 100).toFixed(2)}`;

    if (dryRun) {
      console.log(`[dry-run] "${product.name}" (${entry.category}): ${from} -> ${to}`);
      updated++;
      continue;
    }

    if (product.price !== price) {
      await db.product.update({ where: { id: product.id }, data: { price } });
      console.log(`Updated "${product.name}": ${from} -> ${to}`);
    }
    updated++;
  }

  console.log(
    `\nDone. ${updated} jewelry product(s) ${dryRun ? "would be " : ""}priced, ` +
      `${skippedNonJewelry} non-jewelry manifest matches skipped, ${unmatched} product(s) had no manifest match.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
