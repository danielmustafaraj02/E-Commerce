import { describe, expect, it } from "vitest";
import { bannerRates, shippingDays } from "./shipping-banner";

const zone = (countries: string[], prices: number[], active = true) => ({
  countries: countries.map((country) => ({ country })),
  methods: prices.map((basePrice) => ({ method: { basePrice, active } })),
});

describe("bannerRates", () => {
  it("takes the cheapest active method of each zone", () => {
    const zones = [zone(["IT"], [0, 1500]), zone(["US"], [3000, 5000]), zone(["JP"], [4000])];
    expect(bannerRates(zones)).toEqual({ northAmerica: 3000, rest: 4000 });
  });

  it("is null (banner hidden) when a region has no zone, as in production before setup", () => {
    expect(bannerRates([zone(["IT"], [0])])).toBeNull();
  });

  it("is null when shipping within Europe isn't free", () => {
    const zones = [zone(["IT"], [900]), zone(["US"], [3000]), zone(["JP"], [4000])];
    expect(bannerRates(zones)).toBeNull();
  });

  it("ignores inactive methods", () => {
    const zones = [zone(["IT"], [0]), zone(["US"], [3000], false), zone(["JP"], [4000])];
    expect(bannerRates(zones)).toBeNull();
  });
});

describe("shippingDays", () => {
  const method = (basePrice: number, min: number, max: number, active = true) => ({
    method: { basePrice, active, estimatedDaysMin: min, estimatedDaysMax: max },
  });
  const zone = (countries: string[], methods: ReturnType<typeof method>[]) => ({
    countries: countries.map((country) => ({ country })),
    methods,
  });

  it("quotes the standard (cheapest, then slowest) method per region", () => {
    const zones = [
      zone(["IT"], [method(0, 1, 2), method(0, 3, 5)]),
      zone(["US"], [method(3000, 5, 10)]),
      zone(["JP"], [method(4000, 7, 15), method(2000, 10, 20, false)]),
    ];
    expect(shippingDays(zones)).toEqual({ europe: "3–5", northAmerica: "5–10", rest: "7–15" });
  });

  it("is null for a region without an active method", () => {
    expect(shippingDays([zone(["IT"], [method(0, 3, 5)])])).toBeNull();
  });

  it("shows a single number when min and max match", () => {
    const zones = [
      zone(["IT"], [method(0, 2, 2)]),
      zone(["US"], [method(3000, 5, 10)]),
      zone(["JP"], [method(4000, 7, 15)]),
    ];
    expect(shippingDays(zones)?.europe).toBe("2");
  });
});
