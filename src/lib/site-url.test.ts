import { afterEach, describe, expect, it, vi } from "vitest";
import { siteBaseUrl } from "./site-url";

afterEach(() => vi.unstubAllEnvs());

describe("siteBaseUrl", () => {
  it("prefers the admin setting", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://env.test");
    expect(siteBaseUrl({ siteUrl: "https://shop.test" })).toBe("https://shop.test");
  });

  it("falls back to NEXTAUTH_URL when the setting is empty (the production case)", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://env.test");
    expect(siteBaseUrl({ siteUrl: null })).toBe("https://env.test");
    expect(siteBaseUrl({ siteUrl: "" })).toBe("https://env.test");
  });

  it("falls back to localhost when neither is set, never to an empty string", () => {
    vi.stubEnv("NEXTAUTH_URL", "");
    expect(siteBaseUrl({ siteUrl: null })).toBe("http://localhost:3000");
  });

  it("strips trailing slashes so callers can append a path", () => {
    expect(siteBaseUrl({ siteUrl: "https://shop.test//" })).toBe("https://shop.test");
  });
});
