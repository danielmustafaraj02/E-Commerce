/**
 * Backfills every translated name/description column (En, Fr, De, Ar, Zh, Ru,
 * Es, Pt, Hi, Ja) onto Product rows — and the translated names onto Category
 * rows — that were seeded before those columns existed, using
 * scripts/murano-manifest.json as the source of truth. Safe to re-run — every
 * write is keyed by the current (Italian) name, which never changes.
 *
 * Run this instead of scripts/seed-murano-catalog.ts when the catalog is
 * already populated and only needs the translation fields filled in.
 *
 * Usage: npx tsx scripts/apply-product-i18n.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import manifest from "./murano-manifest.json";
import {
  CATEGORY_NAMES,
  LOCALE_SUFFIXES,
  categoryTranslations,
  findManifestEntry,
  productTranslations,
  type ManifestEntry,
} from "./i18n-fields";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const entries = Object.values(manifest as Record<string, ManifestEntry>);
  const locales = LOCALE_SUFFIXES.join("/");

  let updatedProducts = 0;
  let unmatchedProducts = 0;

  const products = await db.product.findMany({ select: { id: true, name: true, slug: true } });
  for (const product of products) {
    const entry = findManifestEntry(product, entries);
    if (!entry) {
      console.warn(`No manifest match for product "${product.name}" (id ${product.id})`);
      unmatchedProducts++;
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] would set name/description in ${locales} for "${product.name}"`);
    } else {
      await db.product.update({
        where: { id: product.id },
        data: productTranslations(entry),
      });
    }
    updatedProducts++;
  }

  let updatedCategories = 0;
  for (const nameIt of Object.keys(CATEGORY_NAMES)) {
    if (dryRun) {
      console.log(`[dry-run] would set name in ${locales} for category "${nameIt}"`);
      updatedCategories++;
      continue;
    }
    const result = await db.category.updateMany({
      where: { name: nameIt },
      data: categoryTranslations(nameIt),
    });
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
