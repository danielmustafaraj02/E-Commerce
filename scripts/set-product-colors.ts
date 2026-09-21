/**
 * Assigns each product a canonical color (see src/lib/product-colors.ts),
 * read off its English name/description — hand-picked once, not inferred
 * at runtime. Matches by nameEn (set by update-product-descriptions.ts,
 * already live in production).
 *
 * Usage:
 *   npx tsx scripts/set-product-colors.ts [--dry-run]
 */
import { db } from "../src/lib/db";
import { PRODUCT_COLOR_KEYS, type ProductColorKey } from "../src/lib/product-colors";

const COLORS: Record<string, ProductColorKey> = {
  // Bracelets
  "Azure Lagoon Bracelet": "blue",
  "Onyx Blossom Bracelet": "black",
  "Rose Gold Dust Bracelet": "pink",
  "Pearl Gold Dust Bracelet": "gold",
  "Garnet Fire Bracelet": "red",
  "Midnight Copper Bracelet": "brown",
  "Amber Wrap Bracelet": "brown",
  "Rose Quartz Wrap Bracelet": "pink",
  "Moonlight Wrap Bracelet": "white",
  "Aegean Wrap Bracelet": "blue",
  "Stardust Wrap Bracelet": "blue",
  "Sage & Gold Wrap Bracelet": "green",
  "Lilac Bud Bracelet": "purple",
  "Crimson Bangle": "red",
  "Caribbean Bracelet": "turquoise",
  "Golden Forest Bracelet": "gold",
  "Carnival Bracelet": "multicolor",
  "Tuscan Rose Bracelet": "pink",
  "Sky Bubbles Bracelet": "blue",
  // Necklaces
  "Night Flower Necklace": "black",
  "Emerald Waves Necklace": "green",
  "Antique Copper Necklace": "brown",
  "Faceted Turquoise Necklace": "turquoise",
  "Rainbow Necklace": "multicolor",
  "Mixed Gems Necklace": "multicolor",
  "Emerald & Silver Necklace": "green",
  "Amethyst Necklace": "purple",
  "Golden Peony Necklace": "gold",
  "Royal Fuchsia Necklace": "pink",
  "Ruby Necklace": "red",
  "Pearl Rose & Sage Necklace": "pink",
  "Celestial Pearl Necklace": "white",
  "Antique Pink Pearl Necklace": "pink",
  "Aquamarine Necklace": "blue",
  "Starry Night Necklace": "black",
  "Poppy Necklace": "red",
  "Scarlet Flame Necklace": "red",
  "Summer Sky Necklace": "blue",
  // Earrings
  "Mint Leaf Earrings": "green",
  "Ice Drop Earrings": "white",
  "Pastel Garden Earrings": "multicolor",
  "Night Spots Earrings": "black",
  "Deep Blue Earrings": "blue",
  "Onyx Pebble Earrings": "black",
  "Rose Petal Earrings": "pink",
  "Ruby Drop Earrings": "red",
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Fail loudly on a typo rather than silently skipping a product.
  for (const color of Object.values(COLORS)) {
    if (!PRODUCT_COLOR_KEYS.includes(color)) {
      throw new Error(`"${color}" is not a valid ProductColorKey`);
    }
  }

  const products = await db.product.findMany({
    select: { id: true, nameEn: true, color: true },
  });

  let updated = 0;
  let unmatched = 0;

  for (const product of products) {
    const color = product.nameEn ? COLORS[product.nameEn] : undefined;
    if (!color) {
      console.warn(`No color mapping for "${product.nameEn ?? "(no nameEn)"}"`);
      unmatched++;
      continue;
    }
    if (product.color === color) continue;

    if (dryRun) {
      console.log(`[dry-run] "${product.nameEn}": ${product.color ?? "(none)"} -> ${color}`);
    } else {
      await db.product.update({ where: { id: product.id }, data: { color } });
      console.log(`"${product.nameEn}": ${product.color ?? "(none)"} -> ${color}`);
    }
    updated++;
  }

  console.log(
    `\nDone. ${updated} product(s) ${dryRun ? "would be " : ""}updated, ${unmatched} unmatched.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
