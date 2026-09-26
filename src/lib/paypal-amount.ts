// Kept separate from paypal.ts (which pulls in the DB-backed settings) so the
// amount check is a pure function that can be unit-tested on its own.
export type PaypalCapture = {
  status: string;
  purchase_units?: {
    payments?: {
      captures?: { status?: string; amount?: { currency_code?: string; value?: string } }[];
    };
  }[];
};

// Confirms PayPal actually took the amount we expect, in the expected
// currency — a COMPLETED status alone says nothing about *how much*. Sums
// every completed capture, since PayPal may split one order across several.
export function capturedAmountMatches(
  capture: PaypalCapture,
  expected: { totalCents: number; currency: string }
) {
  const captures = (capture.purchase_units ?? [])
    .flatMap((unit) => unit.payments?.captures ?? [])
    .filter((c) => c.status === "COMPLETED");
  if (captures.length === 0) return false;

  let totalCents = 0;
  for (const c of captures) {
    if (c.amount?.currency_code?.toUpperCase() !== expected.currency.toUpperCase()) return false;
    const value = Number(c.amount?.value);
    if (!Number.isFinite(value)) return false;
    totalCents += Math.round(value * 100);
  }
  return totalCents === expected.totalCents;
}
