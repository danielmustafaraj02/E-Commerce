/** Copy existing catalog prices and activate the imported collection.
 * node --import tsx scripts/publish-new-collection.ts [--apply]
 * Without --apply, show proposed prices without changing the database.
 */
import { loadEnvConfig } from "@next/env";
import manifest from "./new-collection-manifest.json";
import { pricesLikeExisting, validateCollection } from "./new-collection";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--apply")) throw new Error("Only --apply is supported.");
const apply = args.includes("--apply");
const collection = validateCollection(manifest);
loadEnvConfig(process.cwd(), true);

async function main() {
  const { db } = await import("../src/lib/db");
  try {
    console.log("Connecting to the configured database…");
    await db.$queryRaw`SELECT 1`;
    const summary = await db.$transaction(
      async (tx) => {
        const existing = await tx.product.findMany({
          where: {
            active: true,
            unlisted: false,
            currency: collection.currency,
            price: { gt: 0 },
            NOT: { sku: { startsWith: "PMG-OCT26-" } },
          },
          select: { price: true, category: { select: { name: true, nameEn: true, slug: true } } },
        });
        const prices = pricesLikeExisting(existing);
        const rows = await tx.product.findMany({
          where: { sku: { in: collection.products.map((p) => p.sku) } },
          select: { id: true, sku: true, slug: true, currency: true, stockQty: true, lookId: true },
        });
        for (const product of collection.products) {
          const row = rows.find((r) => r.sku === product.sku);
          if (!row || row.slug !== product.slug || row.currency !== product.currency) {
            throw new Error(
              `Missing or mismatched imported product ${product.sku}; no changes made.`
            );
          }
        }
        console.log(
          `Copying existing prices: necklaces €${(prices.necklace / 100).toFixed(2)}, bracelets €${(prices.bracelet / 100).toFixed(2)}, earrings €${(prices.earrings / 100).toFixed(2)}.`
        );
        const zeroStock = rows.filter((r) => r.stockQty === 0).length;
        console.log(
          `${rows.length} products will be visible; ${zeroStock} have zero stock and will remain out of stock. Stock quantities are preserved.`
        );
        if (!apply) return { prices, products: rows.length, outOfStock: zeroStock, applied: false };
        let updated = 0;
        for (const product of collection.products) {
          await tx.product.update({
            where: { sku: product.sku },
            data: { price: prices[product.kind], active: true, unlisted: false },
          });
          updated++;
          if (updated % 10 === 0 || updated === collection.products.length)
            console.log(
              `Prepared ${updated}/${collection.products.length} products (not committed yet).`
            );
        }
        for (const look of collection.looks) {
          const expected = collection.products
            .filter((p) => look.productSlugs.includes(p.slug))
            .map((p) => p.sku);
          if (rows.filter((r) => r.lookId === look.id && expected.includes(r.sku)).length !== 3) {
            throw new Error(`Matching set ${look.id} is incomplete; all changes rolled back.`);
          }
          await tx.look.update({ where: { id: look.id }, data: { active: true } });
        }
        const result = {
          prices,
          products: updated,
          looks: collection.looks.length,
          outOfStock: zeroStock,
          applied: true,
        };
        await tx.auditLog.create({
          data: {
            action: "catalog.publish.new_collection",
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
      apply
        ? "Committed. The new collection is now visible in the storefront."
        : "Dry run complete. No changes made."
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("New collection not published.");
  console.error(
    error instanceof Error
      ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, "[database URL]")
      : "Database error"
  );
  process.exitCode = 1;
});
