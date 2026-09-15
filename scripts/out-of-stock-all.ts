import { readFileSync } from "node:fs";
import { db } from "../src/lib/db";

const urlUpdates: [string, string][] = JSON.parse(
  readFileSync("/tmp/url_updates.json", "utf-8")
);

async function main() {
  let imagesUpdated = 0;
  for (const [oldUrl, newUrl] of urlUpdates) {
    const result = await db.productImage.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    });
    imagesUpdated += result.count;
  }
  console.log(`Updated ${imagesUpdated} product image URL(s) from .jpeg to .png.`);

  const stockResult = await db.product.updateMany({ data: { stockQty: 0 } });
  console.log(`Set stockQty=0 on ${stockResult.count} product(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
