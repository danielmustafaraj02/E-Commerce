import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ settings: vi.fn(), products: vi.fn() }));

vi.mock("@/lib/store-settings", () => ({ getStoreSettings: mocks.settings }));
vi.mock("@/lib/db", () => ({ db: { product: { findMany: mocks.products } } }));

import { GET } from "./route";

function product(overrides: Record<string, unknown> = {}) {
  return {
    sku: "BRAC-007",
    slug: "sage-gold-wrap-fec6dc",
    name: "Bracciale Avvolto Salvia e Oro",
    nameEn: "Sage & Gold Wrap Bracelet",
    description: "Italiano",
    descriptionEn: "A wraparound band of black and gold beads.",
    price: 4061,
    currency: "EUR",
    stockQty: 0,
    category: { name: "Bracciali", nameEn: "Bracelets" },
    images: [
      { url: "/products/main.png" },
      { url: "/products/detail.png" },
      { url: "https://cdn.test/worn.jpg" },
    ],
    ...overrides,
  };
}

async function feed(query = "?locale=en") {
  const res = await GET(new Request(`https://shop.test/api/feeds/google-merchant${query}`));
  return res.text();
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.settings.mockResolvedValue({
    storeName: "Perla Murano Glass",
    siteUrl: "https://shop.test",
  });
  mocks.products.mockResolvedValue([product()]);
});

describe("Google Merchant feed", () => {
  it("gives each item a descriptive title, not just the product name", async () => {
    expect(await feed()).toContain(
      "<title>Sage &amp; Gold Wrap Bracelet – Handmade Murano Glass Jewelry</title>"
    );
  });

  it("classifies the item in Google's taxonomy (escaping the ampersand)", async () => {
    expect(await feed()).toContain(
      "<g:google_product_category>Apparel &amp; Accessories &gt; Jewelry &gt; Bracelets</g:google_product_category>"
    );
  });

  it("lists extra photos as additional_image_link, all absolute", async () => {
    const xml = await feed();

    expect(xml).toContain("<g:image_link>https://shop.test/products/main.png</g:image_link>");
    expect(xml).toContain(
      "<g:additional_image_link>https://shop.test/products/detail.png</g:additional_image_link>"
    );
    expect(xml).toContain(
      "<g:additional_image_link>https://cdn.test/worn.jpg</g:additional_image_link>"
    );
  });

  it("asks the database for the main image plus up to 10 extras", async () => {
    await feed();

    expect(mocks.products.mock.calls[0][0].include.images.take).toBe(11);
  });

  it("uses the localized category as product_type and states the material", async () => {
    const xml = await feed();

    expect(xml).toContain("<g:product_type>Bracelets</g:product_type>");
    expect(xml).toContain("<g:material>Glass</g:material>");
  });

  it("omits google_product_category and material for a category it doesn't know, rather than guessing", async () => {
    mocks.products.mockResolvedValue([product({ category: { name: "Home Goods", nameEn: null } })]);
    const xml = await feed();

    expect(xml).not.toContain("google_product_category");
    expect(xml).not.toContain("<g:material>");
  });

  it("keeps availability honest and skips products with no image", async () => {
    mocks.products.mockResolvedValue([product(), product({ sku: "NOIMG", images: [] })]);
    const xml = await feed();

    expect(xml).toContain("<g:availability>out of stock</g:availability>");
    expect(xml).not.toContain("NOIMG");
  });

  it("resolves the store URL from NEXTAUTH_URL when the admin setting is empty", async () => {
    vi.stubEnv("NEXTAUTH_URL", "https://env.test");
    mocks.settings.mockResolvedValue({ storeName: "S", siteUrl: null });

    expect(await feed()).toContain("<link>https://env.test/products/sage-gold-wrap-fec6dc</link>");
    vi.unstubAllEnvs();
  });
});
