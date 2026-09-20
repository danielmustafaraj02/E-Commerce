import { msAgo } from "@/lib/time";
import { requireStaff } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin-nav";
import { buildAdminSections } from "@/lib/admin-nav";
import { db } from "@/lib/db";

// Rolling 24h window rather than a per-admin "last seen" marker — no schema
// change or per-user read state needed, at the cost of the badge not being
// dismissible. Good enough for "did anything happen recently" at this scale.
const NOTIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireStaff();
  const isAdmin = session?.user?.role === "admin";

  const since = msAgo(NOTIFICATION_WINDOW_MS);
  const [newOrderCount, newCustomerCount] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: since } } }),
    db.user.count({ where: { role: "customer", createdAt: { gte: since } } }),
  ]);

  const sections = buildAdminSections({ isAdmin, newOrderCount, newCustomerCount });

  return <AdminShell sections={sections}>{children}</AdminShell>;
}
