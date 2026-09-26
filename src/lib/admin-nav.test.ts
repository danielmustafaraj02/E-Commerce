import { describe, expect, it } from "vitest";
import {
  activeItem,
  activeSection,
  buildAdminSections,
  hasSidebar,
  sectionBadge,
} from "./admin-nav";

const admin = buildAdminSections({ isAdmin: true, newOrderCount: 3, newCustomerCount: 2 });
const staff = buildAdminSections({ isAdmin: false, newOrderCount: 0, newCustomerCount: 0 });
const section = (id: string) => admin.find((s) => s.id === id)!;

describe("buildAdminSections", () => {
  it("groups pages into top-level sections", () => {
    expect(admin.map((s) => s.id)).toEqual([
      "overview",
      "catalog",
      "sales",
      "customers",
      "planning",
      "settings",
    ]);
  });

  it("hides the admin-only Settings section from staff", () => {
    expect(staff.map((s) => s.id)).not.toContain("settings");
    const staffHrefs = staff.flatMap((s) => s.items.map((i) => i.href));
    expect(staffHrefs).not.toContain("/admin/settings/payments");
    expect(staffHrefs).not.toContain("/admin/team");
  });

  it("lists every admin-only page under Settings for admins", () => {
    expect(section("settings").items.map((i) => i.href)).toEqual([
      "/admin/settings",
      "/admin/settings/payments",
      "/admin/settings/integrations",
      "/admin/team",
      "/admin/legal-pages",
    ]);
  });

  it("puts each page in exactly one section", () => {
    const hrefs = admin.flatMap((s) => s.items.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("activeSection", () => {
  it.each([
    ["/admin", "overview"],
    ["/admin/seo", "overview"],
    ["/admin/products", "catalog"],
    ["/admin/products/abc/edit", "catalog"],
    ["/admin/orders/ORD-1", "sales"],
    ["/admin/shipping/zones/new", "sales"],
    ["/admin/customers/42", "customers"],
    ["/admin/roadmap", "planning"],
    ["/admin/settings", "settings"],
    ["/admin/settings/payments", "settings"],
    ["/admin/legal-pages/terms/edit", "settings"],
  ])("%s belongs to %s", (pathname, id) => {
    expect(activeSection(admin, pathname).id).toBe(id);
  });

  it("falls back to the first section for an unknown admin path", () => {
    expect(activeSection(admin, "/admin/nope").id).toBe("overview");
  });
});

describe("activeItem", () => {
  it("only lights up Dashboard on /admin itself", () => {
    expect(activeItem(section("overview"), "/admin")?.label).toBe("Dashboard");
    expect(activeItem(section("overview"), "/admin/seo")?.label).toBe("SEO & Indexing");
  });

  it("prefers the most specific page: payments is not 'Store settings'", () => {
    expect(activeItem(section("settings"), "/admin/settings/payments")?.label).toBe("Payments");
    expect(activeItem(section("settings"), "/admin/settings")?.label).toBe("Store settings");
  });

  it("does not match a page whose name merely starts the same", () => {
    expect(activeItem(section("catalog"), "/admin/products-archive")).toBeUndefined();
  });
});

describe("badges and sidebars", () => {
  it("adds a section's item badges up for its top-bar tab", () => {
    expect(sectionBadge(section("sales"))).toBe(3);
    expect(sectionBadge(section("customers"))).toBe(2);
    expect(sectionBadge(section("catalog"))).toBe(0);
  });

  it("gives a section a sidebar only when it has more than one page", () => {
    expect(hasSidebar(section("catalog"))).toBe(true);
    expect(hasSidebar(section("planning"))).toBe(false);
  });
});
