import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findOrder: vi.fn(),
  createPayment: vi.fn(),
  getStoreSettings: vi.fn(),
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
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: mocks.getStoreSettings }));

import { POST } from "./route";

const ORDER = {
  id: "o1",
  orderNumber: "ORD-1",
  status: "pending",
  userId: null, // guest order: the order number is the bearer token
  total: 5167,
  currency: "EUR",
};

const SETTINGS = {
  bankTransferEnabled: true,
  bankIban: "IT60X0542811101000000123456",
  bankBic: "BPMOIT22",
  bankAccountHolder: "Perla Murano Glass Srl",
};

function pay(body: unknown = { orderNumber: "ORD-1" }) {
  return POST(
    new Request("https://shop.test/api/checkout/pay/bank-transfer", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue(null);
  mocks.findOrder.mockResolvedValue(ORDER);
  mocks.getStoreSettings.mockResolvedValue(SETTINGS);
  mocks.createPayment.mockResolvedValue({ id: "pay1" });
});

describe("bank-transfer pay route", () => {
  it("returns the bank details and records a pending payment for a pending guest order", async () => {
    const res = await pay();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      bankAccountHolder: SETTINGS.bankAccountHolder,
      bankIban: SETTINGS.bankIban,
      bankBic: SETTINGS.bankBic,
      reference: "ORD-1",
      amount: ORDER.total,
      currency: ORDER.currency,
    });
    expect(mocks.createPayment).toHaveBeenCalledWith({
      data: {
        orderId: "o1",
        provider: "bank_transfer",
        status: "pending",
        amount: ORDER.total,
        currency: ORDER.currency,
      },
    });
  });

  it("rejects a request with no order number", async () => {
    const res = await pay({});

    expect(res.status).toBe(400);
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("hides an account-linked order from a visitor who doesn't own it", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, userId: "owner" });

    const res = await pay();

    expect(res.status).toBe(404);
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("404s when the order doesn't exist", async () => {
    mocks.findOrder.mockResolvedValue(null);

    const res = await pay();

    expect(res.status).toBe(404);
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("refuses to reissue bank details for an order that isn't pending anymore", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, status: "paid" });

    const res = await pay();

    expect(res.status).toBe(400);
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("refuses bank transfer when the store hasn't configured it, even for a valid pending order", async () => {
    mocks.getStoreSettings.mockResolvedValue({ ...SETTINGS, bankTransferEnabled: false });

    const res = await pay();

    expect(res.status).toBe(503);
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("refuses bank transfer when enabled but no IBAN has been entered", async () => {
    mocks.getStoreSettings.mockResolvedValue({ ...SETTINGS, bankIban: null });

    const res = await pay();

    expect(res.status).toBe(503);
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });

  it("lets the owning account pay its own order", async () => {
    mocks.findOrder.mockResolvedValue({ ...ORDER, userId: "u1" });
    mocks.auth.mockResolvedValue({ user: { id: "u1", role: "customer" } });

    const res = await pay();

    expect(res.status).toBe(200);
    expect(mocks.createPayment).toHaveBeenCalledOnce();
  });
});
