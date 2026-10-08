import { auth } from "@/auth";
import { getLocalAdminSession } from "@/lib/admin-session";

/** True when the page was opened by the admin's live preview
 *  (`?layoutPreview=1`). Only an admin session is ever honoured, so visitors
 *  adding the flag get the normal page. */
export async function isLayoutPreview(
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  if ((await searchParams).layoutPreview !== "1") return false;
  if (await getLocalAdminSession()) return true;
  const session = await auth();
  return session?.user?.role === "admin";
}
