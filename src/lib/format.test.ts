import { describe, expect, it } from "vitest";
import { formatMoney, formatDiscountPercent } from "./format";

describe("formatMoney", () => {
  it("converts cents to a major-unit currency string", () => {
    expect(formatMoney(1999, "EUR", "en-US")).toBe("€19.99");
  });

  it("handles zero", () => {
    expect(formatMoney(0, "EUR", "en-US")).toBe("€0.00");
  });

  it("respects the given locale's formatting conventions", () => {
    // Italian locale uses a comma decimal separator.
    expect(formatMoney(1999, "EUR", "it-IT")).toBe("19,99 €");
  });
});

describe("formatDiscountPercent", () => {
  it("computes the real percentage off from the two prices, rounded to a whole number", () => {
    expect(formatDiscountPercent(6900, 8900, "en-US")).toBe("-22%");
  });

  it("respects the given locale's formatting conventions", () => {
    expect(formatDiscountPercent(6900, 8900, "it-IT")).toBe("-22%");
  });

  it("is invariant to the currency's minor unit (cents vs. whole)", () => {
    expect(formatDiscountPercent(69, 89, "en-US")).toBe("-22%");
  });
});
