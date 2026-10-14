import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn(), rateLimit: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique: mocks.findUnique } } }));

import { GET } from "./route";

beforeEach(() => {
  mocks.auth.mockReset();
  mocks.findUnique.mockReset();
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true });
});

describe("GET /api/account/export", () => {
  it("requires a signed-in session", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("rate-limits per user before hitting the database", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user1" } });
    mocks.rateLimit.mockResolvedValue({ success: false });

    const response = await GET();

    expect(response.status).toBe(429);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.rateLimit).toHaveBeenCalledWith("account-export:user1", 5, 60_000);
  });

  it("exports the signed-in user's own data", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user1" } });
    mocks.findUnique.mockResolvedValue({
      id: "user1",
      email: "a@example.com",
      name: "A",
      role: "customer",
      createdAt: new Date("2026-01-01"),
      addresses: [],
      orders: [],
      reviews: [],
      consentLogs: [],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user1" } })
    );
    const body = await response.json();
    expect(body.id).toBe("user1");
  });

  it("404s when the session's user no longer exists", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "gone" } });
    mocks.findUnique.mockResolvedValue(null);

    expect((await GET()).status).toBe(404);
  });
});
