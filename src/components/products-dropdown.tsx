"use client";

import Image from "next/image";
import { Link } from "@/components/localized-link";
import { useRef, useState, useEffect, useCallback } from "react";
import "./products-dropdown.css";

interface CategoryLink {
  href: string;
  label: string;
  // The category's thumbnail, borrowed from its newest product (the Category
  // model has no image column). Null when the category has no product with a
  // picture yet — the row then renders as a label only, same as before.
  imageUrl?: string | null;
}

export function ProductsDropdown({
  categories,
  label,
  viewAllLabel,
  eyebrow,
  viewAllHref = "/products",
  locale,
}: {
  categories: CategoryLink[];
  label: string;
  viewAllLabel: string;
  /** The editorial kicker above the list — "Explore the collections". */
  eyebrow?: string;
  viewAllHref?: string;
  locale?: string;
  signedIn?: boolean;
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
        className="nav-link link-underline pd-trigger text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pd-label">{label}</span>
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
        <div className="pd-body">
        <div className="pd-inner">
          {/* The kicker, with the gold hairline the rest of the site uses to
              open an editorial block. Decorative: the links below carry the
              meaning, so it is not announced as a heading. */}
          {eyebrow ? (
            <p className="pd-eyebrow" aria-hidden="true">
              {eyebrow}
            </p>
          ) : null}
          {categories.map((cat, index) => (
            <Link
              key={cat.href}
              href={cat.href}
              role="menuitem"
              /* --i drives the per-row stagger on the menu's entrance. */
              style={{ "--i": index } as React.CSSProperties}
              className={`pd-item${cat.imageUrl ? " pd-item--with-image" : ""}`}
              onClick={() => setOpen(false)}
            >
              {cat.imageUrl ? (
                <span className="pd-thumb" aria-hidden="true">
                  <Image
                    src={cat.imageUrl}
                    alt=""
                    fill
                    /* The plate is a 3rem ≈ 48px square, and the 0.9s hover
                       zoom pushes it to ~52px — so ask the optimizer for a 2x
                       plate (96px). The old "120px" was left over from when
                       this was a big grid tile; keeping it would have shipped
                       roughly double the bytes for no visible gain. */
                    sizes="48px"
                    quality={95}
                    className="object-cover"
                  />
                </span>
              ) : null}
              <span className="pd-item-label">{cat.label}</span>
              {/* The same arrow the footer row carries, so every row reads as
                  a way through rather than only the last one. */}
              <svg
                className="pd-item-arrow"
                width="16"
                height="16"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
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
    </div>
  );
}
