import { createHmac, timingSafeEqual } from "node:crypto";

// Login is two steps for MFA accounts: (1) email + password + captcha, then
// (2) the authenticator code. Turnstile tokens are single-use, so step 2 can't
// present a fresh one — but "a totpCode was submitted" is client-controlled and
// must never be what waives the captcha (any bot could send a dummy code).
//
// Instead, step 1 hands out this short-lived signed proof once the captcha AND
// the password have both checked out, bound to that email. Step 2 waives the
// captcha only when it can present a valid proof for the same email.
export const LOGIN_PROOF_COOKIE = "login-mfa-step";
export const LOGIN_PROOF_TTL_SECONDS = 5 * 60;

function sign(email: string, expiresAt: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret)
    .update(`${LOGIN_PROOF_COOKIE}:${email.toLowerCase()}:${expiresAt}`)
    .digest("hex");
}

export function createLoginProof(email: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + LOGIN_PROOF_TTL_SECONDS;
  return `${expiresAt}.${sign(email, expiresAt)}`;
}

export function verifyLoginProof(email: string, proof: string | undefined, now = Date.now()) {
  if (!proof) return false;
  const parts = proof.split(".");
  if (parts.length !== 2) return false;

  const expiresAt = Number(parts[0]);
  if (!Number.isInteger(expiresAt) || expiresAt < Math.floor(now / 1000)) return false;

  try {
    const expected = Buffer.from(sign(email, expiresAt));
    const given = Buffer.from(parts[1]);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}
