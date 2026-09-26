import { describe, expect, it } from "vitest";
import { headerLogoSrc, logoSrc } from "@/lib/store-settings";

describe("logoSrc", () => {
  it("uses the admin-configured logo when one is set", () => {
    expect(logoSrc("https://cdn.example.com/brand/logo.svg")).toBe(
      "https://cdn.example.com/brand/logo.svg"
    );
  });

  it("falls back to the bundled logo when none is configured", () => {
    expect(logoSrc(null)).toBe("/logo.png");
  });
});

describe("headerLogoSrc", () => {
  it("uses the light header copy of the bundled logo", () => {
    expect(headerLogoSrc(null)).toBe("/logo-header.webp");
    expect(headerLogoSrc("/logo.png")).toBe("/logo-header.webp");
  });

  it("uses an admin-uploaded logo as-is", () => {
    expect(headerLogoSrc("https://cdn.example.com/brand/logo.svg")).toBe(
      "https://cdn.example.com/brand/logo.svg"
    );
  });
});
