// OAuth sign-ins (Google) never present an authenticator code, so letting them
// into an account that relies on MFA quietly downgrades it to "whatever the
// OAuth provider does": proxy.ts trusts `token.mfaEnabled` from the DB row
// without knowing a code was ever checked. Accounts that need a second factor
// — anyone who enrolled, and always admin/staff — must sign in with password +
// authenticator code instead.
export function oauthSignInBlocked(user: { role: string; mfaEnabled: boolean } | null) {
  if (!user) return false;
  return user.mfaEnabled || user.role === "admin" || user.role === "staff";
}

// Where a blocked OAuth attempt lands; login/page.tsx maps it to a message.
export const OAUTH_BLOCKED_REDIRECT = "/login?error=google-mfa";
