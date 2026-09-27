"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Link, useLocalizedRouter } from "@/components/localized-link";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { CatalogImage } from "@/components/catalog-image";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import { AddressCheck } from "@/components/address-check";
import { PaymentIcons } from "@/components/payment-icons";
import { TrustBadges } from "@/components/trust-badges";
import { applyTemplate } from "@/lib/i18n/format";
import { isValidPostalCode } from "@/lib/postal-code";
import { isEuCountry, countryFlagEmoji } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Loaded on demand (adds the Stripe SDK to the bundle) so a shopper who ends
// up paying by card/PayPal/bank transfer never pays for it — checkout must
// load fast (see the roadmap task's performance requirement).
const ExpressCheckoutButton = dynamic(
  () => import("@/components/express-checkout-button").then((m) => m.ExpressCheckoutButton),
  { ssr: false }
);

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
  bundleDiscountAmount: number;
  giftCardAmount: number;
  total: number;
  currency: string;
  pricesIncludeTax: boolean;
};

export function CheckoutClient({
  locale,
  uiLocale,
  countries,
  isLoggedIn,
  userEmail,
  savedAddress,
  turnstileSiteKey,
  stripePublishableKey,
  expressCheckoutLabel,
  quoteLoadingLabel,
  paymentMethods,
  trustLabels,
  supportLabel,
  bankTransferLabel,
  nonce,
  dict,
  giftCardOffer,
}: {
  locale: string;
  uiLocale: string;
  countries: string[];
  isLoggedIn: boolean;
  userEmail: string | null;
  savedAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string | null;
  } | null;
  turnstileSiteKey: string | null;
  stripePublishableKey: string | null;
  expressCheckoutLabel: string;
  quoteLoadingLabel: string;
  paymentMethods: { cards: boolean; paypal: boolean; klarna: boolean; bankTransfer: boolean };
  trustLabels: {
    handmadeInMurano: string;
    secureBadge: string;
    trackedShipping: string;
    returnsBadge: string;
  };
  supportLabel: string;
  bankTransferLabel: string;
  nonce?: string;
  dict: Dictionary["checkout"];
  // The personalised gift card add-on, while the store offers it.
  giftCardOffer: { productName: string; printedNote: string } | null;
}) {
  const router = useLocalizedRouter();
  const storedGiftCard = useCartStore((state) => state.giftCard);
  const giftCard = giftCardOffer ? storedGiftCard : null;
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const formRef = useRef<HTMLFormElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const initialSavedAddress =
    savedAddress && countries.includes(savedAddress.country) ? savedAddress : null;

  const [fullName, setFullName] = useState(initialSavedAddress?.fullName ?? "");
  const [street, setStreet] = useState(initialSavedAddress?.street ?? "");
  const [city, setCity] = useState(initialSavedAddress?.city ?? "");
  const [postalCode, setPostalCode] = useState(initialSavedAddress?.postalCode ?? "");
  const [postalCodeTouched, setPostalCodeTouched] = useState(false);
  const [country, setCountry] = useState(
    initialSavedAddress?.country ?? (countries.includes("IT") ? "IT" : (countries[0] ?? ""))
  );
  const [phone, setPhone] = useState(initialSavedAddress?.phone ?? "");
  const [guestEmail, setGuestEmail] = useState("");
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | undefined>(undefined);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<string>("");
  // Which country the loaded methods are for — so "no methods" is only shown
  // once the lookup for the *current* country has finished (not while loading).
  const [shippingLoadedFor, setShippingLoadedFor] = useState<string | null>(null);

  const [quoteState, setQuoteState] = useState<{ key: string; value: Quote } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Country names in the shopper's language instead of bare ISO codes. Built on
  // the client only (this form doesn't render until the cart has hydrated), so
  // there's no server/client mismatch; falls back to the code if unsupported.
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([uiLocale], { type: "region" });
    } catch {
      return null;
    }
  }, [uiLocale]);

  const cartItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
  const selectedShippingMethod = shippingMethods.find((m) => m.id === shippingMethodId);
  const quoteRequest = {
    items: cartItems,
    country,
    shippingMethodId,
    discountCode: appliedDiscountCode,
    giftCard: Boolean(giftCard),
  };
  const quoteRequestKey = JSON.stringify(quoteRequest);
  const quote = quoteState?.key === quoteRequestKey ? quoteState.value : null;
  const quoteLoading = Boolean(
    country &&
      shippingMethodId &&
      shippingLoadedFor === country &&
      !quote &&
      !error
  );

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    fetch(`/api/shipping/methods?country=${country}`)
      .then((res) => res.json())
      .then((data: { methods?: ShippingMethod[] }) => {
        if (cancelled) return;
        const methods = data.methods ?? [];
        setShippingMethods(methods);
        setShippingMethodId((current) =>
          methods.some((m) => m.id === current) ? current : (methods[0]?.id ?? "")
        );
        setShippingLoadedFor(country);
      })
      .catch(() => {
        // Treat a failed lookup like "nothing available": the shopper sees the
        // message below instead of a silently empty form.
        if (cancelled) return;
        setShippingMethods([]);
        setShippingMethodId("");
        setShippingLoadedFor(country);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (
      !country ||
      !shippingMethodId ||
      shippingLoadedFor !== country ||
      cartItems.length === 0
    ) return;
    let cancelled = false;
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: quoteRequestKey,
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? dict.couldNotQuote);
          setQuoteState(null);
          return;
        }
        setError(null);
        setQuoteState({ key: quoteRequestKey, value: data });
      })
      .catch(() => {
        if (!cancelled) {
          setError(dict.couldNotQuote);
          setQuoteState(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteRequestKey, shippingLoadedFor]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-foreground/70 text-sm">{dict.empty}</p>
        <Link href="/products" className="btn-secondary text-sm">
          {dict.continueShopping}
        </Link>
      </div>
    );
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
          giftCard: giftCard ?? undefined,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? dict.couldNotPlaceOrder);
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch {
      setError(dict.couldNotPlaceOrder);
      setSubmitting(false);
    }
  }

  function applyDiscountCode() {
    const nextCode = discountCodeInput.trim() || undefined;
    if (nextCode === appliedDiscountCode) return;
    setError(null);
    setAppliedDiscountCode(nextCode);
  }

  return (
    <div className="checkout-flow">
      {/* The wallet sheet can't carry a gift card's details. */}
      {!giftCard && (
        <ExpressCheckoutButton
          publishableKey={stripePublishableKey}
          locale={uiLocale}
          dividerLabel={expressCheckoutLabel}
          failureLabel={dict.couldNotPlaceOrder}
        />
      )}

      {/* Two columns on wide screens — the shopper's details on the left, the
          order set aside on the right, following them down — and one column on
          phones, where both wrappers dissolve (display: contents) so the summary
          can lead and the total and button close the page. See shop.css. */}
      <form ref={formRef} onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-main">
          {!isLoggedIn && (
            <div className="checkout-section checkout-email">
              <label className="flex flex-col gap-3">
                <span className="checkout-step">{dict.emailForUpdates}</span>
                <input
                  type="email"
                  inputMode="email"
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
            <p className="checkout-signed-in">
              {applyTemplate(dict.orderUpdatesTo, { email: userEmail })}
            </p>
          )}

          <fieldset className="checkout-section checkout-address flex flex-col gap-4">
            <legend className="checkout-step">{dict.shippingAddress}</legend>
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
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
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
              required
              autoComplete="country"
              aria-label={dict.country}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setShippingLoadedFor(null);
                setShippingMethods([]);
                setShippingMethodId("");
                setError(null);
              }}
              className="field"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {countryFlagEmoji(c)} {regionNames?.of(c) ?? c}
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
            <AddressCheck
              street={street}
              city={city}
              postalCode={postalCode}
              country={country}
              ready={street.trim().length >= 3 && city.trim().length >= 2 && postalCodeValid}
              dict={dict.addressCheck}
            />
          </fieldset>

          {shippingLoadedFor === country && shippingMethods.length === 0 && (
            <p role="alert" className="text-warning text-sm">
              {dict.noShippingMethods}
            </p>
          )}
          {country && shippingLoadedFor !== country && (
            <p role="status" aria-live="polite" className="text-foreground/60 text-sm">
              {quoteLoadingLabel}
            </p>
          )}
        </div>

        <div className="checkout-aside">
          <details open className="checkout-section checkout-summary">
            <summary>
              <span>{dict.orderSummary}</span>
              <span>({items.length})</span>
            </summary>
            <ul className="shop-list">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 p-4">
                  {item.imageUrl ? (
                    <span className="shop-thumb shop-thumb--cart">
                      <CatalogImage src={item.imageUrl} alt="" fill sizes="64px" />
                    </span>
                  ) : (
                    <span className="shop-thumb shop-thumb--cart" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="shop-line-name line-clamp-2">{item.name}</p>
                    <p className="text-foreground/70 mt-0.5 text-sm">
                      {formatMoney(item.price, item.currency, locale)} &times; {item.quantity}
                    </p>
                  </div>
                  <span className="shop-cart-total shrink-0">
                    {formatMoney(item.price * item.quantity, item.currency, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </details>

          {quote?.shippingAmount === 0 && (
            <p className="checkout-free-shipping">
              <span className="shop-check shop-settle" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {dict.freeShippingApplied}
            </p>
          )}

          <div className="checkout-section checkout-totals flex flex-col gap-4">
            <div className="checkout-discount flex gap-2">
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
                    applyDiscountCode();
                  }
                }}
                className="field flex-1 text-sm"
              />
              <button
                type="button"
                onClick={applyDiscountCode}
                className="btn-secondary shrink-0 text-sm"
              >
                {dict.apply}
              </button>
            </div>

            <div aria-live="polite" aria-busy={quoteLoading}>
              {quoteLoading && (
                <p role="status" className="text-foreground/60 py-2 text-sm">
                  {quoteLoadingLabel}
                </p>
              )}
              {quote && (
                <div className="checkout-lines animate-fade-up flex flex-col gap-1.5 text-sm tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">{dict.subtotal}</span>
                    <span>{formatMoney(quote.subtotal, quote.currency, locale)}</span>
                  </div>
                  {quote.giftCardAmount > 0 && giftCardOffer && (
                    <div className="text-foreground/70 flex justify-between">
                      <span>{giftCardOffer.productName}</span>
                      <span>{formatMoney(quote.giftCardAmount, quote.currency, locale)}</span>
                    </div>
                  )}
                  {quote.bundleDiscountAmount > 0 && (
                    <div className="text-success flex justify-between">
                      <span>{dict.bundleSaving}</span>
                      <span>-{formatMoney(quote.bundleDiscountAmount, quote.currency, locale)}</span>
                    </div>
                  )}
                  {quote.discountAmount > 0 && (
                    <div className="text-success flex justify-between">
                      <span>{dict.discount}</span>
                      <span>-{formatMoney(quote.discountAmount, quote.currency, locale)}</span>
                    </div>
                  )}
                  <div className="text-foreground/70 flex justify-between">
                    <span>
                      {dict.shipping}
                      {selectedShippingMethod ? ` (${selectedShippingMethod.name})` : ""}
                    </span>
                    <span>{formatMoney(quote.shippingAmount, quote.currency, locale)}</span>
                  </div>
                  {selectedShippingMethod && (
                    <p className="text-foreground/60 -mt-1 text-xs">
                      {applyTemplate(dict.days, {
                        min: String(selectedShippingMethod.estimatedDaysMin),
                        max: String(selectedShippingMethod.estimatedDaysMax),
                      })}
                      {shippingMethods.length === 1 ? ` · ${dict.onlyShippingMethod}` : ""}
                    </p>
                  )}
                  {/* Duties depend on the destination, not the shipping cost: the UK,
                      Switzerland and Norway ship free but are outside the EU customs union. */}
                  {country && !isEuCountry(country) && (
                    <p className="text-foreground/60 text-xs">{dict.importDutiesNotice}</p>
                  )}
                  <div className="text-foreground/70 flex justify-between">
                    <span>
                      {quote.pricesIncludeTax ? dict.includesVat : dict.vat}
                      {quote.taxRatePercent !== null ? ` (${quote.taxRatePercent}%)` : ""}
                    </span>
                    <span>{formatMoney(quote.taxAmount, quote.currency, locale)}</span>
                  </div>
                  {quote.missingTaxRule && <p className="text-warning">{dict.missingTaxRule}</p>}
                  <div className="checkout-grand-total flex justify-between">
                    <span>{dict.total}</span>
                    <span>{formatMoney(quote.total, quote.currency, locale)}</span>
                  </div>
                  {quote.giftCardAmount > 0 && giftCardOffer && (
                    <p className="checkout-gift-note">{giftCardOffer.printedNote}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <TurnstileWidget siteKey={turnstileSiteKey} nonce={nonce} />

          {error && <FormAlert type="error">{error}</FormAlert>}

          <p className="checkout-notice">
            {dict.withdrawalNotice}{" "}
            <Link href="/legal/returns" className="underline">
              {dict.returnPolicy}
            </Link>
            .
          </p>

          <div className="checkout-reassurance">
            <TrustBadges trustBadgeText={null} dict={trustLabels} />
            <div className="checkout-payment-marks">
              <PaymentIcons {...paymentMethods} labels={{ bankTransfer: bankTransferLabel }} />
            </div>
            <Link href="/contact" className="checkout-support-link">
              {supportLabel}
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting || quoteLoading || !quote}
            className="btn-primary checkout-submit"
          >
            {submitting ? dict.placingOrder : dict.continueToPayment}
          </button>
        </div>
      </form>
    </div>
  );
}
