import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));

import { requireStaff, requireAdmin } from "./require-admin";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("requireStaff", () => {
  it("redirects signed-out visitors to login", async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/login?callbackUrl=/admin");
  });

  it("redirects a customer role", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "customer", mfaEnabled: false } });
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/login?callbackUrl=/admin");
  });

  it("redirects staff/admin without completed MFA to enroll", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "staff", mfaEnabled: false } });
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/account/mfa?required=1");
  });

  it("allows staff/admin with MFA on", async () => {
    const session = { user: { role: "staff", mfaEnabled: true } };
    mocks.auth.mockResolvedValue(session);
    await expect(requireStaff()).resolves.toBe(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  it("redirects a signed-in non-admin to /admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "staff", mfaEnabled: true } });
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/admin");
  });

  it("redirects an admin without completed MFA to enroll", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "admin", mfaEnabled: false } });
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/account/mfa?required=1");
  });

  it("allows an admin with MFA on", async () => {
    const session = { user: { role: "admin", mfaEnabled: true } };
    mocks.auth.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toBe(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
