import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  quoteOrder: vi.fn(),
  cancelExpiredOrders: vi.fn(),
  notifyCancelledOrders: vi.fn(),
  geocodeAndStoreAddress: vi.fn(),
  afterCallbacks: [] as (() => unknown)[],
  txUpdateStock: vi.fn(),
  orderCreated: vi.fn(),
  locale: "en" as string,
}));

// Messages come back in the visitor's language; tests run as an English visitor.
vi.mock("@/lib/i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/i18n/locale")>()),
  getLocale: async () => mocks.locale,
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => mocks.afterCallbacks.push(fn),
}));
vi.mock("@/auth", () => ({ auth: async () => null }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: async () => ({ success: true, remaining: 9 }),
  clientIp: () => "203.0.113.7",
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async () => true }));
vi.mock("@/lib/pricing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/pricing")>()),
  quoteOrder: mocks.quoteOrder,
}));
vi.mock("@/lib/abandoned-orders", () => ({
  cancelExpiredOrders: mocks.cancelExpiredOrders,
  notifyCancelledOrders: mocks.notifyCancelledOrders,
}));
vi.mock("@/lib/geocode-address", () => ({
  geocodeAndStoreAddress: mocks.geocodeAndStoreAddress,
}));
vi.mock("@/lib/db", () => {
  const tx = {
    product: { updateMany: mocks.txUpdateStock },
    address: { create: async () => ({ id: "addr1" }) },
    discountCode: { update: async () => ({}) },
    order: {
      create: async ({ data }: { data: { orderNumber: string } }) => {
        mocks.orderCreated(data);
        return data;
      },
    },
  };
  return { db: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});

import { PricingError } from "@/lib/pricing";
import { POST } from "./route";

const quote = {
  lines: [
    {
      quantity: 1,
      product: {
        id: "p1",
        name: "Ruby Necklace",
        price: 5000,
        trackInventory: true,
        supplierId: null,
        costPrice: null,
      },
    },
  ],
  subtotal: 5000,
  taxAmount: 0,
  taxRatePercent: null,
  shippingAmount: 0,
  discountAmount: 0,
  total: 5000,
  currency: "EUR",
  discountCodeId: null,
  shippingMethod: { id: "ship1" },
};

function checkout(extra: Record<string, unknown> = {}) {
  return POST(
    new Request("https://shop.test/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...extra,
        items: [{ productId: "p1", quantity: 1 }],
        guestEmail: "buyer@example.com",
        address: {
          fullName: "A Buyer",
          street: "Via Roma 1",
          city: "Roma",
          postalCode: "00100",
          country: "IT",
        },
        shippingMethodId: "ship1",
      }),
    })
  );
}

const outOfStock = () => new PricingError("Ruby Necklace only has 0 left in stock", 409);

beforeEach(() => {
  vi.resetAllMocks();
  mocks.locale = "en";
  mocks.afterCallbacks.length = 0;
  mocks.quoteOrder.mockResolvedValue(quote);
  mocks.txUpdateStock.mockResolvedValue({ count: 1 });
});

describe("POST /api/checkout stock conflicts", () => {
  it("places the order normally when stock is available", async () => {
    const res = await checkout();

    expect(res.status).toBe(201);
    expect(mocks.cancelExpiredOrders).not.toHaveBeenCalled();
  });

  it("looks up where the address is after the response, and a failing lookup never fails the order", async () => {
    mocks.geocodeAndStoreAddress.mockRejectedValue(new Error("db down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await checkout();

    expect(res.status).toBe(201);
    expect(mocks.geocodeAndStoreAddress).not.toHaveBeenCalled();
    await Promise.all(mocks.afterCallbacks.map((fn) => fn()));
    expect(mocks.geocodeAndStoreAddress).toHaveBeenCalledWith("addr1");
    consoleError.mockRestore();
  });

  it("remembers the language the customer checked out in, for the emails about the order", async () => {
    mocks.locale = "ja";

    const res = await checkout();

    expect(res.status).toBe(201);
    expect(mocks.orderCreated).toHaveBeenCalledWith(expect.objectContaining({ locale: "ja" }));
  });

  it("releases expired reservations and retries once when an item looks out of stock", async () => {
    mocks.quoteOrder.mockRejectedValueOnce(outOfStock());
    const released = [{ orderNumber: "ORD-OLD", guestEmail: "old@example.com", user: null }];
    mocks.cancelExpiredOrders.mockResolvedValue(released);

    const res = await checkout();

    expect(res.status).toBe(201);
    expect(mocks.quoteOrder).toHaveBeenCalledTimes(2);
    // The released customers are told after this request has been answered.
    expect(mocks.notifyCancelledOrders).not.toHaveBeenCalled();
    mocks.afterCallbacks.forEach((fn) => fn());
    expect(mocks.notifyCancelledOrders).toHaveBeenCalledWith(released);
  });

  it("also retries when the stock decrement itself loses the race", async () => {
    mocks.txUpdateStock.mockResolvedValueOnce({ count: 0 });
    mocks.cancelExpiredOrders.mockResolvedValue([
      { orderNumber: "ORD-OLD", guestEmail: null, user: null },
    ]);

    const res = await checkout();

    expect(res.status).toBe(201);
    expect(mocks.cancelExpiredOrders).toHaveBeenCalledOnce();
  });

  it("reports out-of-stock when there was nothing to release", async () => {
    mocks.quoteOrder.mockRejectedValue(outOfStock());
    mocks.cancelExpiredOrders.mockResolvedValue([]);

    const res = await checkout();

    expect(res.status).toBe(409);
    expect(mocks.quoteOrder).toHaveBeenCalledTimes(1);
  });

  it("does not go looking for expired orders on other pricing errors", async () => {
    mocks.quoteOrder.mockRejectedValue(new PricingError("Invalid discount code", 400));

    const res = await checkout();

    expect(res.status).toBe(400);
    expect(mocks.cancelExpiredOrders).not.toHaveBeenCalled();
  });
});

describe("POST /api/checkout personalised gift card", () => {
  const card = {
    messageType: "preset",
    message: "A little piece of Venice, just for you.",
    recipient: "Sofia",
    sender: "Marco",
    font: "script",
  };

  it("asks for the card to be priced and saves what to print on the order", async () => {
    mocks.quoteOrder.mockResolvedValue({ ...quote, giftCardAmount: 500, total: 5500 });

    const res = await checkout({ giftCard: card });

    expect(res.status).toBe(201);
    expect(mocks.quoteOrder).toHaveBeenCalledWith(expect.objectContaining({ giftCard: true }));
    expect(mocks.orderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        giftCardAmount: 500,
        giftCardMessageType: "preset",
        giftCardMessage: card.message,
        giftCardRecipient: "Sofia",
        giftCardSender: "Marco",
        giftCardFont: "script",
      })
    );
  });

  it("saves the stickers and the back the customer designed", async () => {
    mocks.quoteOrder.mockResolvedValue({ ...quote, giftCardAmount: 500, total: 5500 });
    const stickers = [{ icon: "heart", x: 18.5, y: 22 }];

    const res = await checkout({ giftCard: { ...card, stickers, back: "ruby" } });

    expect(res.status).toBe(201);
    expect(mocks.orderCreated).toHaveBeenCalledWith(
      expect.objectContaining({ giftCardStickers: stickers, giftCardBack: "ruby" })
    );
  });

  it("rejects more than three stickers", async () => {
    const heart = { icon: "heart", x: 50, y: 50 };
    const res = await checkout({ giftCard: { ...card, stickers: [heart, heart, heart, heart] } });
    expect(res.status).toBe(400);
  });

  it("saves no card when the store doesn't charge for one (switched off)", async () => {
    mocks.quoteOrder.mockResolvedValue({ ...quote, giftCardAmount: 0 });

    await checkout({ giftCard: card });

    const data = mocks.orderCreated.mock.calls[0][0];
    expect(data.giftCardMessage).toBeUndefined();
  });

  it("rejects a message longer than the card allows", async () => {
    const res = await checkout({ giftCard: { ...card, message: "x".repeat(201) } });
    expect(res.status).toBe(400);
    expect(mocks.quoteOrder).not.toHaveBeenCalled();
  });
});
