import { requireStaff } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireStaff();
  const isAdmin = session?.user?.role === "admin";

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/suppliers", label: "Suppliers" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/newsletter", label: "Newsletter" },
    { href: "/admin/discounts", label: "Discounts" },
    { href: "/admin/returns", label: "Returns" },
    { href: "/admin/shipping", label: "Shipping" },
    { href: "/admin/tax-rules", label: "Tax rules" },
    { href: "/admin/roadmap", label: "Roadmap" },
    ...(isAdmin
      ? [
          { href: "/admin/team", label: "Team" },
          { href: "/admin/settings/payments", label: "Payments" },
          { href: "/admin/settings/integrations", label: "Integrations" },
          { href: "/admin/legal-pages", label: "Legal pages" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:py-10">
      <aside className="shrink-0 sm:w-44">
        <AdminNav items={navItems} />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
