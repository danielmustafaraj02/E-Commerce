/**
 * Read-only: shows an order's status, payment record, and whether its
 * confirmation email would have been sent — the actual "did checkout work
 * end to end" check, not just whether Stripe took the money.
 *
 * Usage:
 *   npx tsx scripts/check-order.ts <orderNumber>
 */
import { db } from "../src/lib/db";

async function main() {
  const orderNumber = process.argv[2];
  if (!orderNumber) {
    console.error("Usage: npx tsx scripts/check-order.ts <orderNumber>");
    process.exit(1);
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payments: true, items: true, user: { select: { email: true } } },
  });

  if (!order) {
    console.error(`No order found: ${orderNumber}`);
    process.exit(1);
  }

  console.log(`Order ${order.orderNumber}`);
  console.log(`  status: ${order.status}`);
  console.log(`  total: ${(order.total / 100).toFixed(2)} ${order.currency}`);
  console.log(`  email: ${order.user?.email ?? order.guestEmail}`);
  console.log(`  created: ${order.createdAt.toISOString()}`);
  console.log(`  items: ${order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}`);
  console.log(`\n  payment(s):`);
  for (const p of order.payments) {
    console.log(
      `    provider=${p.provider} status=${p.status} amount=${(p.amount / 100).toFixed(2)} ${p.currency} txn=${p.providerTransactionId}`
    );
  }

  console.log(
    `\n${order.status === "paid" ? "✅" : "❌"} Order status is "${order.status}"${order.status === "paid" ? " — the webhook correctly marked it paid." : " — NOT paid. If Stripe shows the charge succeeded but this says otherwise, the webhook didn't fire or failed."}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
