import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import type { Session } from "next-auth";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  local: vi.fn(),
  owner: vi.fn(),
  allowLocal: vi.fn(),
  host: "localhost:3000",
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/admin-session", () => ({ getLocalAdminSession: mocks.local }));
vi.mock("next/headers", () => ({ headers: async () => ({ get: () => mocks.host }) }));
vi.mock("@/lib/db", () => ({ db: { user: { findFirst: mocks.owner } } }));
vi.mock("@/lib/local-features", () => ({ isLocalAdminAccess: mocks.allowLocal }));
// The passwordless localhost session lives in the untracked .local-only
// workspace; a non-literal import keeps the public type check from needing it.
const LOCAL_SESSION = "../../.local-only/src/admin-session";
const hasLocalSession = existsSync(new URL(`${LOCAL_SESSION}.ts`, import.meta.url));
async function getLocalAdminSession(): Promise<Session | null> {
  const mod = await import(/* @vite-ignore */ LOCAL_SESSION);
  return mod.getLocalAdminSession();
}

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

describe("local control panel", () => {
  it("opens staff and admin controls without reading a login session", async () => {
    const local = {
      user: { id: "existing-owner", role: "admin", mfaEnabled: true },
      expires: "2099-01-01",
    };
    mocks.local.mockResolvedValue(local);
    expect(await requireStaff()).toEqual(local);
    expect(await requireAdmin()).toEqual(local);
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe.skipIf(!hasLocalSession)("private localhost session", () => {
  it("uses an existing admin ID without signing in or changing the database", async () => {
    mocks.allowLocal.mockReturnValue(true);
    mocks.owner.mockResolvedValue({
      id: "existing-owner",
      name: "Owner",
      email: "owner@example.test",
    });
    const session = await getLocalAdminSession();
    expect(session?.user.id).toBe("existing-owner");
    expect(session?.user.role).toBe("admin");
    expect(mocks.owner).toHaveBeenCalledWith(expect.objectContaining({ where: { role: "admin" } }));
    expect(mocks.auth).not.toHaveBeenCalled();
  });
  it("does not read an admin identity when localhost access is disabled", async () => {
    mocks.allowLocal.mockReturnValue(false);
    expect(await getLocalAdminSession()).toBeNull();
    expect(mocks.owner).not.toHaveBeenCalled();
  });
  it("reports a missing owner record instead of inventing an invalid audit ID", async () => {
    mocks.allowLocal.mockReturnValue(true);
    mocks.owner.mockResolvedValue(null);
    await expect(getLocalAdminSession()).rejects.toThrow("no admin user");
  });
});
