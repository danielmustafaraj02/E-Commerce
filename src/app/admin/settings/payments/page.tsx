import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { PaymentsForm } from "./payments-form";
import { OfflinePaymentsForm } from "./offline-payments-form";

export default async function AdminPaymentsSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  // "Configured" reflects either source (DB or env var) — whichever the app
  // will actually use at runtime, per src/lib/stripe.ts and src/lib/paypal.ts.
  const configured = {
    stripeSecretKey: Boolean(settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY),
    stripePublishableKey: Boolean(
      settings.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY
    ),
    stripeWebhookSecret: Boolean(settings.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET),
    paypalClientId: Boolean(settings.paypalClientId || process.env.PAYPAL_CLIENT_ID),
    paypalClientSecret: Boolean(settings.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET),
    paypalWebhookId: Boolean(settings.paypalWebhookId || process.env.PAYPAL_WEBHOOK_ID),
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Payments</h1>
      <p className="text-foreground/70 mb-6 max-w-xl text-sm">
        Add your Stripe and PayPal credentials to activate real payments. Until these are set,
        checkout creates orders normally but attempting to pay shows a clear &quot;not
        configured&quot; message instead of failing silently.
      </p>
      <PaymentsForm configured={configured} klarnaEnabled={settings.klarnaEnabled} />

      <h2 className="mt-12 mb-4 text-xl font-semibold">Other payment methods</h2>
      <OfflinePaymentsForm
        initial={{
          bankTransferEnabled: settings.bankTransferEnabled,
          bankAccountHolder: settings.bankAccountHolder ?? "",
          bankIban: settings.bankIban ?? "",
          bankBic: settings.bankBic ?? "",
        }}
      />
    </div>
  );
}
