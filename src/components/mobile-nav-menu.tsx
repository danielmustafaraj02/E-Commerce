"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { SocialLinks, type SocialUrls } from "@/components/social-links";
import { BrandSignature, BrandWave } from "@/components/brand-signature";
import "./mobile-nav-menu.css";

type NavLink = {
  href: string;
  label: string;
  // A category's thumbnail (one of its pieces), or a line icon for pages.
  imageUrl?: string | null;
  icon?: "about" | "guide";
};

const ICONS = {
  // A Venetian skyline: dome and campanile.
  about: (
    <path d="M3 21h18M5 21v-6h6v6M8 15v-3a3 3 0 0 1 6 0v3M14 21v-9h3v9M15.5 12V6l1.5-2 1.5 2v15M17 9h1.5" />
  ),
  guide: (
    <path d="M3 5.5C5.5 4.5 9 4.5 12 6.5v13C9 17.5 5.5 17.5 3 18.5v-13ZM21 5.5c-2.5-1-6-1-9 1v13c3-2 6.5-2 9-1v-13Z" />
  ),
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
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close}>
                      <span className="mobile-menu-thumb" aria-hidden="true">
                        {link.imageUrl ? (
                          <CatalogImage src={link.imageUrl} alt="" fill sizes="3.5rem" />
                        ) : link.icon ? (
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.1"
                            strokeLinejoin="round"
                          >
                            {ICONS[link.icon]}
                          </svg>
                        ) : null}
                      </span>
                      <span className="mobile-menu-label">{link.label}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="mobile-menu-chevron rtl:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mobile-menu-closing">
              <div className="mobile-menu-art" aria-hidden="true">
                <Image
                  src="/hero/handmade-red-murano-glass-necklace.jpg"
                  alt=""
                  fill
                  sizes="60vw"
                />
              </div>
              <p className="mobile-menu-tagline">
                {tagline}
                <BrandWave />
              </p>
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
