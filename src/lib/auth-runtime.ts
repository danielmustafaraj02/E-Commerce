import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";
import { OAUTH_BLOCKED_REDIRECT, oauthSignInBlocked } from "@/lib/oauth-policy";
import { refreshSessionToken } from "@/lib/session-refresh";
import { getStoreSettings } from "@/lib/store-settings";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional(),
});

// One small primary-key read per request (cache() dedupes the header, layout and
// page each calling auth() in the same render) — the price of being able to
// revoke a stateless JWT. See src/lib/session-refresh.ts.
const getSessionUserState = cache((userId: string) =>
  db.user.findUnique({
    where: { id: userId },
    select: { role: true, mfaEnabled: true, passwordChangedAt: true },
  })
);

// Lazy (async) config so the Google provider can be enabled/disabled at
// runtime from Admin > Settings > Integrations, falling back to
// GOOGLE_CLIENT_ID/SECRET env vars — no redeploy needed either way.
export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const settings = await getStoreSettings();
  const googleClientId = settings.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

  return {
    adapter: PrismaAdapter(db),
    // Derive the base URL from the actual incoming request (Vercel's proxy
    // sets a trustworthy Host header) instead of the fixed NEXTAUTH_URL env
    // var — otherwise a stale/wrong NEXTAUTH_URL silently redirects every
    // post-login visitor to whatever domain that var happens to hold,
    // regardless of which domain/alias they actually signed in from.
    trustHost: true,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(rawCredentials) {
          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) return null;
          const { email, password, totpCode } = parsed.data;

          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;

          if (user.lockedUntil && user.lockedUntil > new Date()) return null;

          const passwordValid = await bcrypt.compare(password, user.passwordHash);
          if (!passwordValid) {
            // Increment atomically and decide on the *returned* count: the
            // `user` row above was read before the (slow) bcrypt compare, so
            // parallel guesses would all see the same stale count and none
            // would ever trip the lock.
            const { failedLoginCount } = await db.user.update({
              where: { id: user.id },
              data: { failedLoginCount: { increment: 1 } },
              select: { failedLoginCount: true },
            });
            if (failedLoginCount >= 5) {
              await db.user.update({
                where: { id: user.id },
                data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
              });
            }
            return null;
          }

          // The authoritative MFA check — the login Server Action's own
          // pre-check is only there to progressively reveal the code field
          // in the UI, not a security boundary by itself.
          if (user.mfaEnabled) {
            if (!user.mfaSecret || !totpCode || !(await verifyMfaToken(user.mfaSecret, totpCode))) {
              return null;
            }
          }

          if (user.failedLoginCount > 0 || user.lockedUntil) {
            await db.user.update({
              where: { id: user.id },
              data: { failedLoginCount: 0, lockedUntil: null },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
          };
        },
      }),
      ...(googleClientId && googleClientSecret
        ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
        : []),
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (!account || account.provider === "credentials") return true;

        // Look the account up by its provider link first (what Auth.js itself
        // uses to find the user), falling back to email for a first sign-in.
        const select = { role: true, mfaEnabled: true } as const;
        const linked = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          select: { user: { select } },
        });
        const existing =
          linked?.user ??
          (user.email ? await db.user.findUnique({ where: { email: user.email }, select }) : null);

        return oauthSignInBlocked(existing) ? OAUTH_BLOCKED_REDIRECT : true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role;
          // Always present in practice — either from Credentials'
          // authorize() (which always returns one) or from the adapter's
          // created User row for OAuth sign-ins. Only optional in the base
          // type because some other provider shapes could theoretically
          // omit it.
          token.id = user.id!;
          // Baked into the JWT at sign-in like `role` — if an admin/staff
          // user enables MFA mid-session, they need to sign in again for
          // proxy.ts's admin gate to see it, same as any other role/session
          // claim here. Regular (non-adapter) `User.mfaEnabled` defaults to
          // false, so this is always a real boolean, never undefined.
          token.mfaEnabled = user.mfaEnabled ?? false;
          token.authAt = Date.now();
          return token;
        }

        // Every later read: re-check against the DB. Returning null ends the
        // session (Auth.js clears the cookie), so a demoted user drops to
        // their new role immediately and a deleted user is signed out.
        return refreshSessionToken(token, await getSessionUserState(token.id));
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.mfaEnabled = token.mfaEnabled as boolean;
        }
        return session;
      },
    },
  };
});
