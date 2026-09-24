import { describe, expect, it } from "vitest";
import { buildFooterNav } from "./footer-nav";
import { getDictionary } from "./i18n/dictionaries";

const nav = buildFooterNav({
  dict: getDictionary("en"),
  categories: [
    { slug: "bracciali", label: "Bracelets" },
    { slug: "collane", label: "Necklaces" },
  ],
  contactEmail: "shop@example.com",
});

const allHrefs = [
  ...nav.sections.flatMap((s) => s.links.map((l) => l.href)),
  ...nav.legal.map((l) => l.href),
];

describe("buildFooterNav", () => {
  it("keeps every link the old footer had", () => {
    for (const href of [
      "/products",
      "/category/bracciali",
      "/category/collane",
      "/contact",
      "/about",
      "/murano-glass",
      "/legal/returns",
      "/legal/terms",
      "/legal/privacy",
      "/legal/cookies",
      "mailto:shop@example.com",
    ]) {
      expect(allHrefs).toContain(href);
    }
  });

  it("lists each link once", () => {
    expect(new Set(allHrefs).size).toBe(allHrefs.length);
  });

  it("groups links into shop, about and customer care, with legal links separate", () => {
    expect(nav.sections.map((s) => s.id)).toEqual(["shop", "about", "care"]);
    expect(nav.legal.map((l) => l.href)).toEqual([
      "/legal/privacy",
      "/legal/terms",
      "/legal/cookies",
    ]);
  });
});
