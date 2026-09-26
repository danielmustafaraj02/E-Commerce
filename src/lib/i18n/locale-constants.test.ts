import { describe, expect, it } from "vitest";
import { splitLocalePrefix, localeDir } from "./locale-constants";

describe("splitLocalePrefix", () => {
  it("splits a locale-prefixed nested path", () => {
    expect(splitLocalePrefix("/it/products/collana-rubino")).toEqual({
      locale: "it",
      rest: "/products/collana-rubino",
    });
  });

  it("splits a bare locale-root path to /", () => {
    expect(splitLocalePrefix("/it")).toEqual({ locale: "it", rest: "/" });
  });

  it("splits a locale-root path with a trailing slash", () => {
    expect(splitLocalePrefix("/en/")).toEqual({ locale: "en", rest: "/" });
  });

  it("does not match a path that merely starts with a locale-looking word", () => {
    // "/italy-guide" must not be treated as locale "it" + rest "aly-guide"
    expect(splitLocalePrefix("/italy-guide")).toEqual({ locale: null, rest: "/italy-guide" });
  });

  it("does not match an unprefixed path", () => {
    expect(splitLocalePrefix("/products/foo")).toEqual({ locale: null, rest: "/products/foo" });
  });

  it("does not match the bare root", () => {
    expect(splitLocalePrefix("/")).toEqual({ locale: null, rest: "/" });
  });

  it("does not match an unlocalized admin path", () => {
    expect(splitLocalePrefix("/admin/orders")).toEqual({ locale: null, rest: "/admin/orders" });
  });
});

describe("localeDir", () => {
  it("is rtl only for Arabic", () => {
    expect(localeDir("ar")).toBe("rtl");
    expect(localeDir("en")).toBe("ltr");
    expect(localeDir("it")).toBe("ltr");
  });
});
