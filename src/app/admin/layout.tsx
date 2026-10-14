import { msAgo } from "@/lib/time";
import { requireStaff } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin-nav";
import { buildAdminSections } from "@/lib/admin-nav";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { COLOR_ROLES, CSS_VAR, resolveColors } from "@/lib/site-style";
import { SitePaletteProvider, type Swatch } from "@/components/color-field";
import { noIndexMetadata } from "@/lib/seo";
import "./admin.css";

// Every other private/account-scoped route (cart, checkout, account, login,
// ...) sets this; /admin is robots.txt-disallowed too, but that only blocks
// crawling — it doesn't stop Google from indexing the bare URL if it's ever
// linked from somewhere else. This is the belt to that suspenders.
export const metadata = noIndexMetadata;

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

  // The store's own colours, offered first by every colour control in admin.
  const colors = resolveColors(await getStoreSettings().catch(() => ({})));
  const NAMES = [
    "Background",
    "Surface",
    "Text",
    "Secondary text",
    "Primary",
    "Text on primary",
    "Accent",
    "Border",
  ];
  const swatches: Swatch[] = COLOR_ROLES.map((role, i) => ({
    name: NAMES[i],
    hex: colors[role],
    value: `var(${CSS_VAR[role]})`,
  }));

  return (
    <SitePaletteProvider swatches={swatches}>
      <AdminShell sections={sections}>{children}</AdminShell>
    </SitePaletteProvider>
  );
}
