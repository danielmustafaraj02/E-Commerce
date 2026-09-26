import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  resetPassword: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/lib/password-reset", async () => {
  const { z } = await import("zod");
  return {
    newPasswordSchema: z.string().min(8).max(72),
    resetPassword: mocks.resetPassword,
  };
});

import { submitNewPassword } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 5 });
});

describe("submitNewPassword", () => {
  it("resets the password and sends the user to sign in", async () => {
    mocks.resetPassword.mockResolvedValue("ok");

    await expect(
      submitNewPassword({ error: null }, form({ token: "t", password: "a-new-password" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.resetPassword).toHaveBeenCalledWith("t", "a-new-password");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/login?reset=1");
  });

  it("reports a dead link", async () => {
    mocks.resetPassword.mockResolvedValue("invalid");

    const result = await submitNewPassword(
      { error: null },
      form({ token: "t", password: "a-new-password" })
    );

    expect(result).toEqual({ error: "invalid" });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each(["short", "x".repeat(73)])(
    "rejects a password outside 8–72 characters (%s)",
    async (password) => {
      const result = await submitNewPassword({ error: null }, form({ token: "t", password }));

      expect(result).toEqual({ error: "weak" });
      expect(mocks.resetPassword).not.toHaveBeenCalled();
    }
  );

  it("rejects a missing token", async () => {
    const result = await submitNewPassword({ error: null }, form({ password: "a-new-password" }));

    expect(result).toEqual({ error: "invalid" });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it("is rate limited", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const result = await submitNewPassword(
      { error: null },
      form({ token: "t", password: "a-new-password" })
    );

    expect(result).toEqual({ error: "generic" });
    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });
});
