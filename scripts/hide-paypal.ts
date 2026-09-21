/**
 * Clears PayPal credentials from StoreSettings so the "Pay with PayPal"
 * button stops showing at checkout (src/components/payment-buttons.tsx
 * only renders it when both paypalClientId and paypalClientSecret are set —
 * see src/lib/paypal.ts#isPaypalConfigured). Also clears the webhook ID for
 * consistency. Stripe is untouched.
 *
 * No secrets printed. Safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/hide-paypal.ts
 */
import { db } from "../src/lib/db";
import { getStoreSettings } from "../src/lib/store-settings";

async function main() {
  const before = await getStoreSettings();
  const hadPaypal = Boolean(before.paypalClientId || before.paypalClientSecret);

  await db.storeSettings.upsert({
    where: { id: before.id },
    update: { paypalClientId: null, paypalClientSecret: null, paypalWebhookId: null },
    create: { id: before.id, paypalClientId: null, paypalClientSecret: null, paypalWebhookId: null },
  });

  console.log(
    hadPaypal
      ? "✅ Cleared PayPal credentials — the PayPal button will no longer show at checkout."
      : "PayPal wasn't configured — nothing to clear."
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
