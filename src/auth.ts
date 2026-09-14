import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";
import { getStoreSettings } from "@/lib/store-settings";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional(),
});

// Lazy (async) config so the Google provider can be enabled/disabled at
// runtime from Admin > Settings > Integrations, falling back to
// GOOGLE_CLIENT_ID/SECRET env vars — no redeploy needed either way.
export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const settings = await getStoreSettings();
  const googleClientId = settings.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

  return {
    adapter: PrismaAdapter(db),
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
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: { increment: 1 },
                ...(user.failedLoginCount + 1 >= 5
                  ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
                  : {}),
              },
            });
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

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        },
      }),
      ...(googleClientId && googleClientSecret
        ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
        : []),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role;
          // Always present in practice — either from Credentials'
          // authorize() (which always returns one) or from the adapter's
          // created User row for OAuth sign-ins. Only optional in the base
          // type because some other provider shapes could theoretically
          // omit it.
          token.id = user.id!;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
  };
});
