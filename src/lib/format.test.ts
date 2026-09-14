import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

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
