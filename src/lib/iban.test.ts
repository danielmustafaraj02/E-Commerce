import { describe, expect, it } from "vitest";
import { formatIban, isValidBic, isValidIban, normalizeIban } from "./iban";

describe("isValidIban", () => {
  // Example IBANs published for each country's format.
  it.each([
    "IT60X0542811101000000123456",
    "DE89370400440532013000",
    "FR1420041010050500013M02606",
    "GB29NWBK60161331926819",
    "ES9121000418450200051332",
  ])("accepts %s", (iban) => {
    expect(isValidIban(iban)).toBe(true);
  });

  it("accepts spaces, dashes and lower case", () => {
    expect(isValidIban("it60 x054 2811 1010 0000 0123 456")).toBe(true);
    expect(isValidIban("DE89-3704-0044-0532-0130-00")).toBe(true);
  });

  it("rejects a single mistyped digit (checksum)", () => {
    expect(isValidIban("IT60X0542811101000000123457")).toBe(false);
    expect(isValidIban("DE89370400440532013001")).toBe(false);
  });

  it("rejects the wrong length for the country", () => {
    expect(isValidIban("IT60X054281110100000012345")).toBe(false); // one short
    expect(isValidIban("IT60X05428111010000001234567")).toBe(false); // one long
  });

  it("rejects things that are not IBANs", () => {
    for (const bad of ["", "12345", "IT", "not an iban", "6060X0542811101000000123456"]) {
      expect(isValidIban(bad)).toBe(false);
    }
  });
});

describe("normalizeIban / formatIban", () => {
  it("stores one canonical form and shows it in groups of four", () => {
    expect(normalizeIban(" it60 x054-2811 ")).toBe("IT60X0542811");
    expect(formatIban("IT60X0542811101000000123456")).toBe("IT60 X054 2811 1010 0000 0123 456");
  });
});

describe("isValidBic", () => {
  it("accepts 8 and 11 character codes", () => {
    expect(isValidBic("BCITITMM")).toBe(true);
    expect(isValidBic("deutdeff500")).toBe(true);
  });

  it("rejects malformed codes", () => {
    for (const bad of ["", "BCIT", "BCITIT", "BCITITMM1", "1234ITMM", "BCITITMM12"]) {
      expect(isValidBic(bad)).toBe(false);
    }
  });
});
