// Admin navigation model: a top bar of sections, each with its own sidebar of
// pages. Kept free of React so the section/active-page rules can be unit
// tested — the components in src/components/admin-nav.tsx only render it.
export type NavItem = { href: string; label: string; badge?: number };
export type AdminSection = { id: string; label: string; items: NavItem[] };

export function buildAdminSections(opts: {
  isAdmin: boolean;
  newOrderCount: number;
  newCustomerCount: number;
}): AdminSection[] {
  const sections: AdminSection[] = [
    {
      id: "overview",
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/seo", label: "SEO & Indexing" },
      ],
    },
    {
      id: "catalog",
      label: "Catalog",
      items: [
        { href: "/admin/products", label: "Products" },
        { href: "/admin/categories", label: "Categories" },
        { href: "/admin/looks", label: "Looks" },
        { href: "/admin/suppliers", label: "Suppliers" },
      ],
    },
    {
      id: "sales",
      label: "Sales",
      items: [
        { href: "/admin/orders", label: "Orders", badge: opts.newOrderCount },
        { href: "/admin/discounts", label: "Discounts" },
        { href: "/admin/returns", label: "Returns" },
        { href: "/admin/shipping", label: "Shipping" },
        { href: "/admin/tax-rules", label: "Tax rules" },
      ],
    },
    {
      id: "customers",
      label: "Customers",
      items: [
        { href: "/admin/customers", label: "Customers", badge: opts.newCustomerCount },
        { href: "/admin/newsletter", label: "Newsletter" },
      ],
    },
    { id: "planning", label: "Planning", items: [{ href: "/admin/roadmap", label: "Roadmap" }] },
  ];

  // Payments, integrations, roles and site content are admin-only (staff can't
  // reach them — see require-admin.ts), so staff don't see the section at all.
  if (opts.isAdmin) {
    sections.push({
      id: "settings",
      label: "Settings",
      items: [
        { href: "/admin/settings", label: "Store settings" },
        { href: "/admin/settings/payments", label: "Payments" },
        { href: "/admin/settings/integrations", label: "Integrations" },
        { href: "/admin/team", label: "Team & roles" },
        { href: "/admin/legal-pages", label: "Legal pages" },
      ],
    });
  }
  return sections;
}

// Does this item's page (or a page nested under it) match the current path?
// "/admin" only matches itself, otherwise every admin page would light it up.
function matches(item: NavItem, pathname: string) {
  if (item.href === "/admin") return pathname === "/admin";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// The most specific matching item wins: /admin/settings/payments belongs to
// "Payments", not to "Store settings" (/admin/settings), even though both
// prefixes match.
export function activeItem(section: AdminSection, pathname: string): NavItem | undefined {
  return section.items
    .filter((item) => matches(item, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function activeSection(sections: AdminSection[], pathname: string): AdminSection {
  let best: { section: AdminSection; length: number } | undefined;
  for (const section of sections) {
    const item = activeItem(section, pathname);
    if (item && (!best || item.href.length > best.length)) {
      best = { section, length: item.href.length };
    }
  }
  return best?.section ?? sections[0];
}

// Total of a section's item badges, shown on its top-bar tab so a new order is
// visible without opening the section.
export function sectionBadge(section: AdminSection): number {
  return section.items.reduce((sum, item) => sum + (item.badge ?? 0), 0);
}

// A lone link in a sidebar is just clutter; such sections get no sidebar.
export function hasSidebar(section: AdminSection): boolean {
  return section.items.length > 1;
}
