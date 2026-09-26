import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  placeOrderWithRetry: vi.fn(),
  resolveDefaultShippingMethodId: vi.fn(),
  createPaymentIntent: vi.fn(),
  createPayment: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("@/lib/i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/i18n/locale")>()),
  getLocale: async () => "en",
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: async () => ({ success: true, remaining: 9 }),
  clientIp: () => "203.0.113.7",
}));
vi.mock("@/lib/place-order", () => ({
  placeOrderWithRetry: mocks.placeOrderWithRetry,
  resolveDefaultShippingMethodId: mocks.resolveDefaultShippingMethodId,
}));
vi.mock("@/lib/db", () => ({ db: { payment: { create: mocks.createPayment } } }));
vi.mock("@/lib/stripe", () => ({
  getStripe: async () => ({ paymentIntents: { create: mocks.createPaymentIntent } }),
}));

import { POST } from "./route";

const ADDRESS = {
  fullName: "A Buyer",
  street: "Via Roma 1",
  city: "Roma",
  postalCode: "00100",
  country: "IT",
};

function request(body: Record<string, unknown> = {}) {
  return POST(
    new Request("https://shop.test/api/checkout/express", {
      method: "POST",
      body: JSON.stringify({
        items: [{ productId: "p1", quantity: 1 }],
        guestEmail: "buyer@example.com",
        address: ADDRESS,
        ...body,
      }),
    })
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue(null);
  mocks.resolveDefaultShippingMethodId.mockResolvedValue("ship1");
  mocks.placeOrderWithRetry.mockResolvedValue({
    id: "o1",
    orderNumber: "ORD-1",
    total: 5000,
    currency: "EUR",
  });
  mocks.createPaymentIntent.mockResolvedValue({
    id: "pi_1",
    client_secret: "pi_1_secret_abc",
  });
});

describe("POST /api/checkout/express", () => {
  it("places the order, starts a PaymentIntent for the server-computed total, and records the Payment row", async () => {
    const res = await request();
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual({ orderNumber: "ORD-1", clientSecret: "pi_1_secret_abc" });
    expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        currency: "eur",
        metadata: { orderNumber: "ORD-1" },
      }),
      expect.objectContaining({ idempotencyKey: "express-checkout-intent:ORD-1" })
    );
    expect(mocks.createPayment).toHaveBeenCalledWith({
      data: {
        orderId: "o1",
        provider: "stripe",
        providerTransactionId: "pi_1",
        status: "pending",
        amount: 5000,
        currency: "EUR",
      },
    });
  });

  it("auto-resolves a shipping method rather than requiring one in the request", async () => {
    await request();

    expect(mocks.resolveDefaultShippingMethodId).toHaveBeenCalledWith("IT");
    expect(mocks.placeOrderWithRetry).toHaveBeenCalledWith(
      expect.objectContaining({ shippingMethodId: "ship1" })
    );
  });

  it("rejects a destination with no shipping zone, before ever placing an order", async () => {
    mocks.resolveDefaultShippingMethodId.mockResolvedValue(null);

    const res = await request();

    expect(res.status).toBe(400);
    expect(mocks.placeOrderWithRetry).not.toHaveBeenCalled();
  });

  it("requires a guest email when not signed in", async () => {
    const res = await request({ guestEmail: undefined });

    expect(res.status).toBe(400);
    expect(mocks.placeOrderWithRetry).not.toHaveBeenCalled();
  });

  it("allows a signed-in user with no guest email", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "u1", email: "user@example.com" } });

    const res = await request({ guestEmail: undefined });

    expect(res.status).toBe(201);
    expect(mocks.placeOrderWithRetry).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1" })
    );
  });

  it("rejects an empty cart", async () => {
    const res = await request({ items: [] });

    expect(res.status).toBe(400);
    expect(mocks.placeOrderWithRetry).not.toHaveBeenCalled();
  });
});
