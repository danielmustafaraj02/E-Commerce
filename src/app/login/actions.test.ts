import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLoginProof, LOGIN_PROOF_COOKIE } from "@/lib/login-proof";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  signIn: vi.fn(),
  findUser: vi.fn(),
  rateLimit: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

// Messages come back in the visitor's language; tests run as an English visitor.
vi.mock("@/lib/i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/i18n/locale")>()),
  getLocale: async () => "en",
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.cookieGet, set: mocks.cookieSet }),
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("@/auth", () => ({ signIn: mocks.signIn }));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique: mocks.findUser } } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mocks.verifyTurnstile }));

import { AuthError } from "next-auth";
import { login } from "./actions";

const EMAIL = "admin@shop.test";
const PASSWORD = "correct horse battery";
const passwordHash = bcrypt.hashSync(PASSWORD, 4);

function form(fields: Record<string, string>) {
  const data = new FormData();
  data.set("email", EMAIL);
  data.set("password", PASSWORD);
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function mfaUser(overrides: Record<string, unknown> = {}) {
  return { email: EMAIL, passwordHash, mfaEnabled: true, lockedUntil: null, ...overrides };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("AUTH_SECRET", "test-secret");
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 9 });
  mocks.verifyTurnstile.mockResolvedValue(true);
  mocks.findUser.mockResolvedValue(mfaUser());
  mocks.signIn.mockResolvedValue(undefined);
});

describe("login: captcha", () => {
  it("still requires the captcha when a totpCode is sent without a proof cookie", async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);

    const result = await login(null, form({ totpCode: "123456" }));

    expect(mocks.verifyTurnstile).toHaveBeenCalledOnce();
    expect(mocks.signIn).not.toHaveBeenCalled();
    expect(result.error).toMatch(/verification failed/i);
  });

  it("requires the captcha when the proof cookie was issued for a different email", async () => {
    mocks.cookieGet.mockReturnValue({ value: createLoginProof("someone-else@shop.test") });
    mocks.verifyTurnstile.mockResolvedValue(false);

    await login(null, form({ totpCode: "123456" }));

    expect(mocks.verifyTurnstile).toHaveBeenCalledOnce();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("waives the captcha on the code step when a valid proof for this email is presented", async () => {
    mocks.cookieGet.mockReturnValue({ value: createLoginProof(EMAIL) });

    await login(null, form({ totpCode: "123456" }));

    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.signIn).toHaveBeenCalledOnce();
  });

  it("checks the captcha on the first step", async () => {
    await login(null, form({}));

    expect(mocks.verifyTurnstile).toHaveBeenCalledOnce();
  });
});

describe("login: MFA pre-check", () => {
  it("asks for the code and issues a proof once the password is right", async () => {
    const result = await login(null, form({}));

    expect(result).toEqual({ error: null, mfaRequired: true });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      LOGIN_PROOF_COOKIE,
      expect.stringMatching(/^\d+\.[0-9a-f]{64}$/),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" })
    );
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("does not act as a password oracle for a locked account", async () => {
    mocks.findUser.mockResolvedValue(mfaUser({ lockedUntil: new Date(Date.now() + 60_000) }));
    mocks.signIn.mockRejectedValue(new AuthError());

    const result = await login(null, form({}));

    expect(result).toEqual({ error: "Invalid email or password.", mfaRequired: false });
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("uses the pre-check again once the lock has expired", async () => {
    mocks.findUser.mockResolvedValue(mfaUser({ lockedUntil: new Date(Date.now() - 60_000) }));

    const result = await login(null, form({}));

    expect(result.mfaRequired).toBe(true);
  });

  it("falls through to signIn (which counts the failure) on a wrong password", async () => {
    mocks.signIn.mockRejectedValue(new AuthError());

    const result = await login(null, form({ password: "wrong password" }));

    expect(mocks.signIn).toHaveBeenCalledOnce();
    expect(mocks.cookieSet).not.toHaveBeenCalled();
    expect(result).toEqual({ error: "Invalid email or password.", mfaRequired: false });
  });
});
