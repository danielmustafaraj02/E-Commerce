"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/components/localized-link";
import Image from "next/image";
import { CatalogImage } from "@/components/catalog-image";
import { SocialLinks, type SocialUrls } from "@/components/social-links";
import "./mobile-nav-menu.css";

type NavLink = {
  href: string;
  label: string;
  // Pages about the house (About, the guide) sit in a quieter row under the
  // collections.
  secondary?: boolean;
  // Account/wishlist/sign-in: the menu's only path to these below the lg
  // breakpoint, since the header's own icon cluster is hidden there.
  account?: boolean;
};

/* Small line icons for the quiet rows (account + secondary): the same
   self-drawn, stroke-based set as the header, so the menu reads as one
   hand. Matched by href, which is the only stable identity a nav link has. */
function rowIcon(href: string) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (href.includes("wishlist")) {
    return (
      <svg {...common}>
        <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
      </svg>
    );
  }
  if (href.includes("/account")) {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" />
      </svg>
    );
  }
  if (href.includes("login")) {
    return (
      <svg {...common}>
        <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
        <path d="M10 8l4 4-4 4M14 12H3" />
      </svg>
    );
  }
  if (href.includes("about")) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.6v.4" />
      </svg>
    );
  }
  return null;
}

// A collection row in the menu can carry a thumbnail (borrowed from the
// category's newest product), the way the desktop Products dropdown does.
type MenuCategory = {
  href: string;
  label: string;
  imageUrl?: string | null;
};

const noopSubscribe = () => () => {};

export function MobileNavMenu({
  links,
  categories = [],
  menuLabel,
  closeLabel,
  searchPlaceholder,
  searchLabel,
  storeName,
  logoUrl,
  social,
  socialLabel,
  legal,
  legalLabel,
}: {
  links: NavLink[];
  /** Collections with their borrowed thumbnails, for the luxury rows. */
  categories?: MenuCategory[];
  menuLabel: string;
  closeLabel: string;
  searchPlaceholder: string;
  searchLabel: string;
  storeName: string;
  /** The resolved logo src (the header computes it server-side via
   *  headerLogoSrc — importing that helper here would drag the DB client
   *  into this client component's bundle). */
  logoUrl: string | null;
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
  const panelRef = useRef<HTMLDivElement>(null);
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
      if (e.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const visible = Array.from(focusable ?? []).filter(
        (element) => element.getClientRects().length > 0
      );
      const first = visible[0];
      const last = visible.at(-1);

      if (!first || !last) {
        e.preventDefault();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
        className="-ms-2 grid h-12 w-12 shrink-0 place-items-center rounded-(--radius-button) lg:hidden"
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
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="mobile-menu animate-fade-up lg:hidden"
          >
            <div className="mobile-menu-top">
              {/* The store's logo image, as in the header — the menu opens
                  onto the same brand mark instead of a text signature. */}
              <Link href="/" onClick={close} className="mobile-menu-logo">
                <Image
                  src={logoUrl ?? "/logo.png"}
                  alt={storeName}
                  width={284}
                  height={168}
                  sizes="132px"
                  className="h-12 w-auto object-contain mix-blend-multiply"
                />
              </Link>
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

            {links.some((link) => link.account) && (
              <ul className="mobile-menu-secondary mobile-menu-account">
                {links
                  .filter((link) => link.account)
                  .map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={close}>
                        {rowIcon(link.href)}
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}

            <nav aria-label={menuLabel}>
              {/* Collections first, each with its thumbnail when one exists —
                  the menu opens onto the jewellery itself, not just words.
                  Non-collection links (Look, account rows) keep the plain
                  text rows below. */}
              <ul className="mobile-menu-links">
                {categories.map((category) => (
                  <li key={category.href}>
                    <Link href={category.href} onClick={close}>
                      {category.imageUrl ? (
                        <span className="mobile-menu-thumb" aria-hidden="true">
                          <CatalogImage
                            src={category.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                          />
                        </span>
                      ) : null}
                      <span className="mobile-menu-label">{category.label}</span>
                      <span className="mobile-menu-arrow rtl:rotate-180" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                {links
                  .filter((link) => !link.secondary && !link.account)
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
                        {rowIcon(link.href)}
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>

            <div className="mobile-menu-closing">
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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
