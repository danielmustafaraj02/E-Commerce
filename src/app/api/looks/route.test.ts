import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getLooks: vi.fn(), rateLimit: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/look-data", () => ({ getLooksForProducts: mocks.getLooks }));
vi.mock("@/lib/i18n/locale", () => ({ getLocale: async () => "it" }));

import { GET } from "./route";

const get = (query: string) => GET(new Request(`http://localhost/api/looks${query}`));

beforeEach(() => {
  mocks.getLooks.mockReset().mockResolvedValue([{ id: "look1" }]);
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true });
});

describe("GET /api/looks", () => {
  it("returns the looks for the cart's products, in the visitor's language", async () => {
    const response = await get("?productIds=a,b");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ looks: [{ id: "look1" }] });
    expect(mocks.getLooks).toHaveBeenCalledWith(["a", "b"], "it");
  });

  it("caps the number of ids looked up", async () => {
    const ids = Array.from({ length: 80 }, (_, i) => `p${i}`).join(",");
    await get(`?productIds=${ids}`);

    expect(mocks.getLooks.mock.calls[0][0]).toHaveLength(50);
  });

  it("answers an empty list without a lookup", async () => {
    const response = await get("");

    expect(await response.json()).toEqual({ looks: [] });
    expect(mocks.getLooks).not.toHaveBeenCalled();
  });

  it("rate-limits", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false });

    expect((await get("?productIds=a")).status).toBe(429);
  });
});
