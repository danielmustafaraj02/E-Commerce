import { describe, expect, it } from "vitest";
import {
  EU_WITHDRAWAL_DAYS,
  buildReturnPolicy,
  buildShippingDetails,
  type ShippingZoneInput,
} from "./offer-json-ld";

const method = (overrides = {}) => ({
  active: true,
  basePrice: 590,
  estimatedDaysMin: 3,
  estimatedDaysMax: 5,
  ...overrides,
});
const zone = (countries: string[], methods = [method()]): ShippingZoneInput => ({
  countries: countries.map((country) => ({ country })),
  methods: methods.map((m) => ({ method: m })),
});
const opts = { priceCents: 4500, currency: "EUR", freeShippingThresholdCents: 10000 };

describe("buildShippingDetails", () => {
  it("prices each zone at its cheapest active method and lists its countries and transit time", () => {
    const details = buildShippingDetails(
      [zone(["IT", "SM"], [method({ basePrice: 1200 }), method({ basePrice: 490 })])],
      opts
    )!;

    expect(details).toHaveLength(1);
    expect(details[0].shippingRate).toEqual({
      "@type": "MonetaryAmount",
      value: "4.90",
      currency: "EUR",
    });
    expect(details[0].shippingDestination.map((d) => d.addressCountry)).toEqual(["IT", "SM"]);
    expect(details[0].deliveryTime.transitTime).toMatchObject({
      minValue: 3,
      maxValue: 5,
      unitCode: "DAY",
    });
  });

  it("ignores inactive methods", () => {
    const details = buildShippingDetails(
      [zone(["IT"], [method({ basePrice: 100, active: false }), method({ basePrice: 800 })])],
      opts
    )!;

    expect(details[0].shippingRate.value).toBe("8.00");
  });

  it("quotes free shipping when the product alone reaches the free-shipping threshold", () => {
    const details = buildShippingDetails([zone(["IT"])], { ...opts, priceCents: 12000 })!;

    expect(details[0].shippingRate.value).toBe("0.00");
  });

  it("never advertises free shipping when no threshold is configured", () => {
    const details = buildShippingDetails([zone(["IT"])], {
      ...opts,
      priceCents: 999999,
      freeShippingThresholdCents: null,
    })!;

    expect(details[0].shippingRate.value).toBe("5.90");
  });

  it("emits one entry per usable zone and skips zones with no countries or no active method", () => {
    const details = buildShippingDetails(
      [zone(["IT"]), zone([]), zone(["DE"], [method({ active: false })]), zone(["FR"])],
      opts
    )!;

    expect(details.map((d) => d.shippingDestination[0].addressCountry)).toEqual(["IT", "FR"]);
  });

  it("returns nothing when there is nothing to advertise", () => {
    expect(buildShippingDetails([], opts)).toBeUndefined();
    expect(buildShippingDetails([zone([])], opts)).toBeUndefined();
  });
});

describe("buildReturnPolicy", () => {
  it("covers every shipped-to country once, with the withdrawal window", () => {
    const policy = buildReturnPolicy([zone(["IT", "DE"]), zone(["DE", "FR"])], {
      returnPolicyUrl: "https://shop.test/legal/returns",
    })!;

    expect(policy.applicableCountry).toEqual(["IT", "DE", "FR"]);
    expect(policy.merchantReturnDays).toBe(EU_WITHDRAWAL_DAYS);
    expect(policy.returnPolicyCategory).toBe("https://schema.org/MerchantReturnFiniteReturnWindow");
    expect(policy.merchantReturnLink).toBe("https://shop.test/legal/returns");
  });

  it("does not claim who pays for return shipping", () => {
    const policy = buildReturnPolicy([zone(["IT"])])!;

    expect(policy).not.toHaveProperty("returnFees");
    expect(policy).not.toHaveProperty("merchantReturnLink");
  });

  it("returns nothing when the store ships nowhere", () => {
    expect(buildReturnPolicy([])).toBeUndefined();
  });
});
