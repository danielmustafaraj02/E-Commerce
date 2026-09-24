import { describe, expect, it } from "vitest";
import { ALL_COUNTRIES, EU_COUNTRIES, isEuCountry } from "../src/lib/countries";
import { EXCLUDED_COUNTRIES, defaultTaxRule, shippingZonePlan } from "./shipping-zones";

describe("country lists", () => {
  it("has the 27 EU members, all within the full list, without duplicates", () => {
    expect(new Set(EU_COUNTRIES).size).toBe(27);
    expect(new Set(ALL_COUNTRIES).size).toBe(ALL_COUNTRIES.length);
    for (const c of EU_COUNTRIES) expect(ALL_COUNTRIES).toContain(c);
  });

  it("treats the UK, Switzerland and Norway as outside the EU", () => {
    expect(isEuCountry("it")).toBe(true);
    for (const c of ["GB", "CH", "NO", "US"]) expect(isEuCountry(c)).toBe(false);
  });
});

describe("shippingZonePlan", () => {
  const plan = shippingZonePlan();
  const [northAmerica, rest] = plan.paid;

  it("puts every country in exactly one zone, apart from the excluded ones", () => {
    const all = [...plan.europe, ...northAmerica.countries, ...rest.countries];
    expect(new Set(all).size).toBe(all.length);
    expect(new Set([...all, ...EXCLUDED_COUNTRIES])).toEqual(new Set(ALL_COUNTRIES));
  });

  it("ships free to the UK, Switzerland and Norway, €30 to the USA/Canada, €40 elsewhere", () => {
    expect(plan.europe).toEqual(expect.arrayContaining(["IT", "GB", "CH", "NO"]));
    expect(northAmerica).toMatchObject({ countries: ["US", "CA"], method: { basePrice: 3000 } });
    expect(rest.method.basePrice).toBe(4000);
    expect(rest.countries).toEqual(expect.arrayContaining(["AU", "JP", "BR"]));
  });
});

describe("defaultTaxRule", () => {
  it("charges Italian VAT inside the EU and none on exports", () => {
    expect(defaultTaxRule("BE", 22).ratePercent).toBe(22);
    expect(defaultTaxRule("CH", 22).ratePercent).toBe(0);
    expect(defaultTaxRule("US", 22).ratePercent).toBe(0);
  });
});
