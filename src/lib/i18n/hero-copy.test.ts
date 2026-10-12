import { describe, expect, it } from "vitest";
import { getDictionary } from "./dictionaries";
import { locales } from "./locale-constants";

// The mobile hero is headline + one short sentence + one CTA, sized to fit a
// 375px screen without pushing the next section far below the fold.
describe("mobile hero copy", () => {
  for (const locale of locales) {
    const dict = getDictionary(locale);
    it(`is short enough for a phone in ${locale}`, () => {
      expect(dict.home.heroTagline.length).toBeGreaterThan(0);
      expect(dict.home.heroTagline.length).toBeLessThanOrEqual(30);
      expect(dict.home.heroMobileLede.length).toBeLessThanOrEqual(70);
      expect(dict.home.heroMobileLede).not.toContain(" — ");
      expect(dict.home.shopCollection.length).toBeLessThanOrEqual(24);
    });
  }

  it("says Murano glass, made by hand, in English", () => {
    expect(getDictionary("en").home.heroTagline).toBe("Murano glass, worn every day");
    expect(getDictionary("en").home.shopCollection).toBe("Shop Collection");
  });
});
