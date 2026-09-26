import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOrders: vi.fn(),
  updateOrder: vi.fn(),
  txClaimOrder: vi.fn(),
  txUpdateProduct: vi.fn(),
  txUpdateDiscount: vi.fn(),
  sendEmail: vi.fn(),
  sendOrderStatusEmail: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const tx = {
    order: { updateMany: mocks.txClaimOrder },
    product: { update: mocks.txUpdateProduct },
    discountCode: { update: mocks.txUpdateDiscount },
  };
  return {
    db: {
      order: { findMany: mocks.findOrders, update: mocks.updateOrder },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: async () => ({ siteUrl: null }) }));
vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
  sendOrderStatusEmail: mocks.sendOrderStatusEmail,
}));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));

import {
  BANK_TRANSFER_HOLD_MS,
  ONLINE_HOLD_MS,
  cancelExpiredOrders,
  notifyCancelledOrders,
  processAbandonedOrders,
} from "./abandoned-orders";

const NOW = new Date("2026-09-20T12:00:00Z");

function order(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    orderNumber: `ORD-${id}`,
    guestEmail: `${id}@example.com`,
    user: null,
    discountCodeId: null,
    items: [
      { quantity: 2, product: { id: "p1", trackInventory: true } },
      { quantity: 1, product: { id: "dropship", trackInventory: false } },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.txClaimOrder.mockResolvedValue({ count: 1 });
});

describe("stock hold windows", () => {
  it("holds unpaid card/PayPal orders for hours, not days", () => {
    expect(ONLINE_HOLD_MS).toBe(2 * 60 * 60 * 1000);
  });

  it("gives bank-transfer orders a much longer hold", () => {
    expect(BANK_TRANSFER_HOLD_MS).toBeGreaterThan(ONLINE_HOLD_MS * 24);
  });
});

describe("cancelExpiredOrders", () => {
  it("looks for online orders past the short hold and bank-transfer orders past the long one", async () => {
    mocks.findOrders.mockResolvedValue([]);

    await cancelExpiredOrders(NOW);

    const { where } = mocks.findOrders.mock.calls[0][0];
    expect(where.status).toBe("pending");
    const [online, bank] = where.OR;
    expect(online.payments).toEqual({ none: { provider: "bank_transfer" } });
    expect(online.createdAt.lte).toEqual(new Date(NOW.getTime() - ONLINE_HOLD_MS));
    expect(bank.payments).toEqual({ some: { provider: "bank_transfer" } });
    expect(bank.createdAt.lte).toEqual(new Date(NOW.getTime() - BANK_TRANSFER_HOLD_MS));
  });

  it("claims the order, restocks tracked items only, and returns it", async () => {
    mocks.findOrders.mockResolvedValue([order("a")]);

    const cancelled = await cancelExpiredOrders(NOW);

    expect(mocks.txClaimOrder).toHaveBeenCalledWith({
      where: { id: "a", status: "pending" },
      data: { status: "cancelled" },
    });
    expect(mocks.txUpdateProduct).toHaveBeenCalledOnce();
    expect(mocks.txUpdateProduct).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { stockQty: { increment: 2 } },
    });
    expect(cancelled).toEqual([{ orderNumber: "ORD-a", guestEmail: "a@example.com", user: null }]);
  });

  it("gives the discount use back", async () => {
    mocks.findOrders.mockResolvedValue([order("a", { discountCodeId: "d1" })]);

    await cancelExpiredOrders(NOW);

    expect(mocks.txUpdateDiscount).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { usedCount: { decrement: 1 } },
    });
  });

  it("does not restock an order another caller already cancelled (no double restock)", async () => {
    mocks.findOrders.mockResolvedValue([order("a")]);
    mocks.txClaimOrder.mockResolvedValue({ count: 0 });

    const cancelled = await cancelExpiredOrders(NOW);

    expect(mocks.txUpdateProduct).not.toHaveBeenCalled();
    expect(mocks.txUpdateDiscount).not.toHaveBeenCalled();
    expect(cancelled).toEqual([]);
  });

  it("keeps going after one order fails, and reports the failure", async () => {
    mocks.findOrders.mockResolvedValue([order("a"), order("b")]);
    mocks.txUpdateProduct.mockRejectedValueOnce(new Error("deadlock")).mockResolvedValue({});

    const cancelled = await cancelExpiredOrders(NOW);

    expect(cancelled.map((o) => o.orderNumber)).toEqual(["ORD-b"]);
    expect(mocks.captureError).toHaveBeenCalledOnce();
  });
});

describe("notifyCancelledOrders", () => {
  it("emails each customer and survives a failing send", async () => {
    mocks.sendOrderStatusEmail
      .mockRejectedValueOnce(new Error("smtp"))
      .mockResolvedValue(undefined);

    await notifyCancelledOrders([
      { orderNumber: "ORD-a", guestEmail: "a@example.com", user: null },
      { orderNumber: "ORD-b", guestEmail: "b@example.com", user: null },
    ]);

    expect(mocks.sendOrderStatusEmail).toHaveBeenCalledTimes(2);
    expect(mocks.captureError).toHaveBeenCalledOnce();
  });
});

describe("processAbandonedOrders", () => {
  it("never nags bank-transfer customers with a 'you left something in your cart' email", async () => {
    mocks.findOrders.mockResolvedValue([]);

    await processAbandonedOrders();

    const reminderQuery = mocks.findOrders.mock.calls[0][0].where;
    expect(reminderQuery.payments).toEqual({ none: { provider: "bank_transfer" } });
  });

  it("reports how many reminders went out and how many orders expired", async () => {
    mocks.findOrders
      .mockResolvedValueOnce([{ ...order("r"), items: [{ productName: "Ring", quantity: 1 }] }]) // reminder candidates
      .mockResolvedValueOnce([order("x")]); // expiry candidates

    const result = await processAbandonedOrders();

    expect(result).toEqual({ reminded: 1, expired: 1 });
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    expect(mocks.sendOrderStatusEmail).toHaveBeenCalledOnce();
  });

  it("puts the store's domain in the reminder link (a bare /order-confirmation/... path is not clickable)", async () => {
    vi.stubEnv("NEXTAUTH_URL", "https://shop.test");
    mocks.findOrders
      .mockResolvedValueOnce([{ ...order("r"), items: [{ productName: "Ring", quantity: 1 }] }])
      .mockResolvedValueOnce([]);

    await processAbandonedOrders();

    expect(mocks.sendEmail.mock.calls[0][0].text).toContain(
      "https://shop.test/en/order-confirmation/ORD-r"
    );
    vi.unstubAllEnvs();
  });
});
