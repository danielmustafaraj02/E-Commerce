import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  deleteManyTokens: vi.fn(),
  createToken: vi.fn(),
  findToken: vi.fn(),
  txFindToken: vi.fn(),
  txDeleteManyTokens: vi.fn(),
  txUpdateManyUsers: vi.fn(),
  sendResetEmail: vi.fn(),
  sendChangedEmail: vi.fn(),
}));

vi.mock("bcryptjs", () => ({ default: { hash: async () => "HASHED_PASSWORD" } }));
vi.mock("@/lib/db", () => {
  const tx = {
    verificationToken: { findUnique: mocks.txFindToken, deleteMany: mocks.txDeleteManyTokens },
    user: { updateMany: mocks.txUpdateManyUsers },
  };
  return {
    db: {
      user: { findUnique: mocks.findUser },
      verificationToken: {
        deleteMany: mocks.deleteManyTokens,
        create: mocks.createToken,
        findUnique: mocks.findToken,
      },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({ siteUrl: "https://shop.test" }),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmailMessage: mocks.sendResetEmail,
  sendPasswordChangedEmail: mocks.sendChangedEmail,
}));

import {
  hashResetToken,
  isResetTokenValid,
  requestPasswordReset,
  resetPassword,
} from "./password-reset";

const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("requestPasswordReset", () => {
  it("does nothing for an address with no account", async () => {
    mocks.findUser.mockResolvedValue(null);

    await requestPasswordReset("nobody@example.com");

    expect(mocks.createToken).not.toHaveBeenCalled();
    expect(mocks.sendResetEmail).not.toHaveBeenCalled();
  });

  it("does nothing for an OAuth-only account that has no password", async () => {
    mocks.findUser.mockResolvedValue({ email: "g@example.com", passwordHash: null });

    await requestPasswordReset("g@example.com");

    expect(mocks.createToken).not.toHaveBeenCalled();
    expect(mocks.sendResetEmail).not.toHaveBeenCalled();
  });

  it("emails a link and stores only the hash of its token", async () => {
    mocks.findUser.mockResolvedValue({ email: "a@example.com", passwordHash: "x" });

    await requestPasswordReset("a@example.com");

    const emailed = mocks.sendResetEmail.mock.calls[0][0];
    const rawToken = new URL(emailed.resetUrl).searchParams.get("token")!;
    expect(emailed.resetUrl.startsWith("https://shop.test/reset-password?token=")).toBe(true);
    expect(emailed.to).toBe("a@example.com");
    expect(emailed.expiresInMinutes).toBe(60);

    const stored = mocks.createToken.mock.calls[0][0].data;
    expect(stored.token).toBe(hashResetToken(rawToken));
    expect(stored.token).not.toBe(rawToken);
    expect(stored.identifier).toBe("password-reset:a@example.com");
    expect(stored.expires.getTime()).toBeGreaterThan(Date.now() + 59 * 60_000);
  });

  it("replaces any earlier outstanding link for the same account", async () => {
    mocks.findUser.mockResolvedValue({ email: "a@example.com", passwordHash: "x" });

    await requestPasswordReset("a@example.com");

    expect(mocks.deleteManyTokens).toHaveBeenCalledWith({
      where: { identifier: "password-reset:a@example.com" },
    });
  });

  it("issues a different token each time", async () => {
    mocks.findUser.mockResolvedValue({ email: "a@example.com", passwordHash: "x" });

    await requestPasswordReset("a@example.com");
    await requestPasswordReset("a@example.com");

    const [first, second] = mocks.sendResetEmail.mock.calls.map((c) => c[0].resetUrl);
    expect(first).not.toBe(second);
  });
});

describe("resetPassword", () => {
  const record = (overrides = {}) => ({
    identifier: "password-reset:a@example.com",
    token: "h",
    expires: future(),
    ...overrides,
  });

  beforeEach(() => {
    mocks.txFindToken.mockResolvedValue(record());
    mocks.txDeleteManyTokens.mockResolvedValue({ count: 1 });
    mocks.txUpdateManyUsers.mockResolvedValue({ count: 1 });
  });

  it("sets the new password, ends old sessions, clears the lockout and sends a notice", async () => {
    const result = await resetPassword("raw-token", "a-new-password");

    expect(result).toBe("ok");
    expect(mocks.txFindToken).toHaveBeenCalledWith({
      where: { token: hashResetToken("raw-token") },
    });
    const update = mocks.txUpdateManyUsers.mock.calls[0][0];
    expect(update.where).toEqual({ email: "a@example.com" });
    expect(update.data).toMatchObject({
      passwordHash: "HASHED_PASSWORD",
      failedLoginCount: 0,
      lockedUntil: null,
    });
    expect(update.data.passwordChangedAt).toBeInstanceOf(Date);
    expect(mocks.sendChangedEmail).toHaveBeenCalledWith("a@example.com");
  });

  it("rejects an unknown token", async () => {
    mocks.txFindToken.mockResolvedValue(null);

    expect(await resetPassword("nope", "a-new-password")).toBe("invalid");
    expect(mocks.txUpdateManyUsers).not.toHaveBeenCalled();
  });

  it("rejects an email-verification token used as a reset token", async () => {
    mocks.txFindToken.mockResolvedValue(record({ identifier: "a@example.com" }));

    expect(await resetPassword("verify-token", "a-new-password")).toBe("invalid");
    expect(mocks.txUpdateManyUsers).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    mocks.txFindToken.mockResolvedValue(record({ expires: past() }));

    expect(await resetPassword("raw-token", "a-new-password")).toBe("invalid");
    expect(mocks.txUpdateManyUsers).not.toHaveBeenCalled();
  });

  it("is single-use: a second submission that loses the claim is rejected", async () => {
    mocks.txDeleteManyTokens.mockResolvedValue({ count: 0 });

    expect(await resetPassword("raw-token", "a-new-password")).toBe("invalid");
    expect(mocks.txUpdateManyUsers).not.toHaveBeenCalled();
    expect(mocks.sendChangedEmail).not.toHaveBeenCalled();
  });

  it("rejects when the account no longer exists", async () => {
    mocks.txUpdateManyUsers.mockResolvedValue({ count: 0 });

    expect(await resetPassword("raw-token", "a-new-password")).toBe("invalid");
    expect(mocks.sendChangedEmail).not.toHaveBeenCalled();
  });

  it("still succeeds if the notice email fails to send", async () => {
    mocks.sendChangedEmail.mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(await resetPassword("raw-token", "a-new-password")).toBe("ok");
  });
});

describe("isResetTokenValid", () => {
  it("accepts a live reset token", async () => {
    mocks.findToken.mockResolvedValue({
      identifier: "password-reset:a@example.com",
      expires: future(),
    });

    expect(await isResetTokenValid("raw")).toBe(true);
    expect(mocks.findToken).toHaveBeenCalledWith({ where: { token: hashResetToken("raw") } });
  });

  it.each([
    ["missing", null],
    ["expired", { identifier: "password-reset:a@example.com", expires: past() }],
    ["not a reset token", { identifier: "a@example.com", expires: future() }],
  ])("rejects a %s token", async (_label, value) => {
    mocks.findToken.mockResolvedValue(value);

    expect(await isResetTokenValid("raw")).toBe(false);
  });
});
