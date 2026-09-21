import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  geocodeAddress: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/geocode-address", () => ({
  geocoderUserAgent: async () => "Shop (hi@example.com)",
}));
vi.mock("@/lib/geocode", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/geocode")>()),
  geocodeAddress: mocks.geocodeAddress,
}));

import { GeocodeUnavailable } from "@/lib/geocode";
import { POST } from "./route";

const address = { street: "Via Roma 1", city: "Roma", postalCode: "00100", country: "IT" };

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/geocode", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );

beforeEach(() => {
  mocks.geocodeAddress.mockReset();
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true, remaining: 5 });
});

describe("POST /api/geocode", () => {
  it("returns the place for an address it can find", async () => {
    mocks.geocodeAddress.mockResolvedValue({
      lat: 41.9,
      lng: 12.5,
      label: "Via Roma",
      precision: "street",
    });

    const response = await post(address);

    expect(await response.json()).toEqual({
      status: "found",
      lat: 41.9,
      lng: 12.5,
      label: "Via Roma",
      precision: "street",
    });
    expect(mocks.geocodeAddress).toHaveBeenCalledWith(address, {
      userAgent: "Shop (hi@example.com)",
    });
  });

  it("says not-found when there is no match", async () => {
    mocks.geocodeAddress.mockResolvedValue(null);
    expect(await (await post(address)).json()).toEqual({ status: "not-found" });
  });

  it("says unavailable, not not-found, when the geocoder is down", async () => {
    mocks.geocodeAddress.mockRejectedValue(new GeocodeUnavailable("down"));
    expect(await (await post(address)).json()).toEqual({ status: "unavailable" });
  });

  it("rejects a malformed request without calling the geocoder", async () => {
    expect((await post({ ...address, country: "ITA" })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect(mocks.geocodeAddress).not.toHaveBeenCalled();
  });

  it("stops a visitor who asks too often, or everyone asking too often together", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ success: false, remaining: 0 });
    mocks.rateLimit.mockResolvedValueOnce({ success: true, remaining: 1 });

    const response = await post(address);

    expect(response.status).toBe(429);
    expect(mocks.geocodeAddress).not.toHaveBeenCalled();
  });
});
