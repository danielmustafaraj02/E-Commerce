/**
 * The gift-box/bag photo at
 * public/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.png
 * was reused as a shared "packaging" shot in many products' galleries. The
 * product page's dedicated gift section now shows this same photo on its
 * own, so it no longer belongs in the jewelry gallery itself — this removes
 * just that one ProductImage row per affected product, leaving every other
 * photo (and the asset file itself) untouched.
 *
 * Usage:
 *   npx tsx scripts/remove-packaging-gallery-image.ts [--dry-run]
 */
import { db } from "../src/lib/db";

const PACKAGING_IMAGE_URL =
  "/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.png";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const rows = await db.productImage.findMany({
    where: { url: PACKAGING_IMAGE_URL },
    include: { product: { select: { name: true } } },
  });

  if (rows.length === 0) {
    console.log("No gallery rows reference the packaging image. Nothing to do.");
    return;
  }

  for (const row of rows) {
    console.log(`${dryRun ? "[dry-run] would remove" : "Removing"} from "${row.product.name}"`);
  }

  if (!dryRun) {
    await db.productImage.deleteMany({ where: { url: PACKAGING_IMAGE_URL } });
  }

  console.log(
    `\nDone. ${rows.length} gallery row(s) ${dryRun ? "would be " : ""}removed. The image file itself is untouched.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
