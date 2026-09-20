import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPayment: vi.fn(),
  findOrder: vi.fn(),
  updateOrder: vi.fn(),
  updatePayment: vi.fn(),
  capturePaypalOrder: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const tx = {
    order: { findUnique: mocks.findOrder, update: mocks.updateOrder },
    payment: { update: mocks.updatePayment },
  };
  return {
    db: {
      payment: { findUnique: mocks.findPayment },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/lib/paypal", () => ({ capturePaypalOrder: mocks.capturePaypalOrder }));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));

import { GET } from "./route";

const ORDER = { id: "order-cheap", orderNumber: "ORD-CHEAP", total: 1000, currency: "EUR" };

function paymentFor(order = ORDER) {
  return { id: "pay-1", provider: "paypal", providerTransactionId: "PAYPAL-1", order };
}

function completedCapture(value = "10.00", currency = "EUR") {
  return {
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: [{ status: "COMPLETED", amount: { currency_code: currency, value } }],
        },
      },
    ],
  };
}

function call(params: Record<string, string>) {
  const url = new URL("https://shop.test/api/checkout/pay/paypal/return");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return GET(new Request(url));
}

function locationOf(res: Response) {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findPayment.mockResolvedValue(paymentFor());
  mocks.findOrder.mockResolvedValue({ id: ORDER.id, status: "pending" });
  mocks.capturePaypalOrder.mockResolvedValue(completedCapture());
});

describe("PayPal return route", () => {
  it("marks the order paid when the token belongs to it and the amount matches", async () => {
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).toHaveBeenCalledWith({
      where: { id: "order-cheap" },
      data: { status: "paid" },
    });
    expect(mocks.updatePayment).toHaveBeenCalledWith({
      where: { id: "pay-1" },
      data: { status: "succeeded" },
    });
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP?paid=1");
  });

  it("does not let a token for one order pay for a different order", async () => {
    // Attacker pays PAYPAL-1 (bound to ORD-CHEAP) but names an expensive order.
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-EXPENSIVE" });

    expect(mocks.capturePaypalOrder).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/");
  });

  it("ignores a token we never issued", async () => {
    mocks.findPayment.mockResolvedValue(null);
    const res = await call({ token: "FORGED", orderNumber: "ORD-CHEAP" });

    expect(mocks.capturePaypalOrder).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/");
  });

  it("ignores a token that belongs to a non-PayPal payment", async () => {
    mocks.findPayment.mockResolvedValue({ ...paymentFor(), provider: "stripe" });
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.capturePaypalOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/");
  });

  it("redirects home when a param is missing", async () => {
    const res = await call({ token: "PAYPAL-1" });

    expect(mocks.findPayment).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/");
  });

  it("does not mark the order paid when the captured amount differs", async () => {
    mocks.capturePaypalOrder.mockResolvedValue(completedCapture("0.01"));
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledOnce();
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP");
  });

  it("does not mark the order paid when the capture is not COMPLETED", async () => {
    mocks.capturePaypalOrder.mockResolvedValue({ status: "PENDING" });
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP?cancelled=1");
  });

  it("falls back to the cancelled page when the capture call fails", async () => {
    mocks.capturePaypalOrder.mockRejectedValue(new Error("PayPal down"));
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP?cancelled=1");
  });

  it("treats an already-paid order (webhook won the race) as success without rewriting it", async () => {
    mocks.findOrder.mockResolvedValue({ id: ORDER.id, status: "paid" });
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP?paid=1");
  });

  it("flags money captured against an order that was cancelled meanwhile", async () => {
    mocks.findOrder.mockResolvedValue({ id: ORDER.id, status: "cancelled" });
    const res = await call({ token: "PAYPAL-1", orderNumber: "ORD-CHEAP" });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledOnce();
    expect(locationOf(res)).toBe("/order-confirmation/ORD-CHEAP");
  });
});
