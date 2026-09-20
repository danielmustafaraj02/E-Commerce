import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOrder: vi.fn(),
  findPayment: vi.fn(),
  updatePayment: vi.fn(),
  countPayments: vi.fn(),
  upsertPayment: vi.fn(),
  retrieveSession: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: async () => null }));
vi.mock("@/lib/db", () => ({
  db: {
    order: { findUnique: mocks.findOrder },
    payment: {
      findFirst: mocks.findPayment,
      update: mocks.updatePayment,
      count: mocks.countPayments,
      upsert: mocks.upsertPayment,
    },
  },
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: async () => ({
    checkout: { sessions: { retrieve: mocks.retrieveSession, create: mocks.createSession } },
  }),
}));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({ klarnaEnabled: false }),
}));

import { POST } from "./route";

const ORDER = {
  id: "o1",
  orderNumber: "ORD-1",
  status: "pending",
  userId: null, // guest order: the order number is the bearer token
  total: 5167,
  currency: "EUR",
  guestEmail: "buyer@example.com",
  createdAt: new Date(),
};

function pay() {
  return POST(
    new Request("https://shop.test/api/checkout/pay/stripe", {
      method: "POST",
      body: JSON.stringify({ orderNumber: "ORD-1" }),
    })
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findOrder.mockResolvedValue(ORDER);
  mocks.findPayment.mockResolvedValue(null);
  mocks.countPayments.mockResolvedValue(0);
  mocks.createSession.mockResolvedValue({ id: "cs_new", url: "https://stripe.test/new" });
});

describe("Stripe pay route", () => {
  it("creates a session for the first attempt and records a pending payment", async () => {
    const res = await pay();

    expect(await res.json()).toEqual({ url: "https://stripe.test/new" });
    expect(mocks.createSession).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: "checkout-session:ORD-1:0",
    });
    expect(mocks.upsertPayment).toHaveBeenCalledWith(
      expect.objectContaining({ where: { providerTransactionId: "cs_new" }, update: {} })
    );
  });

  it("makes the session expire on the order's own stock-hold clock (Stripe allows 30 min – 24 h)", async () => {
    await pay();

    const { expires_at } = mocks.createSession.mock.calls[0][0];
    const secondsFromNow = expires_at - Date.now() / 1000;
    expect(secondsFromNow).toBeGreaterThan(30 * 60);
    expect(secondsFromNow).toBeLessThanOrEqual(24 * 60 * 60);
    // A fresh order with the default 2h hold: session lives about that long.
    expect(secondsFromNow).toBeLessThanOrEqual(2 * 60 * 60 + 5);
  });

  it("never asks Stripe for less than its 30-minute minimum, even for an old order", async () => {
    mocks.findOrder.mockResolvedValue({
      ...ORDER,
      createdAt: new Date(Date.now() - 5 * 60 * 60_000),
    });

    await pay();

    const { expires_at } = mocks.createSession.mock.calls[0][0];
    expect(expires_at - Date.now() / 1000).toBeGreaterThan(30 * 60);
  });

  it("sends the buyer back to a still-open session instead of creating another", async () => {
    mocks.findPayment.mockResolvedValue({ id: "p1", providerTransactionId: "cs_open" });
    mocks.retrieveSession.mockResolvedValue({
      id: "cs_open",
      status: "open",
      url: "https://stripe.test/open",
    });

    const res = await pay();

    expect(await res.json()).toEqual({ url: "https://stripe.test/open" });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("starts a fresh attempt (new idempotency key) once the old session expired", async () => {
    mocks.findPayment.mockResolvedValue({ id: "p1", providerTransactionId: "cs_old" });
    mocks.retrieveSession.mockResolvedValue({ id: "cs_old", status: "expired", url: null });
    mocks.countPayments.mockResolvedValue(1);

    const res = await pay();

    expect(res.status).toBe(200);
    expect(mocks.updatePayment).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "failed" },
    });
    expect(mocks.createSession).toHaveBeenCalledWith(expect.anything(), {
      idempotencyKey: "checkout-session:ORD-1:1",
    });
  });

  it("refuses to open a second session while the first is complete and settling", async () => {
    mocks.findPayment.mockResolvedValue({ id: "p1", providerTransactionId: "cs_done" });
    mocks.retrieveSession.mockResolvedValue({ id: "cs_done", status: "complete", url: null });

    const res = await pay();

    expect(res.status).toBe(409);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("creates a new session if the previous one can no longer be retrieved", async () => {
    mocks.findPayment.mockResolvedValue({ id: "p1", providerTransactionId: "cs_gone" });
    mocks.retrieveSession.mockRejectedValue(new Error("No such session"));
    mocks.countPayments.mockResolvedValue(1);

    const res = await pay();

    expect(res.status).toBe(200);
    expect(mocks.createSession).toHaveBeenCalledOnce();
  });

  it("does not charge an order that is no longer pending", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, status: "paid" });

    const res = await pay();

    expect(res.status).toBe(400);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
