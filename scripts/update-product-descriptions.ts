/**
 * Updates the name/description/story fields of every existing Murano product
 * in the database to match the current scripts/murano-manifest.json — this
 * includes the "why this piece" gift/story copy shown on the product page.
 *
 * Safe to re-run: only touches products whose slug matches a manifest entry.
 * Does NOT create new products — use seed-murano-catalog.ts for that.
 *
 * Usage:
 *   npx tsx scripts/update-product-descriptions.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import manifest from "./murano-manifest.json";
import { productTranslations, type ManifestEntry } from "./i18n-fields";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const entries = Object.values(manifest as Record<string, ManifestEntry>);

  // Build a map from name-slug-prefix -> manifest entry (same logic as seed script)
  const byNameSlug = new Map<string, ManifestEntry>();
  for (const entry of entries) {
    byNameSlug.set(slugify(entry.name), entry);
  }

  // Fetch all products from the DB
  const products = await db.product.findMany({
    select: { id: true, slug: true, name: true },
  });

  let updated = 0;
  const skipped = 0;
  let unmatched = 0;

  for (const product of products) {
    // The product slug is "<name-slug>-<hash6>", strip the trailing hash
    const nameSlugPrefix = product.slug.replace(/-[0-9a-f]{6}$/i, "");
    const entry = byNameSlug.get(nameSlugPrefix);

    if (!entry) {
      console.warn(`No manifest match for product "${product.name}" (slug: ${product.slug})`);
      unmatched++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] would update "${product.name}" -> "${entry.name}"`);
      console.log(`  IT: ${entry.description.slice(0, 80)}…`);
      console.log(`  EN: ${entry.descriptionEn?.slice(0, 80)}…`);
      console.log(`  Story IT: ${entry.story?.slice(0, 80) ?? "(none)"}…`);
      console.log(`  Story EN: ${entry.storyEn?.slice(0, 80) ?? "(none)"}…`);
      updated++;
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: {
        name: entry.name,
        description: entry.description,
        story: entry.story ?? "",
        storyEn: entry.storyEn,
        ...productTranslations(entry),
      },
    });

    console.log(`Updated "${product.name}"`);
    updated++;
  }

  console.log(
    `\nDone. ${updated} product(s) ${dryRun ? "would be " : ""}updated, ${skipped} skipped, ${unmatched} unmatched.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
