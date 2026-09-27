// Kept separate from paypal.ts (which pulls in the DB-backed settings) so the
// amount check is a pure function that can be unit-tested on its own.
export type PaypalCapture = {
  status: string;
  purchase_units?: {
    payments?: {
      captures?: {
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }[];
    };
  }[];
};

export function capturedAmount(
  capture: PaypalCapture
): { amount: number; currency: string } | null {
  const captures = (capture.purchase_units ?? [])
    .flatMap((unit) => unit.payments?.captures ?? [])
    .filter((c) => c.status === "COMPLETED");
  if (captures.length === 0) return null;

  let amount = 0;
  const currency = captures[0]?.amount?.currency_code?.toUpperCase();
  if (!currency) return null;
  for (const item of captures) {
    if (item.amount?.currency_code?.toUpperCase() !== currency) return null;
    const value = Number(item.amount.value);
    if (!Number.isFinite(value)) return null;
    amount += Math.round(value * 100);
  }
  return { amount, currency };
}

// Confirms PayPal actually took the amount we expect, in the expected
// currency — a COMPLETED status alone says nothing about *how much*. Sums
// every completed capture, since PayPal may split one order across several.
export function capturedAmountMatches(
  capture: PaypalCapture,
  expected: { totalCents: number; currency: string }
) {
  const paid = capturedAmount(capture);
  return (
    paid !== null &&
    paid.amount === expected.totalCents &&
    paid.currency.toUpperCase() === expected.currency.toUpperCase()
  );
}
