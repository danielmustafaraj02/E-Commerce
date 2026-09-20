/**
 * Loads the Murano jewelry catalog into the database from images that are
 * already committed under public/products/ plus the metadata in
 * scripts/murano-manifest.json.
 *
 * This exists because the images were imported into public/ at some point
 * (via scripts/import-products.ts against a local source folder that never
 * got committed), but a fresh database has no Product rows for them. Rather
 * than re-running that importer against a source folder that no longer
 * exists here, this recovers the manifest metadata by reconstructing each
 * file's slug ("<slugified-name>-<hash6>") and matching it back to the
 * manifest entry whose name slugifies to the same prefix.
 *
 * Usage: npx tsx scripts/seed-murano-catalog.ts [--dry-run]
 */
import { readdirSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";
import manifest from "./murano-manifest.json";
import { categoryTranslations, productTranslations, type ManifestEntry } from "./i18n-fields";

const CATEGORY_FOLDERS: Record<string, string> = {
  Bracciali: "bracciali-in-vetro-di-murano",
  Collane: "collane-in-vetro-di-murano",
  Orecchini: "orecchini-in-vetro-di-murano",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const entries = Object.values(manifest as Record<string, ManifestEntry>);

  // slug-prefix (name portion, before the trailing "-hash6") -> manifest entry
  const byNameSlug = new Map<string, ManifestEntry>();
  for (const entry of entries) {
    byNameSlug.set(slugify(entry.name), entry);
  }

  const categoryIds = new Map<string, string>(); // "Bracciali" -> Category.id
  const skuCounters = new Map<string, number>();
  let created = 0;
  let skippedExisting = 0;
  let unmatched = 0;

  for (const [categoryName, folder] of Object.entries(CATEGORY_FOLDERS)) {
    const dir = path.join("public", "products", folder);
    const files = readdirSync(dir)
      .filter((f) => [".jpg", ".jpeg", ".png", ".webp"].includes(path.extname(f).toLowerCase()))
      .sort();

    for (const file of files) {
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const nameSlugPrefix = base.replace(/-[0-9a-f]{6}$/i, "");
      const entry = byNameSlug.get(nameSlugPrefix);

      if (!entry) {
        console.warn(`No manifest match for ${folder}/${file} (slug prefix "${nameSlugPrefix}")`);
        unmatched++;
        continue;
      }

      const publicUrl = `/products/${folder}/${file}`;
      const existingImage = await db.productImage.findFirst({ where: { url: publicUrl } });
      if (existingImage) {
        skippedExisting++;
        continue;
      }

      if (!categoryIds.has(categoryName)) {
        if (dryRun) {
          categoryIds.set(categoryName, "dry-run-id");
        } else {
          const category = await db.category.upsert({
            where: { slug: folder },
            update: categoryTranslations(categoryName),
            create: {
              name: categoryName,
              ...categoryTranslations(categoryName),
              slug: folder,
            },
          });
          categoryIds.set(categoryName, category.id);
        }
      }
      const categoryId = categoryIds.get(categoryName)!;

      const prefix = categoryName.slice(0, 4).toUpperCase();
      const n = (skuCounters.get(prefix) ?? 0) + 1;
      skuCounters.set(prefix, n);
      const sku = `${prefix}-${String(n).padStart(3, "0")}`;

      const price = randomInt(2900, 6800); // cents, matching the importer's documented Murano example range
      const stockQty = randomInt(1, 6);

      if (dryRun) {
        console.log(`[dry-run] would create "${entry.name}" (${sku}) -> ${publicUrl}`);
        created++;
        continue;
      }

      await db.product.create({
        data: {
          name: entry.name,
          slug: base,
          description: entry.description,
          ...productTranslations(entry),
          price,
          currency: "EUR",
          sku,
          stockQty,
          lowStockThreshold: 2,
          active: true,
          categoryId,
          images: { create: [{ url: publicUrl, altText: entry.name, position: 0 }] },
        },
      });
      console.log(`Created "${entry.name}" (${sku}) -> ${publicUrl}`);
      created++;
    }
  }

  console.log(
    `\nDone. ${created} product(s) ${dryRun ? "would be " : ""}created, ${skippedExisting} already-imported skipped, ${unmatched} unmatched.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
