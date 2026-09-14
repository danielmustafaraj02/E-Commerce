import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Layout-level convenience for the read side. Every *mutating* admin action
// (Server Action or route) must still check role itself — Server Functions
// bypass proxy.ts, so this alone is not a security boundary for writes.
export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "staff") {
    redirect("/login?callbackUrl=/admin");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect(session ? "/admin" : "/login?callbackUrl=/admin");
  }
  return session;
}

// MFA enrollment is optional for now (mandatory enforcement removed on
// request — the spec's §11.2 recommendation was to require it before a real
// go-live, but it was blocking normal dev/admin use). The feature itself is
// untouched: anyone can still enable it from /account/mfa, and login still
// requires the code for accounts that have it on. Re-add a call to this if
// you want it mandatory again:
//
//   const user = await db.user.findUnique({ where: { id: userId }, select: { mfaEnabled: true } });
//   if (!user?.mfaEnabled) redirect("/account/mfa");
