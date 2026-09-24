import { describe, expect, it } from "vitest";
import { bannerRates } from "./shipping-banner";

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
