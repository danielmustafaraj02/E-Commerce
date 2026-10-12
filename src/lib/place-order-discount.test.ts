import { beforeEach, describe, expect, it, vi } from "vitest";

// The discount use is claimed inside the order transaction, guarded by its
// limit (security audit F05). Pricing itself is mocked: this is about the claim.
const mocks = vi.hoisted(() => {
  const tx = {
    giftVoucher: { updateMany: vi.fn() },
    product: { updateMany: vi.fn() },
    address: { create: vi.fn() },
    discountCode: { updateMany: vi.fn() },
    order: { create: vi.fn() },
  };
  return {
    tx,
    quoteOrder: vi.fn(),
    cancelExpiredOrders: vi.fn(),
    maxUsesRef: { name: "maxUses", modelName: "DiscountCode" },
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: (run: (tx: typeof mocks.tx) => unknown) => run(mocks.tx),
    discountCode: { fields: { maxUses: mocks.maxUsesRef } },
  },
}));
vi.mock("@/lib/pricing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pricing")>()),
  quoteOrder: mocks.quoteOrder,
}));
vi.mock("@/lib/abandoned-orders", () => ({
  cancelExpiredOrders: mocks.cancelExpiredOrders,
  notifyCancelledOrders: vi.fn(),
}));
vi.mock("@/lib/geocode-address", () => ({ geocodeAndStoreAddress: vi.fn() }));
vi.mock("@/lib/monitoring", () => ({ captureError: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

const { placeOrderWithRetry } = await import("./place-order");
const { PricingError } = await import("./pricing");

const quote = {
  lines: [{ product: { id: "p1", name: "Ring", price: 1000, trackInventory: false }, quantity: 1 }],
  currency: "EUR",
  subtotal: 1000,
  giftCardAmount: 0,
  taxAmount: 0,
  taxRatePercent: null,
  shippingAmount: 0,
  shippingMethod: { id: "m1" },
  discountAmount: 100,
  discountCodeId: "d1",
  bundleDiscountAmount: 0,
  giftVoucherId: null,
  giftVoucherAppliedAmount: 0,
  total: 900,
};

const input = {
  items: [{ productId: "p1", quantity: 1 }],
  address: { fullName: "A", street: "S", city: "C", postalCode: "30100", country: "IT" },
  shippingMethodId: "m1",
  discountCode: "SAVE10",
  guestEmail: "a@example.com",
  locale: "en",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.quoteOrder.mockResolvedValue(quote);
  mocks.cancelExpiredOrders.mockResolvedValue([]);
  mocks.tx.address.create.mockResolvedValue({ id: "a1" });
  mocks.tx.order.create.mockResolvedValue({ id: "o1", addressId: null });
});

describe("discount use claim", () => {
  it("claims a use only while the code is on, unexpired and under its limit", async () => {
    mocks.tx.discountCode.updateMany.mockResolvedValue({ count: 1 });

    await placeOrderWithRetry(input);

    const call = mocks.tx.discountCode.updateMany.mock.calls[0][0];
    expect(call.where).toMatchObject({ id: "d1", active: true });
    expect(JSON.stringify(call.where)).toContain('"maxUses":null');
    expect(call.where.AND[1].OR[1]).toEqual({ usedCount: { lt: mocks.maxUsesRef } });
    expect(call.data).toEqual({ usedCount: { increment: 1 } });
    expect(mocks.tx.order.create).toHaveBeenCalled();
  });

  it("refuses the order when another checkout took the last use first", async () => {
    mocks.tx.discountCode.updateMany.mockResolvedValue({ count: 0 });

    const placing = placeOrderWithRetry(input);

    await expect(placing).rejects.toBeInstanceOf(PricingError);
    await expect(placing).rejects.toMatchObject({ status: 409, code: "discount-limit" });
    expect(mocks.tx.order.create).not.toHaveBeenCalled();
  });
});
