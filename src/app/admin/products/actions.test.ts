import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  priceHistory: vi.fn(),
  requireStaff: vi.fn(),
  writeAuditLog: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      create: mocks.create,
      update: mocks.update,
      findUnique: mocks.findUnique,
    },
    productPriceChange: { findMany: mocks.priceHistory },
  },
}));
vi.mock("@/lib/require-admin", () => ({
  requireStaff: mocks.requireStaff,
  requireAdmin: vi.fn(),
}));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import { createProduct, updateProduct } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  data.set("name", "Collana Fiore");
  data.set("slug", "collana-fiore");
  data.set("description", "Una collana artigianale.");
  data.set("price", "89");
  data.set("sku", "SKU-1");
  data.set("stockQty", "5");
  data.set("lowStockThreshold", "2");
  data.set("active", "on");
  data.set("trackInventory", "on");
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { id: "staff1" } });
  mocks.create.mockResolvedValue({ id: "p1" });
  mocks.findUnique.mockResolvedValue({ id: "p1", name: "Collana Fiore", currency: "EUR" });
  // Priced at €89 for the last 60 days.
  mocks.priceHistory.mockResolvedValue([
    { price: 8900, changedAt: new Date(Date.now() - 60 * 86_400_000) },
  ]);
  mocks.update.mockResolvedValue({ id: "p1" });
});

describe("createProduct compareAtPrice", () => {
  it("refuses a compare-at price, since a new product has no earlier price", async () => {
    const result = await createProduct(null, form({ compareAtPrice: "99" }));

    expect(result).toEqual({ error: expect.stringMatching(/Omnibus/) });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("leaves compareAtPrice unset when left blank", async () => {
    await expect(createProduct(null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.create.mock.calls[0][0].data.compareAtPrice).toBeUndefined();
  });
});

describe("updateProduct compareAtPrice", () => {
  it("stores the earlier price in cents when the price is reduced in the same save", async () => {
    await expect(
      updateProduct("p1", null, form({ price: "69", compareAtPrice: "89" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.priceHistory).toHaveBeenCalledWith(
      expect.objectContaining({ where: { productId: "p1" } })
    );
    expect(mocks.update.mock.calls[0][0].data.compareAtPrice).toBe(8900);
  });

  it("refuses a compare-at price above the lowest price of the last 30 days", async () => {
    const result = await updateProduct("p1", null, form({ price: "69", compareAtPrice: "99" }));

    expect(result).toEqual({ error: expect.stringMatching(/at most €89\.00/) });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("refuses a compare-at price when the price hasn't been reduced", async () => {
    const result = await updateProduct("p1", null, form({ compareAtPrice: "99" }));

    expect(result).toEqual({ error: expect.stringMatching(/hasn't been reduced/) });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("clears compareAtPrice (sets null, not undefined) when the field is left blank", async () => {
    await expect(updateProduct("p1", null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update.mock.calls[0][0].data.compareAtPrice).toBeNull();
  });
});

function formWithGiftTags(fields: Record<string, string>, checkboxes: Record<string, string[]>) {
  const data = form(fields);
  for (const [key, values] of Object.entries(checkboxes)) {
    data.delete(key);
    for (const value of values) data.append(key, value);
  }
  return data;
}

describe("createProduct gift metadata", () => {
  it("stores the checked gift style/occasion/recipient values", async () => {
    await expect(
      createProduct(
        null,
        formWithGiftTags(
          {},
          {
            giftStyles: ["elegant", "romantic"],
            giftOccasions: ["birthday"],
            giftRecipients: ["partner", "myself"],
          }
        )
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    const data = mocks.create.mock.calls[0][0].data;
    expect(data.giftStyles).toEqual(["elegant", "romantic"]);
    expect(data.giftOccasions).toEqual(["birthday"]);
    expect(data.giftRecipients).toEqual(["partner", "myself"]);
  });

  it("defaults to empty arrays when nothing is checked", async () => {
    await expect(createProduct(null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    const data = mocks.create.mock.calls[0][0].data;
    expect(data.giftStyles).toEqual([]);
    expect(data.giftOccasions).toEqual([]);
    expect(data.giftRecipients).toEqual([]);
  });

  it("rejects an unknown gift style value", async () => {
    const result = await createProduct(
      null,
      formWithGiftTags({}, { giftStyles: ["not-a-real-style"] })
    );

    expect(result).toEqual({ error: expect.any(String) });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe("updateProduct gift metadata", () => {
  it("replaces the stored tags with the newly checked values, including clearing them", async () => {
    await expect(
      updateProduct("p1", null, formWithGiftTags({}, { giftOccasions: ["christmas"] }))
    ).rejects.toThrow("NEXT_REDIRECT");

    const data = mocks.update.mock.calls[0][0].data;
    expect(data.giftStyles).toEqual([]);
    expect(data.giftOccasions).toEqual(["christmas"]);
    expect(data.giftRecipients).toEqual([]);
  });
});
