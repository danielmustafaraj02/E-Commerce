"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SocialLinks, type SocialUrls } from "@/components/social-links";
import { BrandSignature } from "@/components/brand-signature";
import "./mobile-nav-menu.css";

type NavLink = {
  href: string;
  label: string;
  // Pages about the house (About, the guide) sit in a quieter row under the
  // collections.
  secondary?: boolean;
};

const noopSubscribe = () => () => {};

export function MobileNavMenu({
  links,
  menuLabel,
  closeLabel,
  searchPlaceholder,
  searchLabel,
  storeName,
  tagline,
  social,
  socialLabel,
  legal,
  legalLabel,
}: {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
  searchPlaceholder: string;
  searchLabel: string;
  storeName: string;
  tagline: string;
  social: SocialUrls;
  socialLabel: string;
  legal: { href: string; label: string }[];
  legalLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // False during the server render (no document.body for createPortal yet),
  // true once hydrated.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // While open: lock page scroll, move focus into the menu, close on Escape,
  // and hand focus back to the trigger on close.
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

  const close = () => setOpen(false);

  return (
    <>
      {/* Icon-only trigger: sits in the compact hamburger–logo–cart row
          (header.tsx) so the logo stays centered as the visual focus. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={menuLabel}
        className="-ms-2 grid h-12 w-12 shrink-0 place-items-center rounded-md sm:hidden"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open &&
        mounted &&
        createPortal(
          // Portaled to <body>: the header's backdrop-filter would otherwise
          // make "fixed inset-0" cover only the header's own box.
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="mobile-menu animate-fade-up sm:hidden"
          >
            <div className="mobile-menu-top">
              <BrandSignature storeName={storeName} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={closeLabel}
                className="mobile-menu-close"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* A plain GET form: submitting reloads the page, which also
                closes the menu. */}
            <form action="/products" method="GET" role="search" className="mobile-menu-search">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
              />
              <button type="submit" aria-label={searchLabel}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rtl:rotate-180"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>

            <nav aria-label={menuLabel}>
              <ul className="mobile-menu-links">
                {links
                  .filter((link) => !link.secondary)
                  .map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={close}>
                        <span className="mobile-menu-label">{link.label}</span>
                        <span className="mobile-menu-arrow rtl:rotate-180" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <ul className="mobile-menu-secondary">
                {links
                  .filter((link) => link.secondary)
                  .map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={close}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>

            <div className="mobile-menu-closing">
              <p className="mobile-menu-tagline">{tagline}</p>
              <SocialLinks urls={social} label={socialLabel} />
              <nav aria-label={legalLabel}>
                <ul className="footer-legal">
                  {legal.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={close}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className="footer-copyright">
                &copy; {new Date().getFullYear()} <span translate="no">{storeName}</span>
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
