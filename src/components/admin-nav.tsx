"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto text-sm whitespace-nowrap sm:flex-col sm:overflow-visible">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded px-3 py-2 transition-colors ${
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
