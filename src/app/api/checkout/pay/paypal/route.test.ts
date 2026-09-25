import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findOrder: vi.fn(),
  createPayment: vi.fn(),
  createPaypalOrder: vi.fn(),
  rateLimit: vi.fn(),
}));

// Messages come back in the visitor's language; tests run as an English visitor.
vi.mock("@/lib/i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/i18n/locale")>()),
  getLocale: async () => "en",
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: {
    order: { findUnique: mocks.findOrder },
    payment: { create: mocks.createPayment },
  },
}));
vi.mock("@/lib/paypal", () => ({ createPaypalOrder: mocks.createPaypalOrder }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  clientIp: () => "203.0.113.7",
}));

import { POST } from "./route";

const ORDER = {
  id: "o1",
  orderNumber: "ORD-1",
  status: "pending",
  userId: null, // guest order: the order number is the bearer token
  total: 5167,
  currency: "EUR",
};

function pay(body: unknown = { orderNumber: "ORD-1" }) {
  return POST(
    new Request("https://shop.test/api/checkout/pay/paypal", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true });
  mocks.auth.mockResolvedValue(null);
  mocks.findOrder.mockResolvedValue(ORDER);
  mocks.createPaypalOrder.mockResolvedValue({
    id: "PAYPAL-1",
    approveUrl: "https://paypal.test/approve",
  });
  mocks.createPayment.mockResolvedValue({ id: "pay1" });
});

describe("PayPal pay route", () => {
  it("creates a PayPal order and records a pending payment for a pending guest order", async () => {
    const res = await pay();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://paypal.test/approve" });
    expect(mocks.createPaypalOrder).toHaveBeenCalledWith({
      orderNumber: "ORD-1",
      amountCents: ORDER.total,
      currency: ORDER.currency,
      returnUrl: "https://shop.test/api/checkout/pay/paypal/return?orderNumber=ORD-1",
      cancelUrl: "https://shop.test/order-confirmation/ORD-1?cancelled=1",
    });
    expect(mocks.createPayment).toHaveBeenCalledWith({
      data: {
        orderId: "o1",
        provider: "paypal",
        providerTransactionId: "PAYPAL-1",
        status: "pending",
        amount: ORDER.total,
        currency: ORDER.currency,
      },
    });
  });

  it("rate-limits repeated attempts before touching the database", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false });

    const res = await pay();

    expect(res.status).toBe(429);
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.createPaypalOrder).not.toHaveBeenCalled();
  });

  it("rejects a request with no order number", async () => {
    const res = await pay({});

    expect(res.status).toBe(400);
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.createPaypalOrder).not.toHaveBeenCalled();
  });

  it("hides an account-linked order from a visitor who doesn't own it", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, userId: "owner" });

    const res = await pay();

    expect(res.status).toBe(404);
    expect(mocks.createPaypalOrder).not.toHaveBeenCalled();
  });

  it("404s when the order doesn't exist", async () => {
    mocks.findOrder.mockResolvedValue(null);

    const res = await pay();

    expect(res.status).toBe(404);
    expect(mocks.createPaypalOrder).not.toHaveBeenCalled();
  });

  it("refuses to start a new PayPal order for an order that isn't pending anymore", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, status: "paid" });

    const res = await pay();

    expect(res.status).toBe(400);
    expect(mocks.createPaypalOrder).not.toHaveBeenCalled();
  });

  it("lets the owning account pay its own order", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, userId: "u1" });
    mocks.auth.mockResolvedValue({ user: { id: "u1", role: "customer" } });

    const res = await pay();

    expect(res.status).toBe(200);
    expect(mocks.createPayment).toHaveBeenCalledOnce();
  });

  it("reports PayPal being unreachable or unconfigured instead of losing the order", async () => {
    mocks.createPaypalOrder.mockRejectedValue(new Error("PayPal is not configured"));

    const res = await pay();

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "PayPal is not configured" });
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });
});
