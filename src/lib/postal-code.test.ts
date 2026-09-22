import { describe, expect, it } from "vitest";
import { isValidPostalCode } from "./postal-code";

// Real-world examples per country, gating checkout on both
// src/app/api/checkout/route.ts and src/app/api/checkout/express/route.ts —
// a false rejection here blocks a paying customer at checkout.
describe("isValidPostalCode", () => {
  it.each([
    ["IT", "00100"],
    ["DE", "10115"],
    ["FR", "75001"],
    ["ES", "28001"],
    ["NL", "1234 AB"],
    ["NL", "1234AB"], // no space is also accepted
    ["BE", "1000"],
    ["AT", "1010"],
    ["CH", "8001"],
    ["PT", "1000-001"],
    ["US", "90210"],
    ["US", "90210-1234"], // ZIP+4
    ["CA", "K1A 0B1"],
    ["CA", "K1A0B1"], // no space is also accepted
    ["GB", "EC1A 1BB"],
    ["GB", "SW1A 1AA"],
    ["GB", "W1A 0AX"],
    ["AU", "2000"],
    ["JP", "100-0001"],
    ["JP", "1000001"], // no dash is also accepted
    ["PL", "00-001"],
    ["SE", "111 22"],
    ["DK", "1050"],
    ["NO", "0150"],
    ["FI", "00100"],
    ["CZ", "110 00"],
    ["GR", "104 31"],
  ])("accepts a real %s postal code %s", (country, code) => {
    expect(isValidPostalCode(country, code)).toBe(true);
  });

  it.each([
    ["IT", "0010"], // too short
    ["DE", "abcde"], // letters where digits are required
    ["NL", "1234"], // missing the two letters
    ["PT", "1000001"], // missing the dash
    ["US", "9021"], // too short
    ["CA", "123456"], // wrong letter/digit layout
    ["GB", "12345"], // digits only isn't a UK postcode
    ["JP", "10000"], // wrong digit grouping
    ["PL", "00001"], // missing the dash
  ])("rejects a malformed %s postal code %s", (country, code) => {
    expect(isValidPostalCode(country, code)).toBe(false);
  });

  it("is case-insensitive on the country code", () => {
    expect(isValidPostalCode("gb", "SW1A 1AA")).toBe(true);
    expect(isValidPostalCode("Gb", "SW1A 1AA")).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidPostalCode("IT", "  00100  ")).toBe(true);
  });

  it("rejects empty or whitespace-only input", () => {
    expect(isValidPostalCode("IT", "")).toBe(false);
    expect(isValidPostalCode("IT", "   ")).toBe(false);
  });

  it("falls back to a permissive generic pattern for countries without a rule", () => {
    expect(isValidPostalCode("IE", "D02 AF30")).toBe(true); // Irish Eircode
    expect(isValidPostalCode("XX", "AB")).toBe(true);
  });

  it("still rejects garbage under the generic fallback", () => {
    expect(isValidPostalCode("IE", "a")).toBe(false); // below the 2-char minimum
    expect(isValidPostalCode("IE", "this is way too long")).toBe(false);
    expect(isValidPostalCode("IE", "no@symbols!")).toBe(false);
  });
});
