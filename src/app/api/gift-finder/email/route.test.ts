import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  findMany: vi.fn(),
  sendEmail: vi.fn(),
  getStoreSettings: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/db", () => ({ db: { product: { findMany: mocks.findMany } } }));
vi.mock("@/lib/email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/i18n/locale", () => ({ getLocale: async () => "en" }));
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: mocks.getStoreSettings }));

import { POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/gift-finder/email", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true });
  mocks.sendEmail.mockReset().mockResolvedValue(undefined);
  mocks.getStoreSettings.mockReset().mockResolvedValue({ siteUrl: "https://example.com" });
  mocks.findMany
    .mockReset()
    .mockResolvedValue([
      {
        id: "p1",
        slug: "collana-fiore",
        name: "Collana Fiore",
        nameEn: "Flower Necklace",
        price: 8900,
        currency: "EUR",
      },
    ]);
});

describe("POST /api/gift-finder/email", () => {
  it("sends an email built only from the product names/links looked up server-side", async () => {
    const response = await post({ email: "shopper@example.com", productIds: ["p1"] });

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["p1"] }, active: true } })
    );
    const call = mocks.sendEmail.mock.calls[0][0];
    expect(call.to).toBe("shopper@example.com");
    expect(call.text).toContain("Flower Necklace");
    expect(call.text).toContain("https://example.com/products/collana-fiore");
    expect(call.html).toContain("Flower Necklace");
  });

  it("rejects an invalid email address without sending anything", async () => {
    const response = await post({ email: "not-an-email", productIds: ["p1"] });

    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects more than 3 product ids", async () => {
    const response = await post({ email: "shopper@example.com", productIds: ["a", "b", "c", "d"] });

    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects an empty product id list", async () => {
    const response = await post({ email: "shopper@example.com", productIds: [] });

    expect(response.status).toBe(400);
  });

  it("answers 400 when none of the ids resolve to a real, active product", async () => {
    mocks.findMany.mockResolvedValue([]);

    const response = await post({ email: "shopper@example.com", productIds: ["missing"] });

    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("is rate-limited per IP", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false });

    const response = await post({ email: "shopper@example.com", productIds: ["p1"] });

    expect(response.status).toBe(429);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("limits how often one inbox can be sent picks, whatever the sender's IP", async () => {
    mocks.rateLimit.mockImplementation(async (key: string) => ({
      success: key !== "gift-finder-email-to:shopper@example.com",
    }));

    const response = await post({ email: "Shopper@Example.com", productIds: ["p1"] });

    expect(response.status).toBe(429);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("caps the total number of emails sent", async () => {
    mocks.rateLimit.mockImplementation(async (key: string) => ({
      success: key !== "gift-finder-email:all",
    }));

    const response = await post({ email: "shopper@example.com", productIds: ["p1"] });

    expect(response.status).toBe(429);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("answers 400 (not a 500) when the request body isn't valid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/gift-finder/email", { method: "POST", body: "not json" })
    );

    expect(response.status).toBe(400);
  });
});
