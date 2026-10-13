"use client";

import { useEffect, useRef, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * The listing's filter form, applied as soon as a filter changes: a tick, a
 * colour, or letting go of a price handle (the slider asks for it with
 * requestSubmit). The new address replaces the page in a transition and the
 * page keeps its scroll position; while it loads, the listing is marked
 * `data-pending` so its grid can dim.
 *
 * The ticks are uncontrolled, so after any navigation (a chip removed above
 * the grid, "clear filters", back/forward) they are re-set from `selected`,
 * the page's current filters as a query string.
 * Without JavaScript it is still a plain GET form, with its own button.
 */
export function FilterForm({
  selected,
  className,
  children,
}: {
  selected: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    form.current?.closest(".shop-layout")?.toggleAttribute("data-pending", pending);
  }, [pending]);

  useEffect(() => {
    const params = new URLSearchParams(selected);
    for (const input of form.current?.querySelectorAll<HTMLInputElement>("input[type=checkbox][name]") ?? []) {
      input.checked = params.getAll(input.name).includes(input.value);
    }
  }, [selected]);

  const apply = () => {
    if (!form.current) return;
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(form.current)) {
      if (typeof value === "string" && value !== "") params.append(name, value);
    }
    // No `page`: a new selection starts from its first page.
    const query = params.toString();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  return (
    <form
      ref={form}
      method="GET"
      className={className}
      onChange={apply}
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      {children}
    </form>
  );
}
