import { describe, expect, it } from "vitest";
import { logoSrc } from "@/lib/store-settings";

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
