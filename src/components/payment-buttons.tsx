"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type BankDetails = {
  bankAccountHolder: string | null;
  bankIban: string;
  bankBic: string | null;
  reference: string;
  amount: number;
  currency: string;
};

const SECONDARY_BUTTON = "btn-secondary w-full py-3 disabled:opacity-60";

export function PaymentButtons({
  orderNumber,
  bankTransferEnabled,
  locale,
  dict,
}: {
  orderNumber: string;
  bankTransferEnabled: boolean;
  locale: string;
  dict: Dictionary["payment"];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  async function payRedirect(provider: "stripe" | "paypal") {
    setLoading(provider);
    setError(null);
    try {
      const res = await fetch(`/api/checkout/pay/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? dict.errStart);
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(dict.errStart);
      setLoading(null);
    }
  }

  async function payBankTransfer() {
    setLoading("bank_transfer");
    setError(null);
    try {
      const res = await fetch("/api/checkout/pay/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? dict.errBank);
        setLoading(null);
        return;
      }
      setBankDetails(data);
    } catch {
      setError(dict.errBank);
    } finally {
      setLoading(null);
    }
  }

  if (bankDetails) {
    return (
      <div className="shop-panel shop-panel-pad text-sm">
        <p className="mb-3 font-medium">{dict.bankTitle}</p>
        <dl className="flex flex-col gap-1">
          {bankDetails.bankAccountHolder && (
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/60">{dict.accountHolder}</dt>
              <dd>{bankDetails.bankAccountHolder}</dd>
            </div>
          )}
          {/* Account identifiers are exact strings: keep browser auto-translate
              from mangling them. */}
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/60">{dict.iban}</dt>
            <dd translate="no" className="font-mono break-all">
              {bankDetails.bankIban}
            </dd>
          </div>
          {bankDetails.bankBic && (
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/60">{dict.bic}</dt>
              <dd translate="no" className="font-mono">
                {bankDetails.bankBic}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/60">{dict.reference}</dt>
            <dd translate="no" className="font-mono">
              {bankDetails.reference}
            </dd>
          </div>
          <div className="mt-2 flex justify-between gap-4 font-semibold">
            <dt>{dict.amount}</dt>
            <dd className="tabular-nums">
              {formatMoney(bankDetails.amount, bankDetails.currency, locale)}
            </dd>
          </div>
        </dl>
        <p className="text-foreground/70 mt-3">{dict.bankNote}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => payRedirect("stripe")}
          disabled={loading !== null}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {loading === "stripe" ? dict.redirecting : dict.payWithCard}
        </button>
        {/* Card is guaranteed; the exact set of other options (Apple Pay,
            Google Pay, Klarna, iDEAL, Bancontact, SEPA Direct Debit, ...) is
            whatever the store has enabled in the Stripe Dashboard and isn't
            knowable from here, so this stays deliberately non-specific. */}
        <p className="text-foreground/60 text-xs">{dict.cardHelp}</p>
      </div>
      {/* PayPal isn't configured yet (no live credentials in Admin > Settings
          > Payments) — hidden from checkout for now rather than showing a
          customer a button that errors. Re-enable with a
          <button onClick={() => payRedirect("paypal")}> once credentials are
          set; payRedirect("paypal") above and the /api/checkout/pay/paypal
          route are untouched. */}
      {bankTransferEnabled && (
        <button
          type="button"
          onClick={payBankTransfer}
          disabled={loading !== null}
          className={SECONDARY_BUTTON}
        >
          {loading === "bank_transfer" ? dict.loading : dict.bankTransfer}
        </button>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
