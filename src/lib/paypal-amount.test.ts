import { describe, expect, it } from "vitest";
import { capturedAmountMatches, type PaypalCapture } from "./paypal-amount";

function capture(
  captures: { status?: string; currency_code?: string; value?: string }[]
): PaypalCapture {
  return {
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: captures.map((c) => ({
            status: c.status ?? "COMPLETED",
            amount: { currency_code: c.currency_code ?? "EUR", value: c.value },
          })),
        },
      },
    ],
  };
}

const expected = { totalCents: 5167, currency: "EUR" };

describe("capturedAmountMatches", () => {
  it("accepts a capture for exactly the order total", () => {
    expect(capturedAmountMatches(capture([{ value: "51.67" }]), expected)).toBe(true);
  });

  it("rejects a capture for less than the order total", () => {
    expect(capturedAmountMatches(capture([{ value: "1.00" }]), expected)).toBe(false);
  });

  it("rejects a capture in the wrong currency", () => {
    expect(
      capturedAmountMatches(capture([{ value: "51.67", currency_code: "USD" }]), expected)
    ).toBe(false);
  });

  it("sums split captures and ignores ones that did not complete", () => {
    const split = capture([
      { value: "20.00" },
      { value: "31.67" },
      { value: "100.00", status: "DECLINED" },
    ]);
    expect(capturedAmountMatches(split, expected)).toBe(true);
  });

  it("rejects a response with no completed capture", () => {
    expect(capturedAmountMatches({ status: "COMPLETED" }, expected)).toBe(false);
    expect(capturedAmountMatches(capture([{ value: "51.67", status: "PENDING" }]), expected)).toBe(
      false
    );
  });

  it("rejects a malformed amount", () => {
    expect(capturedAmountMatches(capture([{ value: "abc" }]), expected)).toBe(false);
    expect(capturedAmountMatches(capture([{}]), expected)).toBe(false);
  });
});
