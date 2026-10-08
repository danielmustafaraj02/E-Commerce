import type { Session } from "next-auth";

// Production has no local admin implementation. The development bundler
// aliases this module to private workspace code when that code is present.
export async function getLocalAdminSession(): Promise<Session | null> {
  return null;
}
