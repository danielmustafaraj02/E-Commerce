import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  quoteOrder: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/pricing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/pricing")>()),
  quoteOrder: mocks.quoteOrder,
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  clientIp: () => "203.0.113.7",
}));
vi.mock("@/lib/i18n/feedback", () => ({
  getFeedback: async () => ({
    tooManyRequests: "Too many requests. Please try again shortly.",
    invalidInput: "Please check the details and try again.",
    cartEmpty: "Your cart is empty.",
    productUnavailable: "A product in your cart is no longer available.",
    invalidQuantity: "Invalid quantity for {name}.",
    lowStock: "{name} only has {n} left in stock.",
    shippingUnavailable: "The selected shipping method isn't available for this destination.",
    discountInvalid: "Invalid discount code.",
    discountExpired: "This discount code has expired.",
    discountLimitReached: "This discount code has reached its usage limit.",
  }),
}));

import { POST } from "./route";
import { PricingError } from "@/lib/pricing";

const VALID_BODY = {
  items: [{ productId: "p1", quantity: 2 }],
  country: "IT",
  shippingMethodId: "ship1",
};

function request(body: Record<string, unknown> = VALID_BODY) {
  return POST(
    new Request("https://shop.test/api/checkout/quote", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

const QUOTE = {
  subtotal: 8900,
  taxAmount: 0,
  taxRatePercent: 0,
  missingTaxRule: false,
  shippingAmount: 500,
  freeShipping: false,
  discountAmount: 0,
  bundleDiscountAmount: 0,
  total: 9400,
  currency: "EUR",
  pricesIncludeTax: true,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 19 });
  mocks.quoteOrder.mockResolvedValue(QUOTE);
});

describe("POST /api/checkout/quote", () => {
  it("returns the server-computed quote for a valid request", async () => {
    const res = await request();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(QUOTE);
    expect(mocks.quoteOrder).toHaveBeenCalledWith({
      items: [{ productId: "p1", quantity: 2 }],
      country: "IT",
      shippingMethodId: "ship1",
      discountCode: undefined,
    });
  });

  it("never lets the client's own numbers back out as the quote", async () => {
    // Even if a caller sends bogus totals alongside the real fields, only the
    // server-computed quote fields make it into the response.
    const res = await request({ ...VALID_BODY, total: 1, subtotal: 1 });
    const data = await res.json();

    expect(data.total).toBe(QUOTE.total);
    expect(data.subtotal).toBe(QUOTE.subtotal);
  });

  it("rate-limits repeated quote requests before ever pricing them", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const res = await request();
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data).toEqual({ error: "Too many requests. Please try again shortly." });
    expect(mocks.quoteOrder).not.toHaveBeenCalled();
  });

  it("rejects a malformed body without pricing it", async () => {
    const res = await request({ ...VALID_BODY, country: "ITA" });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Please check the details and try again." });
    expect(mocks.quoteOrder).not.toHaveBeenCalled();
  });

  it("rejects an empty item list without pricing it", async () => {
    const res = await request({ ...VALID_BODY, items: [] });

    expect(res.status).toBe(400);
    expect(mocks.quoteOrder).not.toHaveBeenCalled();
  });

  it("translates a PricingError into the visitor's language and the error's own status", async () => {
    mocks.quoteOrder.mockRejectedValue(
      new PricingError("Discount code has expired", 400, "discount-expired")
    );

    const res = await request();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "This discount code has expired." });
  });

  it("uses the PricingError's own status code, not a hardcoded 400", async () => {
    mocks.quoteOrder.mockRejectedValue(
      new PricingError("A product in your cart is no longer available", 409, "product-unavailable")
    );

    const res = await request();

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "A product in your cart is no longer available." });
  });

  it("does not swallow a non-pricing error as a fake 400", async () => {
    mocks.quoteOrder.mockRejectedValue(new Error("database is down"));

    await expect(request()).rejects.toThrow("database is down");
  });
});
