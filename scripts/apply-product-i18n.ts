/**
 * Backfills nameEn/descriptionEn onto Product rows (and nameEn onto
 * Category rows) that were seeded before those columns existed, using
 * scripts/murano-manifest.json as the source of truth. Safe to re-run —
 * every write is keyed by the current (Italian) name, which never changes.
 *
 * Run this instead of scripts/seed-murano-catalog.ts when the catalog is
 * already populated and only needs the English fields filled in.
 *
 * Usage: npx tsx scripts/apply-product-i18n.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import manifest from "./murano-manifest.json";

type ManifestEntry = {
  category: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

const CATEGORY_NAMES_EN: Record<string, string> = {
  Bracciali: "Bracelets",
  Collane: "Necklaces",
  Orecchini: "Earrings",
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const entries = Object.values(manifest as Record<string, ManifestEntry>);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));

  let updatedProducts = 0;
  let unmatchedProducts = 0;

  const products = await db.product.findMany({ select: { id: true, name: true } });
  for (const product of products) {
    const entry = byName.get(product.name);
    if (!entry) {
      console.warn(`No manifest match for product "${product.name}" (id ${product.id})`);
      unmatchedProducts++;
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] would set nameEn/descriptionEn for "${product.name}"`);
    } else {
      await db.product.update({
        where: { id: product.id },
        data: { nameEn: entry.nameEn, descriptionEn: entry.descriptionEn },
      });
    }
    updatedProducts++;
  }

  let updatedCategories = 0;
  for (const [nameIt, nameEn] of Object.entries(CATEGORY_NAMES_EN)) {
    if (dryRun) {
      console.log(`[dry-run] would set nameEn="${nameEn}" for category "${nameIt}"`);
      updatedCategories++;
      continue;
    }
    const result = await db.category.updateMany({ where: { name: nameIt }, data: { nameEn } });
    updatedCategories += result.count;
  }

  console.log(
    `\nDone. ${updatedProducts} product(s) ${dryRun ? "would be " : ""}updated ` +
      `(${unmatchedProducts} unmatched), ${updatedCategories} categor${dryRun ? "y/ies" : "y/ies"} updated.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
