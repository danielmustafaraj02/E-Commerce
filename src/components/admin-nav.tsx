"use client";

import { Link } from "@/components/localized-link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  activeItem,
  activeSection,
  hasSidebar,
  sectionBadge,
  type AdminSection,
} from "@/lib/admin-nav";

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="bg-accent rounded px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
      {count}
    </span>
  );
}

// Top bar = the sections; sidebar = only the pages of the section you're in.
// Client component because both depend on the current path; `children` (the
// server-rendered page) is passed straight through.
export function AdminShell({
  sections,
  children,
}: {
  sections: AdminSection[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = activeSection(sections, pathname);
  const currentItem = activeItem(current, pathname);
  const sidebar = hasSidebar(current);
  // Collapsing the side menu lets the page use the whole width (a bigger preview).
  const [wide, setWide] = useState(false);
  const showSide = sidebar && !wide;

  return (
    <div className="admin-ui flex flex-1 flex-col">
      <nav aria-label="Admin sections" className="border-foreground/10 border-b">
        <ul className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 text-sm whitespace-nowrap">
          {sections.map((section) => {
            const active = section.id === current.id;
            return (
              <li key={section.id}>
                <Link
                  href={section.items[0].href}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 transition-colors ${
                    active
                      ? "border-accent text-accent-deep font-medium"
                      : "text-foreground/70 hover:text-accent-deep border-transparent"
                  }`}
                >
                  {section.label}
                  <Badge count={sectionBadge(section)} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Show/hide control for the side menu, on top of the sidebar/content row.
          Desktop-only, because the sidebar itself only exists from `sm` up. */}
      {sidebar && (
        <div
          className={`mx-auto flex w-full justify-end px-4 pt-4 sm:pt-6 ${
            wide ? "max-w-none" : "max-w-6xl"
          }`}
        >
          <button
            type="button"
            onClick={() => setWide((v) => !v)}
            aria-expanded={!wide}
            aria-controls="admin-side-menu"
            title={wide ? "Show the menu" : "Hide the menu for a bigger page"}
            className="text-foreground/60 hover:text-accent-deep hover:bg-foreground/5 hidden items-center gap-2 rounded px-3 py-1.5 text-xs sm:flex"
          >
            <span aria-hidden="true">{wide ? "☰" : "⇤"}</span>
            {wide ? "Show menu" : "Hide menu"}
          </button>
        </div>
      )}

      <div
        className={`mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:py-10 ${
          wide || !sidebar ? "max-w-none" : "max-w-6xl"
        }`}
      >
        {showSide && (
          <aside className="shrink-0 sm:w-44">
            <nav
              id="admin-side-menu"
              aria-label={`${current.label} pages`}
              className="flex gap-1 overflow-x-auto text-sm whitespace-nowrap sm:flex-col sm:overflow-visible"
            >
              {current.items.map((item) => {
                const active = item.href === currentItem?.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`admin-sidebar-link flex items-center gap-2 rounded px-3 py-2 transition-colors ${
                      active
                        ? "bg-accent/10 text-accent-deep font-medium"
                        : "text-foreground/80 hover:bg-foreground/5 hover:text-accent-deep"
                    }`}
                  >
                    {item.label}
                    <Badge count={item.badge ?? 0} />
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
