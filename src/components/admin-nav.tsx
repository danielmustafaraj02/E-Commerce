"use client";

import Link from "next/link";
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
    <span className="bg-primary rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
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

  return (
    <div className="flex flex-1 flex-col">
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
                      ? "border-primary text-primary font-medium"
                      : "text-foreground/70 hover:text-primary border-transparent"
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

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8 sm:py-10">
        {sidebar && (
          <aside className="shrink-0 sm:w-44">
            <nav
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
                    className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
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
