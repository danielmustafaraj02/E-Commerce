"use client";

import { useActionState } from "react";
import { updatePaymentSettings, clearPaymentField } from "./actions";
import { FormAlert } from "@/components/form-alert";

type FieldKey =
  | "stripeSecretKey"
  | "stripePublishableKey"
  | "stripeWebhookSecret"
  | "paypalClientId"
  | "paypalClientSecret"
  | "paypalWebhookId";

function SecretField({
  name,
  label,
  configured,
  type = "password",
}: {
  name: FieldKey;
  label: string;
  configured: boolean;
  type?: "password" | "text";
}) {
  const boundClear = clearPaymentField.bind(null, name);
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center justify-between">
        {label}
        {configured && (
          <span className="flex items-center gap-2 text-xs">
            <span className="text-success">configured</span>
            {/* formAction on a submit button inside the outer form — not a
                nested <form>, which HTML doesn't allow. */}
            <button type="submit" formAction={boundClear} className="text-danger hover:underline">
              Clear
            </button>
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        placeholder={configured ? "•••••••••••• (saved — leave blank to keep)" : "Not set"}
        autoComplete="off"
        className="field font-mono text-sm"
      />
    </label>
  );
}

export function PaymentsForm({
  configured,
  klarnaEnabled,
  siteUrl,
}: {
  configured: Record<FieldKey, boolean>;
  klarnaEnabled: boolean;
  siteUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updatePaymentSettings, {
    error: null as string | null,
    success: false,
  });

  return (
    <form action={formAction} className="form-card flex max-w-xl flex-col gap-8">
      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Stripe</legend>
        <SecretField
          name="stripeSecretKey"
          label="Secret key"
          configured={configured.stripeSecretKey}
        />
        <SecretField
          name="stripePublishableKey"
          label="Publishable key"
          type="text"
          configured={configured.stripePublishableKey}
        />
        <SecretField
          name="stripeWebhookSecret"
          label="Webhook signing secret"
          configured={configured.stripeWebhookSecret}
        />
        <p className="text-foreground/60 text-xs">
          Find these in the Stripe Dashboard under Developers → API keys, and Developers → Webhooks.
          Add an endpoint at <code className="break-all">{siteUrl}/api/webhooks/stripe</code> for
          the events <code>checkout.session.completed</code> and{" "}
          <code>checkout.session.async_payment_succeeded</code>, then paste its signing secret
          above.
        </p>
        <p className="text-foreground/60 text-xs">
          <strong>
            More payment methods (Apple Pay, Google Pay, Klarna, iDEAL, Bancontact, SEPA Direct
            Debit, Afterpay/Clearpay, Link, and more):
          </strong>{" "}
          this integration already asks Stripe for whatever&apos;s enabled — nothing here needs to
          change. Turn each one on in the Stripe Dashboard under Settings → Payment methods and it
          appears on the next checkout automatically (subject to the order&apos;s currency/country —
          e.g. iDEAL and Bancontact are EUR-only). Apple Pay needs no separate domain verification
          here since checkout happens on Stripe&apos;s own hosted page, not embedded on this site.
        </p>

        <label className="border-foreground/10 flex items-center gap-2 border-t pt-4 text-sm">
          <input
            type="checkbox"
            name="klarnaEnabled"
            defaultChecked={klarnaEnabled}
            className="field-checkbox"
          />
          Explicitly offer Klarna
        </label>
        <p className="text-foreground/60 text-xs">
          Only turn this on once Klarna is <strong>activated</strong> on your Stripe account
          (Dashboard → Settings → Payment methods) — if it isn&apos;t, checkout will fail outright
          instead of just hiding the option. Enabling it also switches this checkout session to
          showing <em>only</em> card + Klarna, instead of auto-including everything else you have
          enabled in the Dashboard (Apple Pay, Google Pay, etc.) — leave it off if you&apos;d rather
          those keep showing automatically.
        </p>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">PayPal</legend>
        <SecretField
          name="paypalClientId"
          label="Client ID"
          configured={configured.paypalClientId}
        />
        <SecretField
          name="paypalClientSecret"
          label="Client secret"
          configured={configured.paypalClientSecret}
        />
        <SecretField
          name="paypalWebhookId"
          label="Webhook ID"
          type="text"
          configured={configured.paypalWebhookId}
        />
        <p className="text-foreground/60 text-xs">
          Find these in the PayPal Developer Dashboard under your app&apos;s credentials (use the{" "}
          <strong>Live</strong> tab for real payments). Under the app&apos;s Webhooks, add{" "}
          <code className="break-all">{siteUrl}/api/webhooks/paypal</code> with the event{" "}
          <code>PAYMENT.CAPTURE.COMPLETED</code> and paste its Webhook ID above. The PayPal button
          appears at checkout only once the client ID and secret are both set. To try it with
          sandbox credentials first, set the environment variable <code>PAYPAL_ENV=sandbox</code>.
        </p>
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state?.success && <FormAlert type="success">Saved.</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Save payment settings"}
      </button>
    </form>
  );
}
