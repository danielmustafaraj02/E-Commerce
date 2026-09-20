// The session is a JWT (stateless), so on its own it would keep whatever role
// it was issued with until it expires — a demoted admin, a deleted account, or
// a session predating a password reset would all stay valid for weeks. On every
// session read, auth.ts feeds the token and the user's *current* DB state
// through this to decide what the session is allowed to be right now.
export type SessionUserState = {
  role: string;
  mfaEnabled: boolean;
  passwordChangedAt: Date | null;
};

type TokenShape = { role?: string; mfaEnabled?: boolean; authAt?: number };

// Returns the token with fresh role/MFA claims, or null to end the session.
export function refreshSessionToken<T extends TokenShape>(
  token: T,
  state: SessionUserState | null
): T | null {
  // Account deleted.
  if (!state) return null;

  // Password changed after this session was created (`authAt` is stamped at
  // sign-in, unlike the JWT's own `iat`, which is re-issued on every refresh).
  // A token with no `authAt` predates this check, so it is older than any
  // password change recorded since.
  if (state.passwordChangedAt && (token.authAt ?? 0) < state.passwordChangedAt.getTime()) {
    return null;
  }

  return { ...token, role: state.role, mfaEnabled: state.mfaEnabled };
}
