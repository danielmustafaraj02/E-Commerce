import { describe, expect, it } from "vitest";
import { compareAtPriceError, omnibusReferencePrice } from "./price-history";

const day = (n: number) => new Date(Date.UTC(2026, 8, 1) + n * 86_400_000);

describe("omnibusReferencePrice", () => {
  it("is null when the price has never changed", () => {
    expect(omnibusReferencePrice([])).toBeNull();
    expect(omnibusReferencePrice([{ price: 8900, changedAt: day(0) }])).toBeNull();
  });

  it("is the lowest price in the 30 days before the current price took effect", () => {
    const history = [
      { price: 9900, changedAt: day(0) },
      { price: 7900, changedAt: day(40) },
      { price: 8900, changedAt: day(50) },
      { price: 6900, changedAt: day(60) },
    ];
    // Window is day 30–60: 9900 (until day 40), 7900, 8900.
    expect(omnibusReferencePrice(history)).toBe(7900);
  });

  it("counts a price that was set before the window but still in effect during it", () => {
    const history = [
      { price: 8900, changedAt: day(0) },
      { price: 6900, changedAt: day(100) },
    ];
    expect(omnibusReferencePrice(history)).toBe(8900);
  });

  it("ignores prices that ended before the window", () => {
    const history = [
      { price: 5900, changedAt: day(0) },
      { price: 8900, changedAt: day(10) },
      { price: 6900, changedAt: day(100) },
    ];
    expect(omnibusReferencePrice(history)).toBe(8900);
  });

  it("does not depend on the order the history is given in", () => {
    const history = [
      { price: 6900, changedAt: day(100) },
      { price: 8900, changedAt: day(0) },
    ];
    expect(omnibusReferencePrice(history)).toBe(8900);
  });
});

describe("compareAtPriceError", () => {
  const now = day(100);
  const history = [{ price: 8900, changedAt: day(0) }];

  it("accepts the lowest recent price as the compare-at price for a new reduction", () => {
    expect(
      compareAtPriceError({ price: 6900, compareAtPrice: 8900, currency: "EUR", history, now })
    ).toBeNull();
  });

  it("rejects a compare-at price above the lowest price of the last 30 days", () => {
    expect(
      compareAtPriceError({ price: 6900, compareAtPrice: 9900, currency: "EUR", history, now })
    ).toMatch(/at most €89\.00/);
  });

  it("rejects a compare-at price that isn't above the price", () => {
    expect(
      compareAtPriceError({ price: 8900, compareAtPrice: 8900, currency: "EUR", history, now })
    ).toMatch(/higher than the price/);
  });

  it("rejects a discount when the price has never been higher", () => {
    expect(
      compareAtPriceError({ price: 8900, compareAtPrice: 9900, currency: "EUR", history, now })
    ).toMatch(/hasn't been reduced/);
    expect(
      compareAtPriceError({ price: 8900, compareAtPrice: 9900, currency: "EUR", history: [], now })
    ).toMatch(/hasn't been reduced/);
  });

  it("checks a later cut against the whole reduction so far, not the original price", () => {
    // 89 → 69 on day 100, → 59 on day 110: the last 30 days include 69.
    const cut = [...history, { price: 6900, changedAt: day(100) }];
    expect(
      compareAtPriceError({
        price: 5900,
        compareAtPrice: 8900,
        currency: "EUR",
        history: cut,
        now: day(110),
      })
    ).toMatch(/at most €69\.00/);
  });

  it("keeps an existing discount valid when other fields are edited later", () => {
    const reduced = [...history, { price: 6900, changedAt: day(100) }];
    expect(
      compareAtPriceError({
        price: 6900,
        compareAtPrice: 8900,
        currency: "EUR",
        history: reduced,
        now: day(115),
      })
    ).toBeNull();
  });
});
