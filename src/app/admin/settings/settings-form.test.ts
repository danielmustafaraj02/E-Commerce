import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("./actions", () => ({ updateStoreSettings: vi.fn() }));
vi.mock("@/components/form-alert", () => ({ FormAlert: () => null }));
vi.mock("next/link", async () => {
  const { createElement: h } = await import("react");
  return {
    default: ({ href, children }: { href: string; children: React.ReactNode }) =>
      h("a", { href }, children),
  };
});

import { SettingsForm } from "./settings-form";

const base = {
  storeName: "Perla",
  logoUrl: null,
  primaryColor: "#123D43",
  secondaryColor: "#4F46E5",
  defaultCurrency: "EUR",
  defaultLocale: "it-IT",
  contactEmail: "info@example.com",
  vatNumber: null,
  companyLegalName: null,
  companyAddress: null,
  pricesIncludeTax: true,
  freeShippingThreshold: null,
  trustBadgeText: null,
  showTestimonials: true,
  giftCardEnabled: false,
  giftCardPrice: 500,
  siteUrl: null,
  metaDescription: null,
  ogImageUrl: null,
  googleSiteVerification: null,
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  tiktokUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
};

const pieces = [
  { id: "p1", name: "Ruby Necklace" },
  { id: "p2", name: "Onyx Earrings" },
];
const titles = ["Craft", "Unique", "Heritage"];

function selects(settings: Record<string, unknown>) {
  const html = renderToStaticMarkup(
    createElement(SettingsForm, {
      settings: settings as Parameters<typeof SettingsForm>[0]["settings"],
      reasonPieces: pieces,
      reasonTitles: titles,
    })
  );
  // Each <select name="muranoReasonProductIds"> in row order.
  return html
    .split("<select")
    .slice(1)
    .map((chunk) => chunk.split("</select>")[0])
    .filter((chunk) => chunk.includes('name="muranoReasonProductIds"'));
}

describe("SettingsForm: why-Murano pieces", () => {
  it("has one select per reason, Automatic first, then every piece", () => {
    const rows = selects({ ...base, muranoReasonProductIds: [] });
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.indexOf("Automatic")).toBeGreaterThan(-1);
      expect(row.indexOf("Automatic")).toBeLessThan(row.indexOf("Ruby Necklace"));
      expect(row).toContain("Onyx Earrings");
    }
  });

  it("shows the stored piece selected in its own row", () => {
    const rows = selects({ ...base, muranoReasonProductIds: ["", "p2", "p1"] });
    expect(rows[0]).not.toMatch(/value="p\d"[^>]*selected/);
    expect(rows[1]).toMatch(/<option value="p2"[^>]*selected/);
    expect(rows[2]).toMatch(/<option value="p1"[^>]*selected/);
  });

  it("still renders when the setting is missing (before its migration is applied)", () => {
    expect(() => selects({ ...base })).not.toThrow();
    expect(selects({ ...base })).toHaveLength(3);
  });
});
