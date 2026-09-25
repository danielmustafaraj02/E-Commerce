import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  settings: vi.fn(),
  categories: vi.fn(),
  products: vi.fn(),
  legal: vi.fn(),
}));

vi.mock("@/lib/store-settings", () => ({ getStoreSettings: mocks.settings }));
vi.mock("@/lib/db", () => ({
  db: {
    category: { findMany: mocks.categories },
    product: { findMany: mocks.products },
    legalPage: { findMany: mocks.legal },
  },
}));

import { GET } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.settings.mockResolvedValue({
    storeName: "Perla Murano",
    siteUrl: "https://shop.test",
    metaDescription: "Handmade Murano glass jewelry.",
    contactEmail: "hello@shop.test",
    defaultCurrency: "EUR",
    pricesIncludeTax: true,
  });
  mocks.categories.mockResolvedValue([
    { name: "Bracciali", nameEn: "Bracelets", slug: "bracelets" },
  ]);
  mocks.products.mockResolvedValue([
    {
      slug: "azure-lagoon",
      name: "Bracciale Laguna Azzurra",
      nameEn: "Azure Lagoon Bracelet",
      description: "Italiano",
      descriptionEn: "Round aquamarine beads alternate with mottled turquoise beads.",
    },
  ]);
  mocks.legal.mockResolvedValue([{ slug: "returns", title: "Returns" }]);
});

describe("GET /llms.txt", () => {
  it("serves plain text in the llms.txt shape: H1, summary, linked sections", async () => {
    const res = await GET();
    const body = await res.text();

    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(body.startsWith("# Perla Murano\n\n> Handmade Murano glass jewelry.")).toBe(true);
    expect(body).toContain("## Shop");
    expect(body).toContain("- [Bracelets](https://shop.test/en/category/bracelets)");
    expect(body).toContain("- [Returns](https://shop.test/en/legal/returns)");
  });

  it("lists products with English names, absolute URLs and a short description", async () => {
    const body = await (await GET()).text();

    expect(body).toContain(
      "- [Azure Lagoon Bracelet](https://shop.test/en/products/azure-lagoon): Round aquamarine beads"
    );
    expect(body).not.toContain("Italiano");
  });

  it("only states VAT is included when the store's prices actually include it", async () => {
    mocks.settings.mockResolvedValue({
      storeName: "S",
      siteUrl: "https://shop.test",
      defaultCurrency: "EUR",
      pricesIncludeTax: false,
    });

    const body = await (await GET()).text();

    expect(body).toContain("Prices are shown in EUR.");
    expect(body).not.toContain("include VAT");
  });

  it("publishes only public catalog data: only active products are queried", async () => {
    await GET();

    expect(mocks.products.mock.calls[0][0].where).toEqual({ active: true });
  });
});
