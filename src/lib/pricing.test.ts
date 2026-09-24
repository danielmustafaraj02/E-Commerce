import { beforeEach, describe, expect, it, vi } from "vitest";

// pricing.ts is the single source of truth for checkout math (tax, discounts,
// shipping) — the most correctness-critical surface in the app, and the one
// most likely to silently regress since nothing else exercises every branch.
// Mocked below rather than hitting a real DB: quoteOrder is pure computation
// over whatever these two modules hand it back.
const { mockDb, mockSettings } = vi.hoisted(() => ({
  mockDb: {
    product: { findMany: vi.fn() },
    taxRule: { findMany: vi.fn() },
    shippingZone: { findFirst: vi.fn() },
    discountCode: { findUnique: vi.fn() },
    look: { findMany: vi.fn() },
  },
  mockSettings: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: mockSettings }));

const { quoteOrder, PricingError } = await import("./pricing");

const product = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "p1",
  name: "Widget",
  slug: "widget",
  description: "",
  price: 1100, // EUR 11.00, tax-inclusive
  currency: "EUR",
  sku: "SKU-1",
  stockQty: 10,
  lowStockThreshold: 5,
  active: true,
  supplierId: null,
  supplierSku: null,
  costPrice: null,
  trackInventory: true,
  categoryId: null,
  ...overrides,
});

const shippingMethod = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "m1",
  name: "Standard",
  basePrice: 500,
  pricePerKg: 0,
  estimatedDaysMin: 2,
  estimatedDaysMax: 5,
  active: true,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockSettings.mockResolvedValue({ pricesIncludeTax: true, freeShippingThreshold: null });
  mockDb.shippingZone.findFirst.mockResolvedValue({
    methods: [{ methodId: "m1", method: shippingMethod() }],
  });
  mockDb.taxRule.findMany.mockResolvedValue([{ categoryId: null, ratePercent: 22 }]);
  mockDb.look.findMany.mockResolvedValue([]);
});

describe("quoteOrder", () => {
  it("extracts tax-inclusive VAT and adds shipping on top", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ price: 1100 })]);

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 2 }],
      country: "IT",
      shippingMethodId: "m1",
    });

    expect(quote.subtotal).toBe(2200);
    // 22% extracted from a tax-inclusive 2200 -> round(2200 * 22 / 122)
    expect(quote.taxAmount).toBe(397);
    expect(quote.shippingAmount).toBe(500);
    // Tax-inclusive: total is subtotal + shipping, tax is not added again.
    expect(quote.total).toBe(2700);
  });

  it("adds tax on top when prices are tax-exclusive", async () => {
    mockSettings.mockResolvedValue({ pricesIncludeTax: false, freeShippingThreshold: null });
    mockDb.product.findMany.mockResolvedValue([product({ price: 1000 })]);

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 1 }],
      country: "IT",
      shippingMethodId: "m1",
    });

    expect(quote.subtotal).toBe(1000);
    expect(quote.taxAmount).toBe(220); // 22% of 1000
    expect(quote.total).toBe(1000 + 220 + 500);
  });

  it("waives shipping once the free-shipping threshold is met", async () => {
    mockSettings.mockResolvedValue({ pricesIncludeTax: true, freeShippingThreshold: 2000 });
    mockDb.product.findMany.mockResolvedValue([product({ price: 2500 })]);

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 1 }],
      country: "IT",
      shippingMethodId: "m1",
    });

    expect(quote.shippingAmount).toBe(0);
  });

  it("applies a percent-off discount code, capped sensibly", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ price: 1000 })]);
    mockDb.discountCode.findUnique.mockResolvedValue({
      id: "d1",
      code: "SAVE10",
      percentOff: 10,
      amountOff: null,
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      active: true,
    });

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 1 }],
      country: "IT",
      shippingMethodId: "m1",
      discountCode: "SAVE10",
    });

    expect(quote.discountAmount).toBe(100);
    expect(quote.discountCodeId).toBe("d1");
  });

  it("rejects an expired discount code", async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);
    mockDb.discountCode.findUnique.mockResolvedValue({
      id: "d1",
      code: "OLD",
      percentOff: 10,
      amountOff: null,
      expiresAt: new Date("2000-01-01"),
      maxUses: null,
      usedCount: 0,
      active: true,
    });

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 1 }],
        country: "IT",
        shippingMethodId: "m1",
        discountCode: "OLD",
      })
    ).rejects.toThrow(PricingError);
  });

  it("refuses to quote more units than are in stock (409)", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ stockQty: 1 })]);

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 5 }],
        country: "IT",
        shippingMethodId: "m1",
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("skips the stock check entirely for dropshipped (trackInventory=false) products", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ stockQty: 0, trackInventory: false })]);

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 5 }],
      country: "IT",
      shippingMethodId: "m1",
    });

    expect(quote.subtotal).toBe(5500);
  });

  it("flags missingTaxRule instead of silently charging 0% tax", async () => {
    mockDb.taxRule.findMany.mockResolvedValue([]);
    mockDb.product.findMany.mockResolvedValue([product()]);

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 1 }],
      country: "XX",
      shippingMethodId: "m1",
    });

    expect(quote.missingTaxRule).toBe(true);
    expect(quote.taxAmount).toBe(0);
  });

  it("rejects a shipping method that isn't available for the destination", async () => {
    mockDb.shippingZone.findFirst.mockResolvedValue(null);
    mockDb.product.findMany.mockResolvedValue([product()]);

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 1 }],
        country: "ZZ",
        shippingMethodId: "m1",
      })
    ).rejects.toThrow(PricingError);
  });

  it("rejects a cart referencing a product that no longer exists or is inactive", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ active: false })]);

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 1 }],
        country: "IT",
        shippingMethodId: "m1",
      })
    ).rejects.toThrow(PricingError);
  });

  it("rejects a zero or negative quantity instead of quoting it", async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 0 }],
        country: "IT",
        shippingMethodId: "m1",
      })
    ).rejects.toMatchObject({ code: "invalid-quantity" });
  });

  it("rejects a discount code that has reached its usage limit", async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);
    mockDb.discountCode.findUnique.mockResolvedValue({
      id: "d1",
      code: "USEDUP",
      percentOff: 10,
      amountOff: null,
      expiresAt: null,
      maxUses: 5,
      usedCount: 5,
      active: true,
    });

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 1 }],
        country: "IT",
        shippingMethodId: "m1",
        discountCode: "USEDUP",
      })
    ).rejects.toMatchObject({ code: "discount-limit" });
  });

  it("rejects a discount code that doesn't exist or was deactivated", async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);
    mockDb.discountCode.findUnique.mockResolvedValue(null);

    await expect(
      quoteOrder({
        items: [{ productId: "p1", quantity: 1 }],
        country: "IT",
        shippingMethodId: "m1",
        discountCode: "NOPE",
      })
    ).rejects.toMatchObject({ code: "discount-invalid" });
  });

  it("caps a fixed amountOff discount at the subtotal so total never goes negative", async () => {
    mockDb.product.findMany.mockResolvedValue([product({ price: 500 })]);
    mockDb.discountCode.findUnique.mockResolvedValue({
      id: "d1",
      code: "BIGSAVE",
      percentOff: null,
      amountOff: 5000, // far more than the 500 subtotal
      expiresAt: null,
      maxUses: null,
      usedCount: 0,
      active: true,
    });

    const quote = await quoteOrder({
      items: [{ productId: "p1", quantity: 1 }],
      country: "IT",
      shippingMethodId: "m1",
      discountCode: "BIGSAVE",
    });

    expect(quote.discountAmount).toBe(500);
    // Tax-inclusive, fully discounted subtotal: only shipping remains.
    expect(quote.total).toBe(500);
  });

  describe("complete-the-look bundle", () => {
    const pieces = () => [
      product({ id: "n", price: 12000 }),
      product({ id: "b", price: 4500 }),
      product({ id: "e", price: 1500 }),
    ];
    const look = {
      id: "look1",
      discountPercent: 15,
      products: [{ id: "n" }, { id: "b" }, { id: "e" }],
    };
    const allThree = [
      { productId: "n", quantity: 1 },
      { productId: "b", quantity: 1 },
      { productId: "e", quantity: 1 },
    ];

    it("takes 15% off every piece when the whole look is bought", async () => {
      mockDb.product.findMany.mockResolvedValue(pieces());
      mockDb.look.findMany.mockResolvedValue([look]);

      const quote = await quoteOrder({ items: allThree, country: "IT", shippingMethodId: "m1" });

      expect(quote.subtotal).toBe(18000);
      expect(quote.bundleDiscountAmount).toBe(2700);
      expect(quote.bundleLookIds).toEqual(["look1"]);
      expect(quote.total).toBe(18000 - 2700 + 500);
      // VAT is extracted from what's actually paid for the goods (15300).
      expect(quote.taxAmount).toBe(
        Math.round(((12000 - 1800) * 22) / 122) +
          Math.round(((4500 - 675) * 22) / 122) +
          Math.round(((1500 - 225) * 22) / 122)
      );
    });

    it("takes 10% off when two pieces of the look are bought", async () => {
      mockDb.product.findMany.mockResolvedValue(pieces().slice(0, 2));
      mockDb.look.findMany.mockResolvedValue([look]);

      const quote = await quoteOrder({
        items: allThree.slice(0, 2),
        country: "IT",
        shippingMethodId: "m1",
      });

      expect(quote.bundleDiscountAmount).toBe(1200 + 450);
      expect(quote.total).toBe(16500 - 1650 + 500);
    });

    it("gives no bundle discount for a single piece", async () => {
      mockDb.product.findMany.mockResolvedValue(pieces().slice(0, 1));
      mockDb.look.findMany.mockResolvedValue([look]);

      const quote = await quoteOrder({
        items: allThree.slice(0, 1),
        country: "IT",
        shippingMethodId: "m1",
      });

      expect(quote.bundleDiscountAmount).toBe(0);
    });

    it("applies a percent discount code to the price after the bundle saving", async () => {
      mockDb.product.findMany.mockResolvedValue(pieces());
      mockDb.look.findMany.mockResolvedValue([look]);
      mockDb.discountCode.findUnique.mockResolvedValue({
        id: "d1",
        code: "SAVE10",
        percentOff: 10,
        amountOff: null,
        expiresAt: null,
        maxUses: null,
        usedCount: 0,
        active: true,
      });

      const quote = await quoteOrder({
        items: allThree,
        country: "IT",
        shippingMethodId: "m1",
        discountCode: "SAVE10",
      });

      expect(quote.discountAmount).toBe(1530);
      expect(quote.total).toBe(18000 - 2700 - 1530 + 500);
    });

    it("only asks for active looks containing the cart's products", async () => {
      mockDb.product.findMany.mockResolvedValue(pieces());

      await quoteOrder({ items: allThree, country: "IT", shippingMethodId: "m1" });

      expect(mockDb.look.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, products: { some: { id: { in: ["n", "b", "e"] } } } },
        })
      );
    });
  });
});
