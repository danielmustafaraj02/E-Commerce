import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createMany: vi.fn(),
  auth: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/db", () => ({ db: { consentLog: { createMany: mocks.createMany } } }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/consent", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );

beforeEach(() => {
  mocks.createMany.mockReset().mockResolvedValue({ count: 3 });
  mocks.auth.mockReset().mockResolvedValue(null);
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true, remaining: 5 });
});

describe("POST /api/consent", () => {
  it("logs consent for a guest and sets an anonymous id cookie", async () => {
    const response = await post({ analytics: true, marketing: false });

    expect(response.status).toBe(200);
    expect(mocks.createMany).toHaveBeenCalledOnce();
    const body = await response.json();
    expect(typeof body.anonymousId).toBe("string");
    expect(response.cookies.get("anonymous_id")?.value).toBe(body.anonymousId);
  });

  it("logs consent for a signed-in user without an anonymous id", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });

    const response = await post({ analytics: true, marketing: true });

    expect(await response.json()).toEqual({});
    expect(response.cookies.get("anonymous_id")).toBeUndefined();
    expect(mocks.createMany).toHaveBeenCalledWith({
      data: [
        { userId: "user_1", anonymousId: undefined, consentType: "functional", granted: true },
        { userId: "user_1", anonymousId: undefined, consentType: "analytics", granted: true },
        { userId: "user_1", anonymousId: undefined, consentType: "marketing", granted: true },
      ],
    });
  });

  it("rejects malformed input without writing anything", async () => {
    expect((await post({ analytics: "yes", marketing: false })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect(mocks.createMany).not.toHaveBeenCalled();
  });

  it("rejects an anonymousId that's too long", async () => {
    const response = await post({ analytics: true, marketing: false, anonymousId: "x".repeat(101) });
    expect(response.status).toBe(400);
    expect(mocks.createMany).not.toHaveBeenCalled();
  });

  it("stops a visitor who posts too often", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const response = await post({ analytics: true, marketing: false });

    expect(response.status).toBe(429);
    expect(mocks.createMany).not.toHaveBeenCalled();
  });
});
