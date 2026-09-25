import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  auth: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  verifyMfaToken: vi.fn(),
  compare: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: mocks.findUnique, update: mocks.update } },
}));
vi.mock("@/lib/mfa", () => ({ verifyMfaToken: mocks.verifyMfaToken }));
vi.mock("bcryptjs", () => ({ default: { compare: mocks.compare } }));
vi.mock("@/lib/i18n/feedback", () => ({
  getFeedback: async () => ({
    notSignedIn: "not-signed-in",
    tooManyAttempts: "too-many-attempts",
    accountNotFound: "account-not-found",
    incorrectPassword: "incorrect-password",
    mfaSetupNotFound: "mfa-setup-not-found",
    invalidMfaCode: "invalid-mfa-code",
    oauthNoMfaPassword: "oauth-no-mfa-password",
  }),
}));

import { confirmMfa, disableMfa } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 5 });
  mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
});

describe("confirmMfa", () => {
  it("enables MFA for a correct code", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-1", mfaSecret: "secret" });
    mocks.verifyMfaToken.mockResolvedValue(true);

    await expect(
      confirmMfa({ error: undefined }, form({ code: "123456" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { mfaEnabled: true },
    });
  });

  it("is rate limited before checking the code", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const result = await confirmMfa({ error: undefined }, form({ code: "123456" }));

    expect(result).toEqual({ error: "too-many-attempts" });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.verifyMfaToken).not.toHaveBeenCalled();
  });

  it("rejects a wrong code without enabling MFA", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-1", mfaSecret: "secret" });
    mocks.verifyMfaToken.mockResolvedValue(false);

    const result = await confirmMfa({ error: undefined }, form({ code: "000000" }));

    expect(result).toEqual({ error: "invalid-mfa-code" });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("requires an active session", async () => {
    mocks.auth.mockResolvedValue(null);

    const result = await confirmMfa({ error: undefined }, form({ code: "123456" }));

    expect(result).toEqual({ error: "not-signed-in" });
    expect(mocks.rateLimit).not.toHaveBeenCalled();
  });
});

describe("disableMfa", () => {
  it("disables MFA for the correct password", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    mocks.compare.mockResolvedValue(true);

    await expect(
      disableMfa({ error: undefined }, form({ password: "correct-password" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { mfaEnabled: false, mfaSecret: null },
    });
  });

  it("is rate limited before checking the password", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const result = await disableMfa({ error: undefined }, form({ password: "guess" }));

    expect(result).toEqual({ error: "too-many-attempts" });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.compare).not.toHaveBeenCalled();
  });

  it("rejects a wrong password without disabling MFA", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    mocks.compare.mockResolvedValue(false);

    const result = await disableMfa({ error: undefined }, form({ password: "wrong" }));

    expect(result).toEqual({ error: "incorrect-password" });
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
