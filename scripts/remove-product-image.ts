/**
 * Removes all images from a product, by name (Italian or English) or slug.
 * The product page handles zero images gracefully (no crash, no broken
 * layout — just no photo shown), so this is safe to run on a live product.
 *
 * Usage:
 *   npx tsx scripts/remove-product-image.ts "<name or slug>"
 */
import { db } from "../src/lib/db";

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('Usage: npx tsx scripts/remove-product-image.ts "<name or slug>"');
    process.exit(1);
  }

  const product = await db.product.findFirst({
    where: {
      OR: [
        { slug: query },
        { name: { equals: query, mode: "insensitive" } },
        { nameEn: { equals: query, mode: "insensitive" } },
      ],
    },
    include: { images: true },
  });

  if (!product) {
    console.error(`No product found matching "${query}".`);
    process.exit(1);
  }

  if (product.images.length === 0) {
    console.log(`"${product.name}" already has no images.`);
    return;
  }

  await db.productImage.deleteMany({ where: { productId: product.id } });
  console.log(`✅ Removed ${product.images.length} image(s) from "${product.name}".`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
