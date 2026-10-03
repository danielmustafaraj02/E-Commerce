// Creates (or refreshes) the €1 payment test product.
//
// It is `active: true` so checkout treats it like any other product — the
// whole point is to run a real payment through the real code path — but
// `unlisted: true`, so it never appears in listings, category pages, the
// homepage, the gift finder, search, the sitemap or the Google Merchant feed.
// The only way in is the direct URL:
//
//   /products/payment-test-1-eur
//
// Run with: npx tsx scripts/create-payment-test-product.ts
import { db } from "../src/lib/db";

const SLUG = "payment-test-1-eur";

const DESCRIPTION = `INTERNAL PAYMENT TEST — NOT A REAL PRODUCT, NOT FOR SALE.

This listing exists only so the shop owner and developers can put a real
payment through the real checkout for the smallest possible amount (€1.00).
It is deliberately unlisted: it does not appear anywhere in the catalogue,
the homepage, search, the sitemap or any product feed, and it is reachable
only by typing this page's address directly.

Nothing is shipped. No glass, no packaging, no gift card — there is no
physical item behind this page at all. If you have landed here by accident,
please close the page and do not order it. Any order that does come in
should be refunded in full from the Stripe dashboard and cancelled in
Admin > Orders.

What it is used for: confirming that card payments, Klarna, PayPal, the
Stripe webhook, order creation, the confirmation email and the refund flow
all work end to end against live or test credentials, without risking a
meaningful amount of money.`;

const STORY = `Why this page has no photo: there is no object to photograph.
It is a €1 probe for the payment system, kept intentionally plain so nobody
mistakes it for something that can be bought.`;

async function main() {
  const product = await db.product.upsert({
    where: { slug: SLUG },
    update: {
      name: "Payment test — do not order (€1)",
      description: DESCRIPTION,
      story: STORY,
      price: 100, // cents
      currency: "EUR",
      active: true,
      unlisted: true,
      stockQty: 999,
      trackInventory: true,
      categoryId: null,
      compareAtPrice: null,
      color: null,
    },
    create: {
      name: "Payment test — do not order (€1)",
      nameEn: "Payment test — do not order (€1)",
      slug: SLUG,
      description: DESCRIPTION,
      descriptionEn: DESCRIPTION,
      story: STORY,
      storyEn: STORY,
      price: 100, // cents
      currency: "EUR",
      sku: "TEST-PAYMENT-1EUR",
      stockQty: 999,
      lowStockThreshold: 0,
      active: true,
      unlisted: true,
    },
  });

  console.log(`Payment test product ready: /products/${product.slug} (id ${product.id})`);
  console.log(`Price: ${(product.price / 100).toFixed(2)} ${product.currency}`);
  console.log(`active=${product.active} unlisted=${product.unlisted}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
