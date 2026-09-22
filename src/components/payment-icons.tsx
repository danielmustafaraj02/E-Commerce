// Generic, self-drawn "we accept" badges — not pixel-exact reproductions of
// any card network's registered mark, just the widely-recognized visual
// shorthand (interlocking circles for Mastercard, a blue card + wordmark for
// Visa, etc.) that essentially every storefront uses to signal accepted
// payment methods. No external logo assets, no third-party requests.

function Badge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
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

export function PaymentIcons({
  cards,
  paypal,
  klarna,
  bankTransfer,
  labels,
}: {
  cards: boolean;
  paypal: boolean;
  klarna?: boolean;
  bankTransfer: boolean;
  // Accessible name for the icon that isn't a brand mark.
  labels: { bankTransfer: string };
}) {
  if (!cards && !paypal && !klarna && !bankTransfer) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cards && (
        <>
          <VisaIcon />
          <MastercardIcon />
        </>
      )}
      {paypal && <PayPalIcon />}
      {klarna && <KlarnaIcon />}
      {bankTransfer && <BankTransferIcon label={labels.bankTransfer} />}
    </div>
  );
}
