import { timingSafeEqual } from "node:crypto";

// Plain `authHeader !== \`Bearer ${secret}\`` compares byte-by-byte and
// returns as soon as it finds a mismatch, so how long the check takes leaks
// how many leading characters were right — a timing side-channel an attacker
// could use to guess a long-lived service token one byte at a time. Same
// technique as lib/login-proof.ts uses for the MFA login-step cookie.
export function isValidBearerToken(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authHeader);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
