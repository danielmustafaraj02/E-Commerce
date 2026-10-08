/** Run with node --import tsx scripts/import-new-collection.ts.
 * Default: verify the prepared catalog without connecting to the database.
 * --apply creates inactive drafts. --apply --publish requires approved prices
 * and stock (via --pricing reports/new-collection/pricing.csv).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import manifest from "./new-collection-manifest.json";
import { validateCollection, applyPricingCsv } from "./new-collection";
import { categoryTranslations } from "./i18n-fields";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const publish = args.includes("--publish");
const pricingIndex = args.indexOf("--pricing");
const allowed = new Set(["--apply", "--publish", "--pricing"]);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i])) throw new Error(`Unknown argument: ${args[i]}`);
  if (args[i] === "--pricing") {
    if (!args[i + 1] || args[i + 1].startsWith("--"))
      throw new Error("Supply a pricing worksheet after --pricing.");
    i++;
  }
}
let collection = validateCollection(manifest);
if (pricingIndex >= 0)
  collection = applyPricingCsv(collection, readFileSync(args[pricingIndex + 1], "utf8"));
collection = validateCollection(collection, publish);

const supplied = readdirSync(resolve("new")).filter((name) => name.endsWith(".jpeg"));
const sources = collection.products.flatMap((p) => p.images.map((image) => image.source));
if (
  sources.length !== supplied.length ||
  supplied.some((name) => !sources.includes(`new/${name}`))
) {
  throw new Error("Every supplied photograph must appear exactly once in the collection.");
}
for (const product of collection.products) {
  for (const image of product.images) {
    const target = resolve(`public${image.url}`);
    if (!existsSync(target)) throw new Error(`Missing prepared asset: ${image.url}`);
    const hash = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
    if (hash(image.source) !== hash(target))
      throw new Error(`Prepared asset differs from its source: ${image.url}`);
  }
}
console.log(
  `${collection.name}: ${collection.products.length} products, ${sources.length} photographs, ${collection.looks.length} complete looks.`
);
console.log(
  `Mode: ${apply ? "apply" : "dry run"}; products: ${publish ? "published" : "inactive drafts"}.`
);
if (!apply) {
  console.log("All assets and catalog relationships verified. No database changes made.");
} else {
  // Match next dev's .env.local precedence; never print connection credentials.
  loadEnvConfig(process.cwd(), true);
  void import("../src/lib/db")
    .then(async ({ db }) => {
      try {
        console.log("Connecting to the configured database…");
        await db.$queryRaw`SELECT 1`;
        console.log("Connected. Importing products and matching sets…");
        const summary = await db.$transaction(
          async (tx) => {
            const categories = new Map<string, string>();
            const names = { necklace: "Collane", bracelet: "Bracciali", earrings: "Orecchini" };
            for (const kind of Object.keys(names) as (keyof typeof names)[]) {
              const slug = collection.products.find((p) => p.kind === kind)!.categorySlug;
              const found = await tx.category.findFirst({
                where: { OR: [{ slug }, { name: names[kind] }] },
              });
              const category =
                found ??
                (await tx.category.create({
                  data: { name: names[kind], slug, ...categoryTranslations(names[kind]) },
                }));
              categories.set(kind, category.id);
            }
            let created = 0;
            let activated = 0;
            let skipped = 0;
            const ids = new Map<string, string>();
            for (const product of collection.products) {
              const existing = await tx.product.findFirst({
                where: { OR: [{ slug: product.slug }, { sku: product.sku }] },
              });
              if (existing && (existing.slug !== product.slug || existing.sku !== product.sku)) {
                throw new Error(
                  `SKU or slug collision for ${product.sku}; existing product left untouched.`
                );
              }
              if (existing) {
                if (publish && !existing.active) {
                  await tx.product.update({
                    where: { id: existing.id },
                    data: {
                      price: product.price!,
                      stockQty: product.stockQty!,
                      active: true,
                      unlisted: false,
                    },
                  });
                  activated++;
                } else {
                  skipped++;
                }
                ids.set(product.slug, existing.id);
                if (ids.size % 5 === 0 || ids.size === collection.products.length) {
                  console.log(
                    `Prepared ${ids.size}/${collection.products.length} products (not committed yet).`
                  );
                }
                continue;
              }
              const {
                images,
                kind,
                categorySlug: _categorySlug,
                lookKey: _lookKey,
                price,
                stockQty,
                ...data
              } = product;
              const row = await tx.product.create({
                data: {
                  ...data,
                  price: price ?? 0,
                  stockQty: stockQty ?? 0,
                  active: publish,
                  unlisted: !publish,
                  trackInventory: true,
                  categoryId: categories.get(kind),
                  images: { create: images.map(({ source: _source, ...image }) => image) },
                },
              });
              ids.set(product.slug, row.id);
              created++;
              if (ids.size % 5 === 0 || ids.size === collection.products.length) {
                console.log(
                  `Prepared ${ids.size}/${collection.products.length} products (not committed yet).`
                );
              }
            }
            console.log(`Preparing ${collection.looks.length} matching sets…`);
            for (const look of collection.looks) {
              const members = look.productSlugs.map((slug) => ids.get(slug)!);
              const products = await tx.product.findMany({
                where: { id: { in: members } },
                select: { lookId: true },
              });
              if (products.some((product) => product.lookId && product.lookId !== look.id)) {
                throw new Error(`A product in ${look.id} already belongs to another look.`);
              }
              const existing = await tx.look.findUnique({ where: { id: look.id } });
              if (existing) {
                if (publish && !existing.active)
                  await tx.look.update({ where: { id: look.id }, data: { active: true } });
              } else {
                await tx.look.create({
                  data: {
                    id: look.id,
                    name: look.name,
                    active: publish,
                    discountPercent: look.discountPercent,
                    products: { connect: members.map((id) => ({ id })) },
                  },
                });
              }
            }
            const result = {
              created,
              activated,
              skipped,
              looks: collection.looks.length,
              published: publish,
            };
            await tx.auditLog.create({
              data: {
                action: "catalog.import.new_collection",
                entityType: "Product",
                entityId: collection.id,
                afterData: JSON.stringify(result),
              },
            });
            return result;
          },
          { maxWait: 15_000, timeout: 120_000 }
        );
        console.log(JSON.stringify(summary));
        console.log(
          "Import committed. Find the products in Admin → Products by searching PMG-OCT26."
        );
      } catch (error) {
        console.error("Collection not imported; the transaction was rolled back.");
        console.error(
          error instanceof Error
            ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, "[database URL]")
            : "Database error"
        );
        process.exitCode = 1;
      } finally {
        await db.$disconnect();
      }
    })
    .catch(() => {
      console.error("Could not initialize the configured database.");
      process.exitCode = 1;
    });
}
