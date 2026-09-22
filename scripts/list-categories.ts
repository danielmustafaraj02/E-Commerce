/**
 * Read-only diagnostic: lists every top-level category with its id, slug,
 * and product count, to check for accidental duplicates (e.g. two rows
 * both named "Orecchini") showing up as repeated tiles on the homepage's
 * "Shop by category" carousel.
 *
 * Usage:
 *   npx tsx scripts/list-categories.ts
 */
import { db } from "../src/lib/db";

async function main() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  console.log(`${categories.length} top-level category row(s):\n`);
  for (const category of categories) {
    console.log(
      `- "${category.name}" (nameEn: ${category.nameEn ?? "(none)"}) — slug: ${category.slug} — id: ${category.id} — ${category._count.products} product(s)`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
