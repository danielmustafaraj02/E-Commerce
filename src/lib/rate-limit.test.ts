import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Without Upstash configured, rateLimit() falls back to an in-memory
// fixed-window limiter (see src/lib/rate-limit.ts) — that fallback is what
// every dev/small-prod deployment actually runs on, so it's worth pinning
// down explicitly rather than only exercising the Redis path.
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: vi.fn().mockResolvedValue({ upstashRedisUrl: null, upstashRedisToken: null }),
}));

const { rateLimit, clientIp } = await import("./rate-limit");

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit (in-memory fallback)", () => {
  it("allows requests up to the limit and denies the next one", async () => {
    const key = `test:${crypto.randomUUID()}`;
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit(key, 3, 60_000);
      expect(result.success).toBe(true);
    }
    const blocked = await rateLimit(key, 3, 60_000);
    expect(blocked.success).toBe(false);
  });

  it("tracks separate keys independently", async () => {
    const keyA = `test:${crypto.randomUUID()}`;
    const keyB = `test:${crypto.randomUUID()}`;
    await rateLimit(keyA, 1, 60_000);
    const blockedA = await rateLimit(keyA, 1, 60_000);
    const allowedB = await rateLimit(keyB, 1, 60_000);

    expect(blockedA.success).toBe(false);
    expect(allowedB.success).toBe(true);
  });

  it("resets once the window elapses", async () => {
    const key = `test:${crypto.randomUUID()}`;
    await rateLimit(key, 1, 60_000);
    const blocked = await rateLimit(key, 1, 60_000);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(60_001);

    const afterReset = await rateLimit(key, 1, 60_000);
    expect(afterReset.success).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads the first IP from X-Forwarded-For", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(clientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to 'unknown' when the header is absent", () => {
    const request = new Request("https://example.com");
    expect(clientIp(request)).toBe("unknown");
  });
});
