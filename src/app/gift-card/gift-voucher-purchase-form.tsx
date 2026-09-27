"use client";

import { useRef, useState } from "react";
import { FormAlert } from "@/components/form-alert";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useLocalizedRouter } from "@/components/localized-link";
import { formatMoney } from "@/lib/format";
import { GIFT_VOUCHER_AMOUNTS } from "@/lib/gift-voucher";
import type { GiftVoucherCopy } from "@/lib/gift-voucher-copy";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function GiftVoucherPurchaseForm({
  copy,
  checkoutDict,
  locale,
  buyerEmail,
  isLoggedIn,
  turnstileSiteKey,
  nonce,
}: {
  copy: GiftVoucherCopy;
  checkoutDict: Dictionary["checkout"];
  locale: string;
  buyerEmail: string;
  isLoggedIn: boolean;
  turnstileSiteKey: string | null;
  nonce?: string;
}) {
  const router = useLocalizedRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState<number>(GIFT_VOUCHER_AMOUNTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const turnstileToken = (
      formRef.current?.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null
    )?.value;

    try {
      const response = await fetch("/api/gift-vouchers/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          buyerEmail: isLoggedIn ? undefined : form.get("buyerEmail"),
          recipientEmail: form.get("recipientEmail"),
          recipientName: form.get("recipientName") || undefined,
          senderName: form.get("senderName") || undefined,
          message: form.get("message") || undefined,
          turnstileToken,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.orderNumber) {
        setError(result.error ?? copy.formError);
        setSubmitting(false);
        return;
      }
      router.push(`/order-confirmation/${result.orderNumber}`);
    } catch {
      setError(copy.formError);
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="gift-voucher-form">
      <p className="gift-voucher-form-eyebrow">{copy.purchaseLabel}</p>
      <fieldset className="gift-voucher-amounts">
        <legend>{copy.selectAmount}</legend>
        <div className="gift-voucher-amount-grid">
          {GIFT_VOUCHER_AMOUNTS.map((value) => (
            <label
              key={value}
              className={`gift-voucher-amount${amount === value ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="giftVoucherAmount"
                value={value}
                checked={amount === value}
                onChange={() => setAmount(value)}
              />
              <span>{formatMoney(value, "EUR", locale)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="gift-voucher-field">
        <span>{copy.buyerEmail}</span>
        <input
          required
          type="email"
          name="buyerEmail"
          autoComplete="email"
          defaultValue={buyerEmail}
          readOnly={isLoggedIn}
          className="field"
        />
      </label>

      <label className="gift-voucher-field">
        <span>{copy.recipientEmail}</span>
        <input required type="email" name="recipientEmail" autoComplete="email" className="field" />
      </label>

      <div className="gift-voucher-name-grid">
        <label className="gift-voucher-field">
          <span>{copy.recipientLabel}</span>
          <input
            type="text"
            name="recipientName"
            autoComplete="off"
            maxLength={60}
            className="field"
          />
        </label>
        <label className="gift-voucher-field">
          <span>{copy.senderLabel}</span>
          <input
            type="text"
            name="senderName"
            autoComplete="name"
            maxLength={60}
            className="field"
          />
        </label>
      </div>

      <label className="gift-voucher-field">
        <span>{copy.messageLabel}</span>
        <textarea name="message" rows={3} maxLength={240} className="field gift-voucher-message" />
      </label>

      <TurnstileWidget siteKey={turnstileSiteKey} nonce={nonce} />
      {error && <FormAlert type="error">{error}</FormAlert>}

      <p className="gift-voucher-delivery-note">{copy.deliveryNote}</p>
      <p className="gift-voucher-terms">{copy.balanceTerms}</p>
      <button type="submit" disabled={submitting} className="gift-voucher-submit">
        {submitting ? checkoutDict.placingOrder : copy.purchaseButton}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
