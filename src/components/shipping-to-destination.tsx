"use client";

import { useEffect, useState } from "react";
import { countryFlagEmoji } from "@/lib/countries";
import { CountryCombobox } from "@/components/country-combobox";
import { formatMoney } from "@/lib/format";

type ShippingMethod = {
  id: string;
  name: string;
  basePrice: number;
  active: boolean;
};

/**
 * "Shipping to [country] — Free shipping / € 30,00", under the delivery
 * estimate on a product page.
 *
 * The figure is NOT computed here. It comes from /api/shipping/methods, the
 * same endpoint checkout uses, which resolves the destination's zone in the
 * database — so the price quoted here is the price charged, and an admin
 * changing a rate changes both at once.
 *
 * Why only `basePrice`: lib/pricing.ts, which is what actually charges, does
 * `shippingAmount = freeShipping ? 0 : shippingMethod.basePrice`. `pricePerKg`
 * exists on the model but is never applied, and no product carries a weight,
 * so the base price is the whole cost. If per-kilo pricing is ever switched
 * on, this and pricing.ts have to change together.
 *
 * No destination is assumed. The brief is explicit that it must not be
 * inferred from the interface language — a Dutch-speaking shopper in Canada
 * would be quoted the wrong price — so nothing is shown until one is chosen.
 */
export function ShippingToDestination({
  locale,
  currency,
  labels,
}: {
  locale: string;
  currency: string;
  labels: {
    to: string;
    choose: string;
    free: string;
    none: string;
    loading: string;
  };
}) {
  const [country, setCountry] = useState("");
  /* The answer, tagged with the country it answers for. Keeping the two
     together is what lets "loading" be DERIVED — it is simply "there is a
     country selected and no result for it yet" — so the effect never has to
     write state in its own synchronous pass, and a stale reply for a
     previous country can never be mistaken for the current one. */
  const [result, setResult] = useState<{
    country: string;
    methods: ShippingMethod[];
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!country) return;
    /* A slow reply for a country the reader has already moved on from must
       not overwrite the current one. */
    let cancelled = false;
    fetch(`/api/shipping/methods?country=${country}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { methods?: ShippingMethod[] }) => {
        if (cancelled) return;
        setResult({
          country,
          methods: (data.methods ?? []).filter((m) => m.active),
          failed: false,
        });
      })
      .catch(() => {
        if (!cancelled) setResult({ country, methods: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  const answered = result?.country === country ? result : null;
  const loading = Boolean(country) && !answered;

  /* The cheapest option is the one worth quoting: it is what a shopper will
     pay unless they deliberately upgrade at checkout. */
  const cheapest = answered?.methods.length
    ? answered.methods.reduce((a, b) => (b.basePrice < a.basePrice ? b : a))
    : null;

  return (
    <div className="shop-ship-to">
      <CountryCombobox
        id="shop-ship-to"
        value={country}
        onChange={setCountry}
        locale={locale}
        label={labels.to}
        placeholder={labels.choose}
      />

      {/* aria-live, because the answer arrives after the select changes and a
          screen-reader user would otherwise never hear it. */}
      <p className="shop-ship-to-result" aria-live="polite">
        {answered && !answered.failed && cheapest && (
          <span className="shop-ship-to-flag" aria-hidden="true">
            {countryFlagEmoji(country)}
          </span>
        )}
        {loading && labels.loading}
        {answered &&
          (answered.failed || !cheapest
            ? labels.none
            : cheapest.basePrice === 0
              ? labels.free
              : `${cheapest.name} — ${formatMoney(cheapest.basePrice, currency, locale)}`)}
      </p>
    </div>
  );
}
