"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/localized-link";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { useWishlistStore, type WishlistStoreItem } from "@/lib/wishlist-store";
import { formatMoney } from "@/lib/format";
import "./header-flyout.css";

/**
 * Header cart + wishlist flyouts.
 *
 * Hovering (or focusing) the heart or the cart opens a small panel showing
 * the pieces already in that list, so the shopper can see what they picked
 * without opening a page. The panel is informational: clicking a row goes to
 * that product, and the footer link goes to the full list.
 *
 * Both stores are device-local zustand stores holding a display snapshot
 * (name/price/image), so no fetch is needed — see lib/cart-store.ts and
 * lib/wishlist-store.ts. The panel therefore only ever shows what the
 * browser already has; the server re-reads authoritative prices at checkout.
 */

type FlyoutLabels = {
  title: string;
  empty: string;
  remove: string;
  viewAll: string;
  itemCount: string;
  subtotal: string;
  checkout: string;
};

function useOpenOnHover(open: boolean, onOpen: () => void, onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Real hover only. Touch has no hover, so a tap must fall through to the
  // link itself rather than silently opening a panel nobody can hover away
  // from — same guard the Products dropdown uses.
  const onPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") {
      clearTimeout(closeTimer.current);
      onOpen();
    }
  };
  const onPointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") {
      // A short grace period so the pointer can travel from the icon down
      // into the panel without the panel vanishing mid-move.
      closeTimer.current = setTimeout(onClose, 140);
    }
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return { rootRef, onPointerEnter, onPointerLeave };
}

// ── Shared item rows ───────────────────────────────────────────────────────
// Exported so the Products dropdown can show the same pieces in its own
// panel without duplicating this markup. `className` lets the dropdown place
// the list in its own column; the flyouts use it as a plain block.

export function FlyoutRows({
  items,
  remove,
  removeLabel,
  locale,
  className = "",
  limit = 4,
}: {
  items: (CartItem | WishlistStoreItem)[];
  remove: (productId: string) => void;
  /** Dictionary string prefixed to the product name, e.g. "Remove: …". */
  removeLabel: string;
  locale: string;
  className?: string;
  limit?: number;
}) {
  const visible = items.slice(0, limit);
  const hidden = items.length - visible.length;
  if (items.length === 0) return null;

  return (
    <ul className={`hf-list ${className}`}>
      {visible.map((item) => (
        <li key={item.productId} className="hf-row">
          <Link href={`/products/${item.slug}`} className="hf-row-link">
            <Thumb src={item.imageUrl} name={item.name} />
            <span className="hf-row-text">
              <span className="hf-row-name">{item.name}</span>
              <span className="hf-row-meta">
                {"quantity" in item && item.quantity > 1 ? <span>×{item.quantity} · </span> : null}
                {formatMoney(item.price, item.currency, locale)}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="hf-remove"
            onClick={() => remove(item.productId)}
            aria-label={`${removeLabel}: ${item.name}`}
            title={removeLabel}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </li>
      ))}
      {hidden > 0 ? <li className="hf-more">+{hidden}</li> : null}
    </ul>
  );
}

function FlyoutPanel({
  title,
  countLabel,
  rows,
  footer,
}: {
  title: string;
  countLabel: string | null;
  rows: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="hf-panel" role="dialog" aria-label={title}>
      <div className="hf-head">
        <span className="hf-title">{title}</span>
        {countLabel ? <span className="hf-count">{countLabel}</span> : null}
      </div>
      <div className="hf-rows">{rows}</div>
      <div className="hf-foot">{footer}</div>
    </div>
  );
}

function Thumb({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    // No photograph: an ivory plate with a fine ring, so the row keeps its
    // rhythm instead of collapsing around a broken image.
    return <span className="hf-thumb hf-thumb--empty" aria-hidden="true" />;
  }
  return (
    <span className="hf-thumb" aria-hidden="true">
      <Image src={src} alt="" fill sizes="56px" quality={95} className="object-cover" />
      <span className="hf-sr">{name}</span>
    </span>
  );
}

// ── Cart ────────────────────────────────────────────────────────────────────

export function CartFlyout({ label, labels, locale }: {
  label: string;
  labels: FlyoutLabels;
  locale: string;
}) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const [open, setOpen] = useState(false);
  const { rootRef, onPointerEnter, onPointerLeave } = useOpenOnHover(open, () => setOpen(true), () => setOpen(false));

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency ?? "EUR";
  // Rows are capped inside FlyoutRows; the footer carries the full list.

  return (
    <div
      ref={rootRef}
      className="hf-root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <Link
        href="/cart"
        aria-label={label}
        title={label}
        className="hf-trigger group link-underline text-foreground hover:text-primary flex items-center gap-1"
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
        </svg>
        {count > 0 ? <span>({count})</span> : null}
      </Link>

      {open ? (
        <FlyoutPanel
          title={labels.title}
          countLabel={count > 0 ? `${count}` : null}
          rows={
            items.length === 0 ? (
              /* Empty state: the same quiet pulse as the wishlist panel, but
                 with the cart's own glyph instead of the heart — one shared
                 gesture, each panel speaking in its own icon. */
              <div className="hf-empty--wish">
                <svg
                  className="hf-heart hf-heart--cart"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
                </svg>
                <p className="hf-empty">{labels.empty}</p>
              </div>
            ) : (
              <FlyoutRows
                items={items}
                remove={removeItem}
                removeLabel={labels.remove}
                locale={locale}
              />
            )
          }
          footer={
            items.length === 0 ? (
              <Link href="/products" className="hf-cta hf-cta--quiet">
                {labels.viewAll}
              </Link>
            ) : (
              <>
                <div className="hf-subtotal">
                  <span>{labels.subtotal}</span>
                  <span className="tabular-nums">{formatMoney(total, currency, locale)}</span>
                </div>
                <div className="hf-actions">
                  <Link href="/cart" className="hf-cta hf-cta--quiet">
                    {labels.viewAll}
                  </Link>
                  <Link href="/checkout" className="hf-cta">
                    {labels.checkout}
                  </Link>
                </div>
              </>
            )
          }
        />
      ) : null}
    </div>
  );
}

// ── Wishlist ────────────────────────────────────────────────────────────────

export function WishlistFlyout({ label, labels, locale, signedIn }: {
  label: string;
  labels: FlyoutLabels;
  locale: string;
  signedIn: boolean;
}) {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const [open, setOpen] = useState(false);
  const { rootRef, onPointerEnter, onPointerLeave } = useOpenOnHover(open, () => setOpen(true), () => setOpen(false));

  // Signed-in shoppers' wishlist lives in the DB, not this device store, so
  // pointing them at the store's empty list would be wrong.
  const href = signedIn ? "/account/wishlist" : "/wishlist";

  return (
    <div
      ref={rootRef}
      className="hf-root"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <Link
        href={href}
        aria-label={label}
        title={label}
        className="hf-trigger group link-underline text-foreground hover:text-danger flex items-center gap-1"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 ease-out group-hover:scale-125 group-hover:-rotate-12"
          aria-hidden="true"
        >
          <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
        </svg>
        {items.length > 0 ? <span>({items.length})</span> : null}
      </Link>

      {open ? (
        <FlyoutPanel
          title={labels.title}
          countLabel={items.length > 0 ? `${items.length}` : null}
          rows={
            items.length === 0 ? (
              /* Empty state: a small heart beating above the empty message,
                 so the panel reads as an invitation rather than a dead end. */
              <div className="hf-empty--wish">
                <svg
                  className="hf-heart"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
                </svg>
                <p className="hf-empty">{labels.empty}</p>
              </div>
            ) : (
              <FlyoutRows
                items={items}
                remove={removeItem}
                removeLabel={labels.remove}
                locale={locale}
              />
            )
          }
          footer={
            <Link href={href} className="hf-cta hf-cta--quiet">
              {labels.viewAll}
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
