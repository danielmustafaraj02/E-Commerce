"use client";

import { useMemo, useState } from "react";
import {
  loadStripe,
  type StripeElementLocale,
  type StripeExpressCheckoutElementConfirmEvent,
} from "@stripe/stripe-js";
import { Elements, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/lib/cart-store";

// This site's 11 locales aren't all locales Stripe's UI itself is
// translated into (notably Hindi isn't) — falls back to "auto" (Stripe
// detects from the browser) rather than a TypeScript cast that could pass
// through a locale Stripe would silently reject.
const STRIPE_LOCALES = new Set(["ar", "de", "en", "es", "fr", "it", "ja", "pt", "ru", "zh"]);
function toStripeLocale(locale: string): StripeElementLocale {
  return STRIPE_LOCALES.has(locale) ? (locale as StripeElementLocale) : "auto";
}

// One-tap Apple Pay / Google Pay from the cart, skipping the address form
// entirely — the wallet sheet collects shipping address + payment method
// (Face ID/fingerprint-confirmed), then /api/checkout/express creates the
// order server-side (same placeOrderWithRetry the full checkout form uses)
// with the *server-computed* total, and a PaymentIntent is confirmed for
// that amount. The `amount` given to <Elements> below is a client-side
// estimate for display inside the wallet sheet only — never what's actually
// charged.
//
// Renders nothing if the browser/device has neither wallet available (most
// desktop browsers, non-Safari without Google Pay set up) rather than
// showing a broken or empty button — see onReady below.

function ExpressCheckoutInner({ dividerLabel }: { dividerLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const items = useCartStore((state) => state.items);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? null);
      setBusy(false);
      return;
    }

    const shipping = event.shippingAddress;
    const billing = event.billingDetails;
    if (!shipping) {
      setError(null);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout/express", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          guestEmail: billing?.email ?? undefined,
          address: {
            fullName: shipping.name || billing?.name || "",
            street: [shipping.address.line1, shipping.address.line2].filter(Boolean).join(", "),
            city: shipping.address.city || "",
            postalCode: shipping.address.postal_code || "",
            country: shipping.address.country || "",
            phone: billing?.phone || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? null);
        setBusy(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${data.orderNumber}?paid=1`,
        },
      });
      if (confirmError) {
        setError(confirmError.message ?? null);
        setBusy(false);
      }
      // On success Stripe redirects to return_url itself — no further
      // action here.
    } catch {
      setError(null);
      setBusy(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2" hidden={!visible}>
      <p className="text-foreground/60 text-center text-xs">{dividerLabel}</p>
      <ExpressCheckoutElement
        onReady={({ availablePaymentMethods }) => setVisible(Boolean(availablePaymentMethods))}
        onConfirm={handleConfirm}
        options={{
          paymentMethodOrder: ["apple_pay", "google_pay"],
          emailRequired: true,
          buttonTheme: { applePay: "black", googlePay: "black" },
          buttonHeight: 48,
        }}
      />
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export function ExpressCheckoutButton({
  publishableKey,
  locale,
  dividerLabel,
  discount = 0,
}: {
  publishableKey: string | null;
  locale: string;
  dividerLabel: string;
  // Estimated complete-the-look saving, so the wallet sheet's estimate matches.
  discount?: number;
}) {
  const items = useCartStore((state) => state.items);
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );
  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - discount;
  const currency = (items[0]?.currency ?? "eur").toLowerCase();

  if (!stripePromise || items.length === 0 || amount <= 0) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{ mode: "payment", amount, currency, locale: toStripeLocale(locale) }}
    >
      <ExpressCheckoutInner dividerLabel={dividerLabel} />
    </Elements>
  );
}
