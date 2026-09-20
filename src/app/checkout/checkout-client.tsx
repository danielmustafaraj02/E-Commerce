"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import { applyTemplate } from "@/lib/i18n/format";
import { isValidPostalCode } from "@/lib/postal-code";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ShippingMethod = {
  id: string;
  name: string;
  basePrice: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

type Quote = {
  subtotal: number;
  taxAmount: number;
  taxRatePercent: number | null;
  missingTaxRule: boolean;
  shippingAmount: number;
  freeShipping: boolean;
  discountAmount: number;
  total: number;
  currency: string;
  pricesIncludeTax: boolean;
};

export function CheckoutClient({
  locale,
  countries,
  isLoggedIn,
  userEmail,
  turnstileSiteKey,
  nonce,
  dict,
}: {
  locale: string;
  countries: string[];
  isLoggedIn: boolean;
  userEmail: string | null;
  turnstileSiteKey: string | null;
  nonce?: string;
  dict: Dictionary["checkout"];
}) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const formRef = useRef<HTMLFormElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalCodeTouched, setPostalCodeTouched] = useState(false);
  const [country, setCountry] = useState(countries[0] ?? "");
  const [phone, setPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | undefined>(undefined);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<string>("");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Country names in the shopper's language instead of bare ISO codes. Built on
  // the client only (this form doesn't render until the cart has hydrated), so
  // there's no server/client mismatch; falls back to the code if unsupported.
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);

  const cartItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

  useEffect(() => {
    if (!country) return;
    fetch(`/api/shipping/methods?country=${country}`)
      .then((res) => res.json())
      .then((data: { methods: ShippingMethod[] }) => {
        setShippingMethods(data.methods);
        setShippingMethodId((current) =>
          data.methods.some((m) => m.id === current) ? current : (data.methods[0]?.id ?? "")
        );
      });
  }, [country]);

  useEffect(() => {
    if (!country || !shippingMethodId || cartItems.length === 0) {
      // Clearing a derived quote when its own inputs become invalid, not the
      // effect->setState cascade this rule guards against.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuote(null);
      return;
    }
    let cancelled = false;
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        country,
        shippingMethodId,
        discountCode: appliedDiscountCode,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not calculate order total");
          setQuote(null);
          return;
        }
        setError(null);
        setQuote(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not calculate order total");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, shippingMethodId, appliedDiscountCode, JSON.stringify(cartItems)]);

  if (items.length === 0) {
    return <p className="text-foreground/70 text-sm">{dict.empty}</p>;
  }

  const postalCodeValid = isValidPostalCode(country, postalCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostalCodeTouched(true);
    if (!postalCodeValid) {
      setError(dict.invalidPostalCode);
      postalCodeRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);

    const turnstileToken = (
      formRef.current?.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null
    )?.value;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          guestEmail: isLoggedIn ? undefined : guestEmail,
          address: { fullName, street, city, postalCode, country, phone: phone || undefined },
          shippingMethodId,
          discountCode: appliedDiscountCode,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch {
      setError("Could not place order");
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {!isLoggedIn && (
        <div className="form-card">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{dict.emailForUpdates}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              spellCheck={false}
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="field"
            />
          </label>
        </div>
      )}
      {isLoggedIn && userEmail && (
        <p className="text-foreground/70 text-sm">
          {applyTemplate(dict.orderUpdatesTo, { email: userEmail })}
        </p>
      )}

      <fieldset className="form-card flex flex-col gap-4">
        <legend className="mb-1 px-1 font-medium">{dict.shippingAddress}</legend>
        <input
          required
          name="name"
          autoComplete="name"
          aria-label={dict.fullName}
          placeholder={dict.fullName}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="field"
        />
        <input
          required
          name="street-address"
          autoComplete="address-line1"
          aria-label={dict.street}
          placeholder={dict.street}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="field"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            required
            name="city"
            autoComplete="address-level2"
            aria-label={dict.city}
            placeholder={dict.city}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="field sm:flex-1"
          />
          <input
            ref={postalCodeRef}
            required
            name="postal-code"
            autoComplete="postal-code"
            aria-label={dict.postalCode}
            placeholder={dict.postalCode}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onBlur={() => setPostalCodeTouched(true)}
            aria-invalid={postalCodeTouched && !postalCodeValid}
            aria-describedby={
              postalCodeTouched && !postalCodeValid ? "postal-code-error" : undefined
            }
            className={`field sm:w-32 ${
              postalCodeTouched && !postalCodeValid ? "border-danger" : ""
            }`}
          />
        </div>
        {postalCodeTouched && !postalCodeValid && (
          <p id="postal-code-error" role="alert" className="text-danger -mt-2 text-xs">
            {dict.invalidPostalCode}
          </p>
        )}
        <select
          name="country"
          autoComplete="country"
          aria-label={dict.country}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="field"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {regionNames?.of(c) ?? c}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name="tel"
          autoComplete="tel"
          inputMode="tel"
          aria-label={dict.phoneOptional}
          placeholder={dict.phoneOptional}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="field"
        />
      </fieldset>

      {shippingMethods.length > 0 && (
        <fieldset className="form-card flex flex-col gap-2">
          <legend className="mb-1 px-1 font-medium">{dict.shippingMethod}</legend>
          {shippingMethods.map((method) => (
            <label key={method.id} className="option-card text-sm">
              <input
                type="radio"
                name="shippingMethod"
                checked={shippingMethodId === method.id}
                onChange={() => setShippingMethodId(method.id)}
                className="field-radio"
              />
              <span className="flex-1">
                <span className="block font-medium">{method.name}</span>
                <span className="text-foreground/60 text-xs">
                  {applyTemplate(dict.days, {
                    min: method.estimatedDaysMin,
                    max: method.estimatedDaysMax,
                  })}
                </span>
              </span>
              <span className="font-medium">
                {formatMoney(method.basePrice, quote?.currency ?? "EUR", locale)}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="form-card flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            name="discount-code"
            autoComplete="off"
            spellCheck={false}
            aria-label={dict.discountCode}
            placeholder={dict.discountCode}
            value={discountCodeInput}
            onChange={(e) => setDiscountCodeInput(e.target.value)}
            onKeyDown={(e) => {
              // This input lives inside the checkout <form>, so Enter would
              // otherwise submit the form and place the order. Apply the code.
              if (e.key === "Enter") {
                e.preventDefault();
                setAppliedDiscountCode(discountCodeInput || undefined);
              }
            }}
            className="field flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => setAppliedDiscountCode(discountCodeInput || undefined)}
            className="btn-secondary shrink-0 text-sm"
          >
            {dict.apply}
          </button>
        </div>

        <div aria-live="polite">
          {quote && (
            <div className="border-foreground/10 animate-fade-up flex flex-col gap-1.5 border-t pt-4 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-foreground/70">{dict.subtotal}</span>
                <span>{formatMoney(quote.subtotal, quote.currency, locale)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="text-success flex justify-between">
                  <span>{dict.discount}</span>
                  <span>-{formatMoney(quote.discountAmount, quote.currency, locale)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-foreground/70">{dict.shipping}</span>
                <span>{formatMoney(quote.shippingAmount, quote.currency, locale)}</span>
              </div>
              {quote.freeShipping && (
                <p className="text-success text-xs">{dict.freeShippingApplied}</p>
              )}
              <div className="text-foreground/70 flex justify-between">
                <span>
                  {quote.pricesIncludeTax ? dict.includesVat : dict.vat}
                  {quote.taxRatePercent !== null ? ` (${quote.taxRatePercent}%)` : ""}
                </span>
                <span>{formatMoney(quote.taxAmount, quote.currency, locale)}</span>
              </div>
              {quote.missingTaxRule && <p className="text-warning">{dict.missingTaxRule}</p>}
              <div className="border-foreground/10 mt-1 flex justify-between border-t pt-2 text-base font-semibold">
                <span>{dict.total}</span>
                <span>{formatMoney(quote.total, quote.currency, locale)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <TurnstileWidget siteKey={turnstileSiteKey} nonce={nonce} />

      {error && <FormAlert type="error">{error}</FormAlert>}

      <p className="text-foreground/60 text-xs">
        {dict.withdrawalNotice}{" "}
        <Link href="/legal/returns" className="underline">
          {dict.returnPolicy}
        </Link>
        .
      </p>

      <button type="submit" disabled={submitting || !quote} className="btn-primary py-3 text-base">
        {submitting ? dict.placingOrder : dict.placeOrder}
      </button>
    </form>
  );
}
