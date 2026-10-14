import { createElement as h, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), getAllLooks: vi.fn() }));
vi.mock("@/lib/require-admin", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/look-data", () => ({ getAllLooks: mocks.getAllLooks }));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({ defaultLocale: "it-IT" }),
}));
vi.mock("@/lib/i18n/locale", () => ({ getLocale: async () => "it" }));
vi.mock("@/components/shelf-main", () => ({
  ShelfMain: ({ children }: { children: ReactNode }) => h("div", null, children),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/settings/page-layout/looks-preview",
  useRouter: () => ({}),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => h("a", props, children),
}));
vi.mock("@/components/catalog-image", () => ({
  CatalogImage: ({ src, alt }: { src: string; alt: string }) => h("img", { src, alt }),
}));
import Page from "./page";
import { EDITORIAL_TEMPLATE_IDS } from "@/lib/look-templates";

// A complete catalog-shaped look: the same one appears in every style to
// catch duplicate heading IDs and inconsistent dispatch without needing a DB.
const look = {
  id: "look-test",
  name: "Rosa",
  imageUrl: null,
  discountPercent: 0,
  available: true,
  pricing: { setTotal: 6000, individualTotal: 6000 },
  pieces: ["necklace", "bracelet", "earrings"].map((kind) => ({
    kind,
    productId: kind,
    slug: kind,
    name: kind,
    price: 2000,
    currency: "EUR",
    imageUrl: `/products/${kind}.png`,
    imageAlt: kind,
    available: true,
  })),
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { role: "admin", mfaEnabled: true } });
  mocks.getAllLooks.mockResolvedValue([look]);
});

describe("editorial preview route", () => {
  it("renders every storefront composition with unique accessible titles and real links", async () => {
    const html = renderToStaticMarkup(await Page());
    expect(mocks.requireStaff).toHaveBeenCalledOnce();
    expect(mocks.getAllLooks).toHaveBeenCalledWith("it", 3);
    expect(html).toContain(`Compare all ${EDITORIAL_TEMPLATE_IDS.length + 1}`);
    for (const id of ["editorial", ...EDITORIAL_TEMPLATE_IDS]) {
      expect(html).toContain(`id="tpl-${id}"`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain('href="/looks/look-test"');
    expect(html).toContain('href="/products/earrings"');
    expect(html).not.toContain("15%");
    expect(html).not.toContain("<main");
    // Conditional layout classes must stay separate after Tailwind's formatter
    // runs, otherwise the lead necklace silently loses its responsive sizing.
    expect(html).toContain('class="look-jewelry-product look-jewelry-product--lead"');
    expect(html).toContain('class="look-tpl-plate look-tpl-plate--lead"');
  });

  it("shows a recoverable empty state instead of returning a 404", async () => {
    mocks.getAllLooks.mockResolvedValue([]);
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("No looks to preview yet");
    expect(html).toContain('href="/admin/looks"');
  });

  it("shows each product once and exactly one data-driven savings indicator per composition", async () => {
    mocks.getAllLooks.mockResolvedValue([
      { ...look, discountPercent: 15, pricing: { setTotal: 5100, individualTotal: 6000 } },
    ]);
    const html = renderToStaticMarkup(await Page());
    const articles = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
    expect(articles).toHaveLength(EDITORIAL_TEMPLATE_IDS.length + 1);
    for (const article of articles) {
      expect(article.match(/class="look-editorial-saving"/g)).toHaveLength(1);
      expect(article).toContain("51,00");
      expect(article).toContain("60,00");
      for (const piece of look.pieces) {
        expect(article.split(`src="${piece.imageUrl}"`)).toHaveLength(2);
        expect(article).toContain(`href="/products/${piece.slug}"`);
      }
    }
  });

  it("keeps every product accessible for a look with a single cover photo", async () => {
    mocks.getAllLooks.mockResolvedValue([{ ...look, imageUrl: "/looks/cover.png" }]);
    const html = renderToStaticMarkup(await Page());
    const articles = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
    for (const article of articles) {
      for (const piece of look.pieces) {
        expect(article).toContain(`href="/products/${piece.slug}"`);
      }
    }
    expect(html).not.toContain("look-tpl-cout-support");
    expect(html).toContain('class="look-tpl-cout-stage look-tpl-cout-stage--photo"');
  });

  it("checks staff access before loading catalog data", async () => {
    mocks.requireStaff.mockRejectedValueOnce(new Error("auth redirect"));
    await expect(Page()).rejects.toThrow("auth redirect");
    expect(mocks.getAllLooks).not.toHaveBeenCalled();
  });

  it("lets data failures reach the route error boundary", async () => {
    mocks.getAllLooks.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(Page()).rejects.toThrow("database unavailable");
  });
});
