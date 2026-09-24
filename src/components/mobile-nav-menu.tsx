"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type NavLink = { href: string; label: string };

// Replaces the horizontally-scrolling category row on phones (sm:hidden) —
// tapping it opens a full-screen list instead of asking someone to swipe to
// see everything. Desktop is untouched: header.tsx keeps the original inline
// row there, and this component's own trigger button is hidden at sm+.
export function MobileNavMenu({
  links,
  menuLabel,
  closeLabel,
  searchPlaceholder,
  searchLabel,
}: {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
  searchPlaceholder: string;
  searchLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // Only true after mount: document.body doesn't exist during the server
  // render, so the portal below has to wait a tick before it can target it.
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    // Deliberate: document.body doesn't exist during the server render, so
    // the portal can only target it after mount. Same pattern (and the same
    // reason the lint rule's advice doesn't apply here) as CookieConsent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const trigger = triggerRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Icon-only trigger: sits in the compact hamburger–logo–cart row
          (header.tsx) so the header doesn't eat much vertical space and the
          logo stays centered as the visual focus. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={menuLabel}
        className="btn-secondary shrink-0 !px-3 sm:hidden"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open &&
        mounted &&
        createPortal(
          // Portaled straight to <body>: header.tsx's <header> has
          // backdrop-blur (a backdrop-filter), and a filter/backdrop-filter
          // on any ancestor creates a new containing block for position:fixed
          // descendants — so nested here, "fixed inset-0" would only cover
          // the header's own box instead of the real viewport. Rendering
          // outside that subtree sidesteps it entirely.
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="animate-fade-up bg-background fixed inset-0 z-[60] flex flex-col overflow-y-auto sm:hidden"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="flex items-center justify-end p-3">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="text-foreground/70 hover:text-accent flex size-11 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {/* Search moved here from the compact mobile header row so the
                logo can stay the visual focus there. */}
            <form
              action="/products"
              method="GET"
              role="search"
              className="relative flex items-center px-6 pb-4"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-foreground/50 pointer-events-none absolute start-9.5"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6.5" />
                <path d="M18 18l-4-4" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                enterKeyHint="search"
                autoComplete="off"
                className="field w-full min-w-0 rounded-full ps-11 pe-14 text-base shadow-sm"
              />
              <button
                type="submit"
                aria-label={searchLabel}
                className="bg-accent hover:bg-accent-deep active:bg-accent-deep absolute end-7 flex size-11 items-center justify-center rounded-full text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rtl:rotate-180"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
            <nav className="flex flex-1 flex-col gap-1 px-6 pb-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-foreground/10 text-foreground hover:text-accent border-b py-4 text-xl font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
