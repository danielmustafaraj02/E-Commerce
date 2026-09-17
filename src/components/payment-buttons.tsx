"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";

type BankDetails = {
  bankAccountHolder: string | null;
  bankIban: string;
  bankBic: string | null;
  reference: string;
  amount: number;
  currency: string;
};

export function PaymentButtons({
  orderNumber,
  bankTransferEnabled,
  codEnabled,
  locale,
}: {
  orderNumber: string;
  bankTransferEnabled: boolean;
  codEnabled: boolean;
  locale: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [codConfirmed, setCodConfirmed] = useState(false);

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
        setError(data.error ?? "Could not start payment");
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start payment");
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
        setError(data.error ?? "Could not start bank transfer");
        setLoading(null);
        return;
      }
      setBankDetails(data);
    } catch {
      setError("Could not start bank transfer");
    } finally {
      setLoading(null);
    }
  }

  async function payCashOnDelivery() {
    setLoading("cod");
    setError(null);
    try {
      const res = await fetch("/api/checkout/pay/cash-on-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not confirm cash on delivery");
        setLoading(null);
        return;
      }
      setCodConfirmed(true);
      router.refresh();
    } catch {
      setError("Could not confirm cash on delivery");
      setLoading(null);
    }
  }

  if (bankDetails) {
    return (
      <div className="border-foreground/10 rounded border p-4 text-sm">
        <p className="mb-3 font-medium">Complete your bank transfer</p>
        <dl className="flex flex-col gap-1">
          {bankDetails.bankAccountHolder && (
            <div className="flex justify-between">
              <dt className="text-foreground/60">Account holder</dt>
              <dd>{bankDetails.bankAccountHolder}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-foreground/60">IBAN</dt>
            <dd className="font-mono">{bankDetails.bankIban}</dd>
          </div>
          {bankDetails.bankBic && (
            <div className="flex justify-between">
              <dt className="text-foreground/60">BIC/SWIFT</dt>
              <dd className="font-mono">{bankDetails.bankBic}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-foreground/60">Reference</dt>
            <dd className="font-mono">{bankDetails.reference}</dd>
          </div>
          <div className="mt-2 flex justify-between font-semibold">
            <dt>Amount</dt>
            <dd>{formatMoney(bankDetails.amount, bankDetails.currency, locale)}</dd>
          </div>
        </dl>
        <p className="text-foreground/70 mt-3">
          Please include the reference above so we can match your payment. We&apos;ll confirm your
          order once the transfer arrives.
        </p>
      </div>
    );
  }

  if (codConfirmed) {
    return <p className="text-success text-sm">Confirmed — pay the courier on delivery.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => payRedirect("stripe")}
          disabled={loading !== null}
          className="bg-primary w-full rounded px-4 py-3 text-white disabled:opacity-60"
        >
          {loading === "stripe" ? "Redirecting..." : "Pay with card or wallet"}
        </button>
        {/* Card is guaranteed; the exact set of other options (Apple Pay,
            Google Pay, Klarna, iDEAL, Bancontact, SEPA Direct Debit, ...) is
            whatever the store has enabled in the Stripe Dashboard and isn't
            knowable from here, so this stays deliberately non-specific. */}
        <p className="text-foreground/60 text-xs">
          Card, and any wallet or local payment method enabled at checkout.
        </p>
      </div>
      {/* PayPal isn't configured yet (no live credentials in Admin > Settings
          > Payments) — hidden from checkout for now rather than showing a
          customer a button that errors. Uncomment once credentials are set;
          payRedirect("paypal") above and the /api/checkout/pay/paypal route
          are untouched. */}
      {/* <button
        type="button"
        onClick={() => payRedirect("paypal")}
        disabled={loading !== null}
        className="border-foreground/20 rounded border px-4 py-3 disabled:opacity-60"
      >
        {loading === "paypal" ? "Redirecting..." : "Pay with PayPal"}
      </button> */}
      {bankTransferEnabled && (
        <button
          type="button"
          onClick={payBankTransfer}
          disabled={loading !== null}
          className="border-foreground/20 rounded border px-4 py-3 disabled:opacity-60"
        >
          {loading === "bank_transfer" ? "Loading..." : "Pay by bank transfer"}
        </button>
      )}
      {codEnabled && (
        <button
          type="button"
          onClick={payCashOnDelivery}
          disabled={loading !== null}
          className="border-foreground/20 rounded border px-4 py-3 disabled:opacity-60"
        >
          {loading === "cod" ? "Confirming..." : "Cash on delivery"}
        </button>
      )}
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
