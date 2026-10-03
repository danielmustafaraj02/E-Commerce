import type { StripePaymentMethodId } from "@/lib/stripe";

// Generic, self-drawn "we accept" badges — not pixel-exact reproductions of
// any card network's registered mark, just the widely-recognized visual
// shorthand (interlocking circles for Mastercard, a blue card + wordmark for
// Visa, etc.) that essentially every storefront uses to signal accepted
// payment methods. No external logo assets, no third-party requests.

function Badge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className="border-foreground/10 bg-background flex h-7 w-11 shrink-0 items-center justify-center rounded border shadow-sm"
    >
      {children}
    </div>
  );
}

export function VisaIcon() {
  return (
    <div
      role="img"
      aria-label="Visa"
      title="Visa"
      className="flex h-7 w-11 shrink-0 items-center justify-center rounded bg-[#1434cb] shadow-sm"
    >
      <span className="text-[13px] font-bold tracking-tight text-white italic">VISA</span>
    </div>
  );
}

export function MastercardIcon() {
  return (
    <Badge label="Mastercard">
      <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true">
        <circle cx="11" cy="9" r="7" fill="#eb001b" />
        <circle cx="17" cy="9" r="7" fill="#f79e1b" style={{ mixBlendMode: "multiply" }} />
      </svg>
    </Badge>
  );
}

export function PayPalIcon() {
  // Not the generic Badge (h-7 w-11): "PayPal" is wider than the other
  // wordmarks at that box width and was wrapping/clipping inside it.
  return (
    <div
      role="img"
      aria-label="PayPal"
      title="PayPal"
      className="border-foreground/10 bg-background flex h-7 w-14 shrink-0 items-center justify-center rounded border shadow-sm"
    >
      <span className="text-[11px] font-bold whitespace-nowrap">
        <span className="text-[#003087]">Pay</span>
        <span className="text-[#0070ba]">Pal</span>
      </span>
    </div>
  );
}

export function KlarnaIcon() {
  return (
    <div
      role="img"
      aria-label="Klarna"
      title="Klarna"
      className="flex h-7 w-11 shrink-0 items-center justify-center rounded bg-[#ffb3c7] shadow-sm"
    >
      <span className="text-[11px] font-bold tracking-tight text-black">Klarna</span>
    </div>
  );
}

export function BankTransferIcon({ label }: { label: string }) {
  return (
    <Badge label={label}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/70"
        aria-hidden="true"
      >
        <path d="M3 10l9-6 9 6" />
        <path d="M5 10v8M10 10v8M14 10v8M19 10v8" />
        <path d="M3 21h18" />
      </svg>
    </Badge>
  );
}


// ── The Stripe-hosted methods (src/lib/stripe.ts getStripePaymentMethods) ──
// Same house rules as the marks above: drawn here in the brand's recognizable
// colour and wordmark shorthand, never a copy of the registered logo file, and
// never a request to a third-party CDN.

export function ApplePayIcon() {
  return (
    <div
      role="img"
      aria-label="Apple Pay"
      title="Apple Pay"
      className="flex h-7 w-14 shrink-0 items-center justify-center gap-0.5 rounded bg-black shadow-sm"
    >
      <svg width="10" height="12" viewBox="0 0 16 20" fill="white" aria-hidden="true">
        <path d="M11 3.2c.6-.75 1-1.76.9-2.8-.86.04-1.9.58-2.53 1.32-.56.65-1.05 1.7-.92 2.7.96.08 1.94-.49 2.55-1.22Zm.88 1.42c-1.4-.08-2.6.8-3.27.8-.68 0-1.7-.76-2.8-.74A4.13 4.13 0 0 0 2.3 6.8c-1.5 2.6-.39 6.45 1.07 8.57.71 1.03 1.57 2.19 2.7 2.15 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.67.7 2.81.68 1.16-.02 1.9-1.05 2.6-2.09.82-1.19 1.16-2.35 1.18-2.41-.03-.01-2.27-.87-2.29-3.45-.02-2.16 1.76-3.19 1.84-3.24-1-1.48-2.57-1.65-3.13-1.69Z" />
      </svg>
      <span className="text-[12px] font-medium text-white">Pay</span>
    </div>
  );
}

export function GooglePayIcon() {
  // Wider than the generic Badge (w-11 = 44px): "Google Pay" at 11px bold
  // needs ~64px to sit comfortably without clipping.
  return (
    <div
      role="img"
      aria-label="Google Pay"
      title="Google Pay"
      className="border-foreground/10 bg-background flex h-7 shrink-0 items-center justify-center rounded border shadow-sm px-2"
    >
      <span className="text-[11px] font-bold whitespace-nowrap">
        <span className="text-[#4285f4]">G</span>
        <span className="text-[#ea4335]">o</span>
        <span className="text-[#fbbc04]">o</span>
        <span className="text-[#4285f4]">g</span>
        <span className="text-[#34a853]">l</span>
        <span className="text-[#ea4335]">e</span>
        <span className="text-foreground/80"> Pay</span>
      </span>
    </div>
  );
}

export function AmazonPayIcon() {
  return (
    <div
      role="img"
      aria-label="Amazon Pay"
      title="Amazon Pay"
      className="border-foreground/10 flex h-7 w-14 shrink-0 flex-col items-center justify-center rounded border bg-[#ffd814] leading-none shadow-sm"
    >
      <span className="text-[9.5px] font-semibold whitespace-nowrap text-[#111]">amazon pay</span>
      <svg width="26" height="5" viewBox="0 0 40 8" aria-hidden="true" className="mt-px">
        <path d="M1 5c7 3.4 24 4.6 36-1" stroke="#ff9900" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function SatispayIcon() {
  return (
    <Badge label="Satispay">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.5 2.2 21.8 11a1.4 1.4 0 0 1 0 2L12.5 21.8a1 1 0 0 1-1.6-1l2.2-6.4a1 1 0 0 0-1-1.3H5.6a1 1 0 0 1-.7-1.7l6-8.3a1 1 0 0 1 1.6 0Z" fill="#f94d1e" />
      </svg>
    </Badge>
  );
}

export function MbWayIcon() {
  return (
    <div
      role="img"
      aria-label="MB WAY"
      title="MB WAY"
      className="border-foreground/10 bg-background flex h-7 w-14 shrink-0 flex-col items-center justify-center rounded border leading-none shadow-sm"
    >
      <span className="text-[10px] font-extrabold tracking-tight text-[#003b7e]">MB</span>
      <span className="text-[7.5px] font-bold tracking-[0.08em] text-[#e30613]">WAY</span>
    </div>
  );
}

export function BancontactIcon() {
  return (
    <Badge label="Bancontact">
      <svg width="30" height="14" viewBox="0 0 40 18" aria-hidden="true">
        <path d="M2 13.5 14 4.5h12l-12 9H2Z" fill="#005498" />
        <path d="M16 13.5 28 4.5h10l-12 9H16Z" fill="#ffd800" />
      </svg>
    </Badge>
  );
}

export function EpsIcon() {
  return (
    <Badge label="EPS">
      <span className="text-[11px] font-bold tracking-tight text-[#a4147a]">eps</span>
    </Badge>
  );
}

const STRIPE_BADGES: Record<StripePaymentMethodId, () => React.JSX.Element> = {
  klarna: KlarnaIcon,
  satispay: SatispayIcon,
  mbway: MbWayIcon,
  bancontact: BancontactIcon,
  eps: EpsIcon,
  amazonpay: AmazonPayIcon,
};

// The order the badges read in, most to least familiar, rather than whatever
// order Stripe happens to return its capabilities in.
const STRIPE_BADGE_ORDER: StripePaymentMethodId[] = [
  "klarna",
  "amazonpay",
  "satispay",
  "bancontact",
  "mbway",
  "eps",
];

export type AcceptedPayments = {
  cards: boolean;
  paypal: boolean;
  bankTransfer: boolean;
  /**
   * The methods actually active on the Stripe account — see
   * getStripePaymentMethods(). Omitted where the caller has no reason to ask
   * Stripe (it just means those badges aren't drawn).
   */
  stripeMethods?: StripePaymentMethodId[];
};

export function PaymentIcons({
  cards,
  paypal,
  bankTransfer,
  stripeMethods = [],
  labels,
}: AcceptedPayments & {
  // Accessible name for the icon that isn't a brand mark.
  labels: { bankTransfer: string };
}) {
  if (!cards && !paypal && !bankTransfer && stripeMethods.length === 0) return null;

  const stripeBadges = STRIPE_BADGE_ORDER.filter((id) => stripeMethods.includes(id));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cards && (
        <>
          <VisaIcon />
          <MastercardIcon />
          {/* The card wallets ride on card payments: Stripe offers them on
              their own devices wherever cards are accepted, and they have no
              capability of their own to check. */}
          <ApplePayIcon />
          <GooglePayIcon />
        </>
      )}
      {paypal && <PayPalIcon />}
      {stripeBadges.map((id) => {
        const Icon = STRIPE_BADGES[id];
        return <Icon key={id} />;
      })}
      {bankTransfer && <BankTransferIcon label={labels.bankTransfer} />}
    </div>
  );
}
