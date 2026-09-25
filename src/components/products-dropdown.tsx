"use client";

import { Link } from "@/components/localized-link";
import { useRef, useState, useEffect, useCallback } from "react";
import "./products-dropdown.css";

interface CategoryLink {
  href: string;
  label: string;
}

export function ProductsDropdown({
  categories,
  label,
  viewAllLabel,
  viewAllHref = "/products",
}: {
  categories: CategoryLink[];
  label: string;
  viewAllLabel: string;
  viewAllHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Real mouse hover opens/closes on enter/leave; touch has no hover, so it
  // must rely on the button's own onClick below. Gating on pointerType
  // matters because touch synthesizes mouseenter+mouseleave right around a
  // tap for legacy-compatibility reasons — without this guard, a tap opens
  // the panel and a phantom mouseleave closes it again almost immediately,
  // which reads as the button "not working" on a phone.
  const onPointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") show();
    },
    [show]
  );
  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") hide();
    },
    [hide]
  );

  return (
    <div
      ref={containerRef}
      className="pd-root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        className="nav-link link-underline pd-trigger text-foreground/80"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <svg
          className={`pd-chevron${open ? " pd-chevron-open" : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 3.5L5 6.5L7.5 3.5" />
        </svg>
      </button>

      <div className={`pd-panel${open ? " pd-panel-open" : ""}`} role="menu">
        <div className="pd-inner">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              role="menuitem"
              className="pd-item"
              onClick={() => setOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
          <div className="pd-divider" />
          <Link
            href={viewAllHref}
            role="menuitem"
            className="pd-view-all"
            onClick={() => setOpen(false)}
          >
            <span>{viewAllLabel}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7h8M8 4l3 3-3 3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
