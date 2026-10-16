import { msAgo } from "@/lib/time";
import { requireStaff } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin-nav";
import { buildAdminSections } from "@/lib/admin-nav";
import { db } from "@/lib/db";
import { noIndexMetadata } from "@/lib/seo";
import { SiteDocument, siteViewport } from "@/components/site-document";
import "./admin.css";

// Every other private/account-scoped route (cart, checkout, account, login,
// ...) sets this; /admin is robots.txt-disallowed too, but that only blocks
// crawling — it doesn't stop Google from indexing the bare URL if it's ever
// linked from somewhere else. This is the belt to that suspenders.
export const metadata = noIndexMetadata;
export const viewport = siteViewport;

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

  // A root layout of its own (the storefront's is app/[locale]/layout.tsx),
  // with the same document around it.
  return (
    <SiteDocument>
      <AdminShell sections={sections}>{children}</AdminShell>
    </SiteDocument>
  );
}
