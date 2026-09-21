import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Mandatory for admin/staff before writes, matching proxy.ts's page-level
// gate (src/proxy.ts) — that gate only covers navigation and doesn't run for
// Server Actions, so without this an admin/staff account without MFA set up
// could still invoke every requireStaff()/requireAdmin()-gated mutation.
// session.user.mfaEnabled is re-validated against the DB on every session
// read (see refreshSessionToken/getSessionUserState in src/auth.ts), so this
// needs no extra DB query here.
function requireMfa(session: { user?: { mfaEnabled?: boolean } } | null) {
  if (!session?.user?.mfaEnabled) {
    redirect("/account/mfa?required=1");
  }
}

// Layout-level convenience for the read side. Every *mutating* admin action
// (Server Action or route) must still check role itself — Server Functions
// bypass proxy.ts, so this alone is not a security boundary for writes.
export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "staff") {
    redirect("/login?callbackUrl=/admin");
  }
  requireMfa(session);
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect(session ? "/admin" : "/login?callbackUrl=/admin");
  }
  requireMfa(session);
  return session;
}
