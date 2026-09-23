/**
 * Appends the shared gift-box/bag photo at
 * public/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.png
 * as the last gallery image of every product. Products that already have it
 * anywhere in their gallery are left alone, so this is safe to re-run.
 * (The reverse of scripts/remove-packaging-gallery-image.ts.)
 *
 * Usage:
 *   npx tsx scripts/add-packaging-gallery-image.ts [--dry-run]
 */
import { db } from "../src/lib/db";

const PACKAGING_IMAGE_URL =
  "/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.png";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      images: { select: { url: true, position: true } },
    },
    orderBy: { name: "asc" },
  });

  let added = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.images.some((image) => image.url === PACKAGING_IMAGE_URL)) {
      console.log(`Already has it: "${product.name}"`);
      skipped++;
      continue;
    }

    const lastPosition = Math.max(-1, ...product.images.map((image) => image.position));
    console.log(
      `${dryRun ? "[dry-run] would add to" : "Adding to"} "${product.name}" at position ${lastPosition + 1}`
    );

    if (!dryRun) {
      await db.productImage.create({
        data: {
          productId: product.id,
          url: PACKAGING_IMAGE_URL,
          altText: `${product.name} — confezione regalo`,
          position: lastPosition + 1,
        },
      });
    }
    added++;
  }

  console.log(
    `\nDone. ${added} product(s) ${dryRun ? "would get" : "got"} the image; ${skipped} already had it.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
