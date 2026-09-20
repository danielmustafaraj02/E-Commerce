import { describe, expect, it } from "vitest";
import { parseConsent } from "./consent";

describe("parseConsent", () => {
  it("reads a valid choice", () => {
    expect(parseConsent('{"analytics":true,"marketing":false}')).toEqual({
      analytics: true,
      marketing: false,
    });
  });

  it("treats no stored choice as no consent", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("")).toBeNull();
  });

  it.each([
    ["malformed JSON", "{analytics:true"],
    ["not an object", "true"],
    ["missing a field", '{"analytics":true}'],
    ["string instead of boolean", '{"analytics":"true","marketing":false}'],
    ["a truthy non-boolean", '{"analytics":1,"marketing":0}'],
  ])("never mistakes %s for consent", (_label, raw) => {
    expect(parseConsent(raw)).toBeNull();
  });

  it("ignores unknown extra fields", () => {
    expect(parseConsent('{"analytics":false,"marketing":true,"x":1}')).toEqual({
      analytics: false,
      marketing: true,
    });
  });
});
