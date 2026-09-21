/**
 * Removes the €1 test product created by scripts/add-test-product.ts.
 * Deactivates it rather than hard-deleting if it has any real Order/Payment
 * rows attached (from your actual test purchase) — deleting a product with
 * order history would break that order's product reference. A product with
 * no orders yet is deleted outright.
 *
 * Usage:
 *   npx tsx scripts/remove-test-product.ts
 */
import { db } from "../src/lib/db";

const SLUG = "test-product-do-not-buy";

async function main() {
  const product = await db.product.findUnique({
    where: { slug: SLUG },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    console.log("Test product doesn't exist — nothing to do.");
    return;
  }

  if (product._count.orderItems > 0) {
    await db.product.update({ where: { id: product.id }, data: { active: false } });
    console.log(
      `Deactivated (not deleted — it has ${product._count.orderItems} order item(s) attached, ` +
        "from your test purchase). No longer visible or buyable."
    );
  } else {
    await db.product.delete({ where: { id: product.id } });
    console.log("Deleted — no orders were ever placed for it.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
