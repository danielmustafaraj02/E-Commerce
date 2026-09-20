import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOrder: vi.fn(),
  updateOrder: vi.fn(),
  updatePayments: vi.fn(),
  constructEvent: vi.fn(),
  captureError: vi.fn(),
  sendOrderStatusEmail: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const tx = {
    order: { findUnique: mocks.findOrder, update: mocks.updateOrder },
    payment: { updateMany: mocks.updatePayments },
  };
  return { db: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});
vi.mock("@/lib/stripe", () => ({
  getStripe: async () => ({ webhooks: { constructEvent: mocks.constructEvent } }),
  getStripeWebhookSecret: async () => "whsec_test",
}));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));
vi.mock("@/lib/email", () => ({ sendOrderStatusEmail: mocks.sendOrderStatusEmail }));

import { POST } from "./route";

function sessionEvent(
  overrides: Record<string, unknown> = {},
  type = "checkout.session.completed"
) {
  return {
    type,
    data: {
      object: {
        id: "cs_1",
        payment_status: "paid",
        payment_intent: "pi_1",
        amount_total: 5167,
        currency: "eur",
        metadata: { orderNumber: "ORD-1" },
        ...overrides,
      },
    },
  };
}

function deliver(event: unknown) {
  mocks.constructEvent.mockReturnValue(event);
  return POST(
    new Request("https://shop.test/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    })
  );
}

function order(status: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "o1",
    orderNumber: "ORD-1",
    status,
    total: 5167,
    currency: "EUR",
    user: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findOrder.mockResolvedValue(order("pending"));
});

describe("Stripe webhook", () => {
  it("marks a pending order paid, records the payment and sends the email", async () => {
    const res = await deliver(sessionEvent());

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).toHaveBeenCalledWith({
      where: { id: "o1" },
      data: { status: "paid" },
    });
    expect(mocks.updatePayments).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "succeeded", providerTransactionId: "pi_1" } })
    );
    expect(mocks.sendOrderStatusEmail).toHaveBeenCalledOnce();
    expect(mocks.captureError).not.toHaveBeenCalled();
  });

  it("ignores a session that is not paid yet", async () => {
    await deliver(sessionEvent({ payment_status: "unpaid" }));

    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });

  it("handles delayed-method success the same way", async () => {
    await deliver(sessionEvent({}, "checkout.session.async_payment_succeeded"));

    expect(mocks.updateOrder).toHaveBeenCalledOnce();
  });

  it("alerts, records the payment and leaves the order cancelled when money arrives late", async () => {
    mocks.findOrder.mockResolvedValue(order("cancelled"));

    const res = await deliver(sessionEvent());

    // 200 so Stripe doesn't retry something a retry can't fix.
    expect(res.status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.updatePayments).toHaveBeenCalledOnce();
    expect(mocks.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ outcome: "paid_after_cancel", orderNumber: "ORD-1" })
    );
    expect(mocks.sendOrderStatusEmail).not.toHaveBeenCalled();
  });

  it("does not mark the order paid when Stripe collected a different amount", async () => {
    const res = await deliver(sessionEvent({ amount_total: 100 }));

    expect(res.status).toBe(200);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.updatePayments).not.toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ outcome: "amount_mismatch" })
    );
  });

  it("does not resend the email or re-alert on a retried delivery of a paid order", async () => {
    mocks.findOrder.mockResolvedValue(order("paid"));

    await deliver(sessionEvent());

    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.sendOrderStatusEmail).not.toHaveBeenCalled();
    expect(mocks.captureError).not.toHaveBeenCalled();
  });

  it("rejects a request with a bad signature", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });

    const res = await POST(
      new Request("https://shop.test/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "nope" },
        body: "{}",
      })
    );

    expect(res.status).toBe(400);
    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });
});
