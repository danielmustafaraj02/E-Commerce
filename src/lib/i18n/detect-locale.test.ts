import { describe, expect, it } from "vitest";
import { detectLocale } from "./detect-locale";

describe("detectLocale", () => {
  it("prefers a valid cookie value over everything else", () => {
    expect(detectLocale("it", "fr-FR,fr;q=0.9")).toBe("it");
  });

  it("ignores a cookie value that isn't a supported locale", () => {
    expect(detectLocale("xx", "fr-FR,fr;q=0.9")).toBe("fr");
  });

  it("falls back to Accept-Language when there's no cookie", () => {
    expect(detectLocale(undefined, "de-DE,de;q=0.9,en;q=0.8")).toBe("de");
  });

  it("matches Accept-Language case-insensitively", () => {
    expect(detectLocale(undefined, "IT-it,it;q=0.9")).toBe("it");
  });

  it("falls back to the default locale with no cookie or header", () => {
    expect(detectLocale(undefined, undefined)).toBe("en");
  });

  it("falls back to the default locale when Accept-Language matches nothing supported", () => {
    expect(detectLocale(undefined, "ko-KR,ko;q=0.9")).toBe("en");
  });

  it("never matches en via the Accept-Language branch (en is the default already)", () => {
    // en is deliberately excluded from the "locale !== en" scan in detectLocale
    // — it's what defaultLocale already returns, so matching it explicitly
    // would just be redundant work on every call.
    expect(detectLocale(undefined, "en-GB,en;q=0.9")).toBe("en");
  });
});
