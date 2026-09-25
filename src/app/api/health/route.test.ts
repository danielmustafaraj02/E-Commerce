import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), rateLimit: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/db", () => ({ db: { storeSettings: { findFirst: mocks.findFirst } } }));

import { GET } from "./route";

beforeEach(() => {
  mocks.findFirst.mockReset().mockResolvedValue({ id: "settings1" });
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true });
});

describe("GET /api/health", () => {
  it("reports ok when the database answers", async () => {
    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("reports an error when the database query fails", async () => {
    mocks.findFirst.mockRejectedValue(new Error("connection lost"));

    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "error" });
  });

  it("rate-limits repeated requests without querying the database", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false });

    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(429);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
