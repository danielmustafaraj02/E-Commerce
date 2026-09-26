import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  deleteToken: vi.fn(),
  updateMany: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));
vi.mock("@/lib/db", () => ({
  db: {
    verificationToken: { findUnique: mocks.findUnique, delete: mocks.deleteToken },
    user: { updateMany: mocks.updateMany },
  },
}));
vi.mock("@/lib/register-user", () => ({
  hashVerificationToken: (token: string) => `hashed:${token}`,
}));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({ siteUrl: "https://example.com" }),
}));

import { GET } from "./route";

const get = (query: string) => GET(new Request(`http://localhost/api/auth/verify-email${query}`));

beforeEach(() => {
  mocks.findUnique.mockReset();
  mocks.deleteToken.mockReset().mockResolvedValue({});
  mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true, remaining: 5 });
});

describe("GET /api/auth/verify-email", () => {
  it("verifies a valid, unexpired token", async () => {
    mocks.findUnique.mockResolvedValue({
      token: "hashed:good",
      identifier: "person@example.com",
      expires: new Date(Date.now() + 60_000),
    });

    const response = await get("?token=good");

    expect(response.headers.get("location")).toBe("https://example.com/account?verified=1");
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { email: "person@example.com" },
      data: { emailVerified: expect.any(Date) },
    });
    expect(mocks.deleteToken).toHaveBeenCalledWith({ where: { token: "hashed:good" } });
  });

  it("redirects with verified=expired for an expired token and deletes it", async () => {
    mocks.findUnique.mockResolvedValue({
      token: "hashed:old",
      identifier: "person@example.com",
      expires: new Date(Date.now() - 60_000),
    });

    const response = await get("?token=old");

    expect(response.headers.get("location")).toBe("https://example.com/account?verified=expired");
    expect(mocks.deleteToken).toHaveBeenCalledWith({ where: { token: "hashed:old" } });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("redirects with verified=0 when there is no token", async () => {
    const response = await get("");
    expect(response.headers.get("location")).toBe("https://example.com/account?verified=0");
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("stops a visitor who asks too often, without touching the DB", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const response = await get("?token=good");

    expect(response.headers.get("location")).toBe("https://example.com/account?verified=0");
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
});
