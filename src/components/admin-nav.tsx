"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; badge?: number };
export type NavGroup = { label: string; items: NavItem[] };

export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto text-sm whitespace-nowrap sm:flex-col sm:gap-4 sm:overflow-visible">
      {groups.map((group) => (
        // `contents` on mobile lets these items join the parent's single
        // horizontal scroll row instead of becoming their own block — the
        // grouping (and its label) only becomes visible once the sidebar is
        // actually a sidebar, at the sm breakpoint.
        <div key={group.label} className="contents sm:flex sm:flex-col sm:gap-1">
          <span className="text-foreground/40 hidden px-3 text-xs font-medium tracking-wide uppercase sm:block">
            {group.label}
          </span>
          {group.items.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
                }`}
              >
                {item.label}
                {Boolean(item.badge) && (
                  <span className="bg-primary rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
