import { describe, expect, it } from "vitest";
import {
  DELIVERY_MAX_DAYS,
  DELIVERY_MIN_DAYS,
  addDays,
  deliveryWindow,
  formatDeliveryWindow,
  shopDate,
} from "./delivery-estimate";

describe("addDays", () => {
  it("crosses a month end", () => {
    expect(addDays({ year: 2026, month: 1, day: 25 }, 14)).toEqual({ year: 2026, month: 2, day: 8 });
  });

  it("crosses a year end", () => {
    expect(addDays({ year: 2026, month: 12, day: 24 }, 14)).toEqual({ year: 2027, month: 1, day: 7 });
  });

  it("knows February in a leap year and in a common one", () => {
    expect(addDays({ year: 2028, month: 2, day: 20 }, 14)).toEqual({ year: 2028, month: 3, day: 5 });
    expect(addDays({ year: 2026, month: 2, day: 20 }, 14)).toEqual({ year: 2026, month: 3, day: 6 });
  });
});

describe("shopDate", () => {
  /* The civil date is the SHOP's, not the server's and not the visitor's. */
  it("is already tomorrow in Rome while it is still today in UTC", () => {
    // 1 Nov 2026 23:30 UTC is 00:30 on 2 Nov in Rome (UTC+1 in winter).
    expect(shopDate(new Date("2026-11-01T23:30:00Z"))).toEqual({
      year: 2026,
      month: 11,
      day: 2,
    });
  });

  it("is still the same day in Rome for a late-afternoon Californian", () => {
    // 1 Nov 2026 17:00 in Los Angeles = 2 Nov 01:00 in Rome.
    expect(shopDate(new Date("2026-11-02T01:00:00Z"))).toEqual({
      year: 2026,
      month: 11,
      day: 2,
    });
  });
});

describe("deliveryWindow", () => {
  it("is 14 to 26 days from the given date", () => {
    const w = deliveryWindow({ year: 2026, month: 3, day: 1 });
    expect(w.from).toEqual(addDays({ year: 2026, month: 3, day: 1 }, DELIVERY_MIN_DAYS));
    expect(w.to).toEqual(addDays({ year: 2026, month: 3, day: 1 }, DELIVERY_MAX_DAYS));
  });

  /* The window must not move because the clocks did. Both European DST
     switches fall inside a 26-day window started here. */
  it("is unaffected by the spring and autumn clock changes", () => {
    // Italy springs forward on 29 Mar 2026 and falls back on 25 Oct 2026.
    expect(deliveryWindow({ year: 2026, month: 3, day: 20 })).toEqual({
      from: { year: 2026, month: 4, day: 3 },
      to: { year: 2026, month: 4, day: 15 },
    });
    expect(deliveryWindow({ year: 2026, month: 10, day: 15 })).toEqual({
      from: { year: 2026, month: 10, day: 29 },
      to: { year: 2026, month: 11, day: 10 },
    });
  });

  it("uses a saved order date rather than today, so a confirmation never slides", () => {
    const ordered = new Date("2026-01-10T09:00:00Z");
    const a = deliveryWindow(ordered);
    const b = deliveryWindow(ordered);
    expect(a).toEqual(b);
    expect(a.from).toEqual({ year: 2026, month: 1, day: 24 });
  });
});

describe("formatDeliveryWindow", () => {
  it("collapses a shared month and keeps the day numbers", () => {
    const text = formatDeliveryWindow(
      { from: { year: 2026, month: 11, day: 3 }, to: { year: 2026, month: 11, day: 15 } },
      "en-GB"
    );
    expect(text).toMatch(/3/);
    expect(text).toMatch(/15/);
    expect(text).toMatch(/November/);
  });

  it("shows the year when the window crosses one", () => {
    const text = formatDeliveryWindow(
      { from: { year: 2026, month: 12, day: 28 }, to: { year: 2027, month: 1, day: 9 } },
      "en-GB"
    );
    expect(text).toMatch(/2026/);
    expect(text).toMatch(/2027/);
  });

  /* The date shown must be the civil date, never one shifted by formatting it
     in a timezone it was never in. */
  it("never shifts the day when formatting", () => {
    const text = formatDeliveryWindow(
      { from: { year: 2026, month: 10, day: 29 }, to: { year: 2026, month: 11, day: 10 } },
      "it-IT"
    );
    expect(text).toMatch(/29/);
    expect(text).toMatch(/10/);
  });
});
