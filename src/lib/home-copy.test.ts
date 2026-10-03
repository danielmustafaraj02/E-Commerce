import { describe, expect, it } from "vitest";
import { applyHomeCopy, parseHomeCopy } from "./home-copy";

describe("parseHomeCopy", () => {
  it("keeps known locales/keys, trims, drops empties and unknowns", () => {
    expect(
      parseHomeCopy({
        en: { "home.popularTitle": "  Our favourites ", "home.bogus": "x", "home.heroCta": "   " },
        xx: { "home.popularTitle": "no" },
      })
    ).toEqual({ en: { "home.popularTitle": "Our favourites" } });
  });
  it("tolerates garbage", () => {
    expect(parseHomeCopy(null)).toEqual({});
    expect(parseHomeCopy("x")).toEqual({});
  });
});

describe("applyHomeCopy", () => {
  const dict = { home: { popularTitle: "A", heroCta: "B" }, looks: { title: "L" } };
  it("overrides only listed keys without mutating", () => {
    const out = applyHomeCopy(dict, { "home.popularTitle": "Z" });
    expect(out.home).toEqual({ popularTitle: "Z", heroCta: "B" });
    expect(out.looks).toBe(dict.looks);
    expect(dict.home.popularTitle).toBe("A");
  });
  it("ignores keys the dictionary does not have", () => {
    expect(applyHomeCopy(dict, { "home.nope": "x" })).toEqual(dict);
  });
});
