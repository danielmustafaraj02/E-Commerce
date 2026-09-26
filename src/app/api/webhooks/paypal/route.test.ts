import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPayment: vi.fn(),
  updatePayment: vi.fn(),
  findOrder: vi.fn(),
  updateOrder: vi.fn(),
  verifySignature: vi.fn(),
  captureError: vi.fn(),
  sendOrderStatusEmail: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const tx = {
    order: { findUnique: mocks.findOrder, update: mocks.updateOrder },
    payment: { update: mocks.updatePayment },
  };
  return {
    db: {
      payment: { findFirst: mocks.findPayment },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/lib/paypal", () => ({ verifyPaypalWebhookSignature: mocks.verifySignature }));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));
vi.mock("@/lib/email", () => ({ sendOrderStatusEmail: mocks.sendOrderStatusEmail }));

import { POST } from "./route";

function captureEvent(value = "51.67", currency = "EUR") {
  return {
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    resource: {
      amount: { value, currency_code: currency },
      supplementary_data: { related_ids: { order_id: "PAYPAL-1" } },
    },
  };
}

function deliver(event: unknown) {
  return POST(
    new Request("https://shop.test/api/webhooks/paypal", {
      method: "POST",
      body: JSON.stringify(event),
    })
  );
}

function order(status: string) {
  return { id: "o1", orderNumber: "ORD-1", status, total: 5167, currency: "EUR", user: null };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verifySignature.mockResolvedValue(true);
  mocks.findPayment.mockResolvedValue({ id: "p1", orderId: "o1" });
  mocks.findOrder.mockResolvedValue(order("pending"));
});

describe("PayPal webhook", () => {
  it("marks the order paid when the captured amount matches", async () => {
    const res = await deliver(captureEvent());

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).toHaveBeenCalledWith({
      where: { id: "o1" },
      data: { status: "paid" },
    });
    expect(mocks.updatePayment).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "succeeded" },
    });
    expect(mocks.sendOrderStatusEmail).toHaveBeenCalledOnce();
  });

  it("does not mark the order paid when the captured amount differs", async () => {
    const res = await deliver(captureEvent("0.01"));

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ outcome: "amount_mismatch" })
    );
  });

  it("alerts and keeps the order cancelled when money arrives for a cancelled order", async () => {
    mocks.findOrder.mockResolvedValue(order("cancelled"));

    const res = await deliver(captureEvent());

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.updatePayment).toHaveBeenCalledOnce();
    expect(mocks.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ outcome: "paid_after_cancel" })
    );
  });

  it("does not treat a buyer approval as payment (funds are only taken by the capture)", async () => {
    const res = await deliver({
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: { id: "PAYPAL-1" },
    });

    expect(res.status).toBe(200);
    expect(mocks.findPayment).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.sendOrderStatusEmail).not.toHaveBeenCalled();
  });

  it("does not mark the order paid when a capture event carries no usable amount", async () => {
    const event = captureEvent();
    delete (event.resource as { amount?: unknown }).amount;

    const res = await deliver(event);

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledOnce();
  });

  it("rejects an unverified webhook", async () => {
    mocks.verifySignature.mockResolvedValue(false);

    const res = await deliver(captureEvent());

    expect(res.status).toBe(400);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });
});
