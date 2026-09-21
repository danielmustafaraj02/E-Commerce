/**
 * Creates a €1.00 product for testing the real checkout/payment flow
 * end-to-end (Stripe session -> webhook -> order marked paid -> emails).
 * No image, clearly labeled as a test, description warns it won't be
 * fulfilled.
 *
 * IMPORTANT: this product must be `active: true` to be visitable at all
 * (src/app/products/[slug]/page.tsx 404s on inactive products, even for an
 * admin previewing the URL directly) — and /products has no category
 * filter, so once active it IS live and buyable by anyone who finds it,
 * not just you. Test quickly, then run scripts/remove-test-product.ts
 * right after to take it back down.
 *
 * Usage:
 *   npx tsx scripts/add-test-product.ts
 */
import { db } from "../src/lib/db";

const SLUG = "test-product-do-not-buy";
const SKU = "TEST-1EUR";

const WARNING =
  "This is a test product used to verify the checkout and payment system are working correctly. " +
  "If you purchase this item, you will NOT receive anything — no product will be shipped. " +
  "Please do not buy this.";

async function main() {
  const existing = await db.product.findUnique({ where: { slug: SLUG } });
  if (existing) {
    if (existing.active) {
      console.log(`Already exists and is active (id ${existing.id}).`);
      console.log(`   URL: /products/${SLUG}`);
      return;
    }
    // Left inactive by a previous scripts/remove-test-product.ts run (it
    // deactivates rather than deletes once a real order exists for it).
    await db.product.update({
      where: { id: existing.id },
      data: { active: true, stockQty: 999 },
    });
    console.log(`✅ Reactivated existing test product (id ${existing.id}).`);
    console.log(`   URL: /products/${SLUG}`);
    console.log(
      `\n⚠️  This is now LIVE and buyable by anyone who finds it, not just you — ` +
        `test quickly, then run scripts/remove-test-product.ts.`
    );
    return;
  }

  const product = await db.product.create({
    data: {
      name: "TEST PRODUCT — DO NOT BUY",
      nameEn: "TEST PRODUCT — DO NOT BUY",
      slug: SLUG,
      description: WARNING,
      descriptionEn: WARNING,
      price: 100, // €1.00
      currency: "EUR",
      sku: SKU,
      stockQty: 999,
      trackInventory: false,
      active: true,
      categoryId: null,
    },
  });

  console.log(`✅ Created test product (id ${product.id}).`);
  console.log(`   URL: /products/${SLUG}`);
  console.log(
    `\n⚠️  This is now LIVE and buyable by anyone who finds it, not just you — ` +
      `test quickly, then run scripts/remove-test-product.ts.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
