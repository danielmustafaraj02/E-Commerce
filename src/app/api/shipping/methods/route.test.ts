import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/db", () => ({ db: { shippingZone: { findFirst: mocks.findFirst } } }));

import { GET } from "./route";

const get = (query: string) => GET(new Request(`http://localhost/api/shipping/methods${query}`));

beforeEach(() => {
  mocks.findFirst.mockReset().mockResolvedValue(null);
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true, remaining: 5 });
});

describe("GET /api/shipping/methods", () => {
  it("looks up methods for a valid country code", async () => {
    mocks.findFirst.mockResolvedValue({
      methods: [{ method: { id: "m1", active: true } }, { method: { id: "m2", active: false } }],
    });

    const response = await get("?country=fr");

    expect(response.status).toBe(200);
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { countries: { some: { country: "FR" } } } })
    );
    expect(await response.json()).toEqual({ methods: [{ id: "m1", active: true }] });
  });

  it("rejects a missing country", async () => {
    const response = await get("");
    expect(response.status).toBe(400);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a country that isn't a 2-letter code", async () => {
    expect((await get("?country=USA")).status).toBe(400);
    expect((await get("?country=1")).status).toBe(400);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("stops a visitor who requests too often", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const response = await get("?country=FR");

    expect(response.status).toBe(429);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
