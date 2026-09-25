import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { defaultLocale } from "@/lib/i18n/locale-constants";

// Mandatory for admin/staff before writes, matching proxy.ts's page-level
// gate (src/proxy.ts) — that gate only covers navigation and doesn't run for
// Server Actions, so without this an admin/staff account without MFA set up
// could still invoke every requireStaff()/requireAdmin()-gated mutation.
// session.user.mfaEnabled is re-validated against the DB on every session
// read (see refreshSessionToken/getSessionUserState in src/auth.ts), so this
// needs no extra DB query here.
//
// /admin itself is never locale-prefixed, but /login and /account/mfa are
// ordinary localized customer routes reused here for staff — defaultLocale
// matches proxy.ts's own choice for admin-triggered auth redirects, since
// this is a staff flow, not a visitor whose language preference is known.
function requireMfa(session: { user?: { mfaEnabled?: boolean } } | null) {
  if (!session?.user?.mfaEnabled) {
    redirect(`/${defaultLocale}/account/mfa?required=1`);
  }
}

// Layout-level convenience for the read side. Every *mutating* admin action
// (Server Action or route) must still check role itself — Server Functions
// bypass proxy.ts, so this alone is not a security boundary for writes.
export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "staff") {
    redirect(`/${defaultLocale}/login?callbackUrl=/admin`);
  }
  requireMfa(session);
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect(session ? "/admin" : `/${defaultLocale}/login?callbackUrl=/admin`);
  }
  requireMfa(session);
  return session;
}
