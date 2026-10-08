import { describe, expect, it } from "vitest";
import { withCurrentLocale } from "./localized-href";

describe("withCurrentLocale", () => {
  it.each(["/admin", "/admin/settings", "/admin?tab=orders", "/admin#sales"])(
    "keeps admin links unlocalized: %s",
    (href) => expect(withCurrentLocale(href, "it")).toBe(href)
  );
  it("canonicalizes legacy localized admin links", () => {
    expect(withCurrentLocale("/it/admin/settings", "it")).toBe("/admin/settings");
  });
  it("continues localizing storefront links", () => {
    expect(withCurrentLocale("/account", "it")).toBe("/it/account");
    expect(withCurrentLocale("/administration", "it")).toBe("/it/administration");
    expect(withCurrentLocale("/en/products", "it")).toBe("/en/products");
    expect(withCurrentLocale("/products", null)).toBe("/products");
  });
  it.each(["https://example.com", "//example.com", "#section", "?page=2"])(
    "preserves non-route links: %s",
    (href) => expect(withCurrentLocale(href, "it")).toBe(href)
  );
});
