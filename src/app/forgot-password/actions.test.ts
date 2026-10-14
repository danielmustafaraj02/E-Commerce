import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  afterCallbacks: [] as (() => Promise<void>)[],
  rateLimit: vi.fn(),
  verifyTurnstile: vi.fn(),
  requestPasswordReset: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("next/server", () => ({
  after: (fn: () => Promise<void>) => mocks.afterCallbacks.push(fn),
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mocks.verifyTurnstile }));
vi.mock("@/lib/password-reset", () => ({ requestPasswordReset: mocks.requestPasswordReset }));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));

import { requestReset } from "./actions";

const idle = { status: "idle", error: null } as const;

function form(email: string) {
  const data = new FormData();
  data.set("email", email);
  return data;
}

async function runAfter() {
  for (const fn of mocks.afterCallbacks) await fn();
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.afterCallbacks.length = 0;
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 1 });
  mocks.verifyTurnstile.mockResolvedValue(true);
});

describe("requestReset", () => {
  it("answers 'sent' and does the account lookup only after responding", async () => {
    const result = await requestReset(idle, form("a@example.com"));

    expect(result).toEqual({ status: "sent", error: null });
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();

    await runAfter();
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith("a@example.com");
  });

  it("gives the identical answer for any address (no way to tell which have accounts)", async () => {
    const known = await requestReset(idle, form("known@example.com"));
    const unknown = await requestReset(idle, form("unknown@example.com"));

    expect(unknown).toEqual(known);
  });

  it("still answers 'sent' but sends nothing once one address has been requested too often", async () => {
    mocks.rateLimit
      .mockResolvedValueOnce({ success: true, remaining: 1 }) // per-IP
      .mockResolvedValueOnce({ success: false, remaining: 0 }); // per-email

    const result = await requestReset(idle, form("a@example.com"));

    expect(result.status).toBe("sent");
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("rejects a flooding IP", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ success: false, remaining: 0 });

    const result = await requestReset(idle, form("a@example.com"));

    expect(result).toEqual({ status: "error", error: "generic" });
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("rejects a failed captcha", async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);

    const result = await requestReset(idle, form("a@example.com"));

    expect(result.status).toBe("error");
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("rejects a malformed address", async () => {
    const result = await requestReset(idle, form("not-an-email"));

    expect(result.status).toBe("error");
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it("reports a failure in the background work instead of surfacing it to the user", async () => {
    mocks.requestPasswordReset.mockRejectedValue(new Error("db down"));

    const result = await requestReset(idle, form("a@example.com"));
    await runAfter();

    expect(result.status).toBe("sent");
    expect(mocks.captureError).toHaveBeenCalledOnce();
  });
});
