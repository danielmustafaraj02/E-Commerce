import { requireStaff } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireStaff();
  const isAdmin = session?.user?.role === "admin";

  const navGroups = [
    {
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/seo", label: "SEO & Indexing" },
      ],
    },
    {
      label: "Catalog",
      items: [
        { href: "/admin/products", label: "Products" },
        { href: "/admin/categories", label: "Categories" },
        { href: "/admin/suppliers", label: "Suppliers" },
      ],
    },
    {
      label: "Sales",
      items: [
        { href: "/admin/orders", label: "Orders" },
        { href: "/admin/discounts", label: "Discounts" },
        { href: "/admin/returns", label: "Returns" },
        { href: "/admin/shipping", label: "Shipping" },
        { href: "/admin/tax-rules", label: "Tax rules" },
      ],
    },
    {
      label: "Customers",
      items: [
        { href: "/admin/customers", label: "Customers" },
        { href: "/admin/newsletter", label: "Newsletter" },
      ],
    },
    {
      label: "Planning",
      items: [{ href: "/admin/roadmap", label: "Roadmap" }],
    },
    // Split into smaller, single-purpose groups (rather than one long
    // "Configuration" bucket) so the sidebar stays scannable as more
    // admin-only sections get added.
    ...(isAdmin
      ? [
          {
            label: "Security & payments",
            items: [
              { href: "/admin/team", label: "Team & roles" },
              { href: "/admin/settings/payments", label: "Payments" },
            ],
          },
          {
            label: "Integrations",
            items: [{ href: "/admin/settings/integrations", label: "Integrations" }],
          },
          {
            label: "Site",
            items: [
              { href: "/admin/settings", label: "Store settings" },
              { href: "/admin/legal-pages", label: "Legal pages" },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:py-10">
      <aside className="shrink-0 sm:w-44">
        <AdminNav groups={navGroups} />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
