"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HeroProduct } from "@/lib/hero-concepts/products";
import { popPosition } from "@/lib/pop-anchor";

/** The open card: its piece, and where the pointer entered it (px, in the hero). */
type Open = { slug: string; x: number; y: number };

const pieceOf = (target: EventTarget | null) =>
  (target instanceof Element ? target.closest(".hc-piece[data-slug]") : null) as HTMLElement | null;

/**
 * The product card of a hero piece: its name, price and a link to it. Opens on
 * hover with a mouse and on tap on a touch screen, just off the point where the
 * pointer entered the piece (lib/pop-anchor.ts), and stays there while the
 * pointer moves over that piece; it closes on leaving, a tap elsewhere,
 * Escape, a resize or a change of rotating scene. One card per hero.
 *
 * The pieces themselves stay out of the keyboard and screen-reader order (the
 * hero's own button leads to the same pieces); the card is a shortcut for
 * pointer and touch.
 */
export function PieceCards({
  products,
  labels,
}: {
  products: Record<string, HeroProduct>;
  labels: { view: string; soldOut: string };
}) {
  const card = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(undefined);
  const [open, setOpen] = useState<Open | null>(null);
  const openSlug = useRef<string | null>(null);
  useEffect(() => {
    openSlug.current = open?.slug ?? null;
  }, [open]);

  useEffect(() => {
    const root = card.current?.closest(".hc") as HTMLElement | null;
    if (!root) return;
    const show = (piece: HTMLElement, event: { clientX: number; clientY: number }) => {
      const slug = piece.dataset.slug;
      if (!slug || !products[slug]) return;
      window.clearTimeout(hideTimer.current);
      // Same piece: the card stays where it opened.
      if (slug === openSlug.current) return;
      const r = root.getBoundingClientRect();
      setOpen({ slug, x: event.clientX - r.left, y: event.clientY - r.top });
    };
    const hideSoon = () => {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setOpen(null), 220);
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const piece = pieceOf(e.target);
      if (piece) show(piece, e);
      else if (card.current?.contains(e.target as Node)) window.clearTimeout(hideTimer.current);
    };
    const out = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const to = e.relatedTarget as Node | null;
      if (to && (pieceOf(to) || card.current?.contains(to))) return;
      if (pieceOf(e.target) || card.current?.contains(e.target as Node)) hideSoon();
    };
    const click = (e: MouseEvent) => {
      const piece = pieceOf(e.target);
      if (piece) show(piece, e);
      else if (!card.current?.contains(e.target as Node)) setOpen(null);
    };
    const tapOutside = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) setOpen(null);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const close = () => setOpen(null);
    root.addEventListener("pointerover", over);
    root.addEventListener("pointerout", out);
    root.addEventListener("click", click);
    root.addEventListener("hc-scene", close);
    document.addEventListener("pointerdown", tapOutside);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    return () => {
      window.clearTimeout(hideTimer.current);
      root.removeEventListener("pointerover", over);
      root.removeEventListener("pointerout", out);
      root.removeEventListener("click", click);
      root.removeEventListener("hc-scene", close);
      document.removeEventListener("pointerdown", tapOutside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", close);
    };
  }, [products]);

  // Placed once the card has its content (and so its size).
  useLayoutEffect(() => {
    const el = card.current;
    const root = el?.closest(".hc") as HTMLElement | null;
    if (!el || !root || !open) return;
    const p = popPosition({
      pointer: open,
      card: { width: el.offsetWidth, height: el.offsetHeight },
      container: { width: root.clientWidth, height: root.clientHeight },
    });
    el.style.left = `${p.left}px`;
    el.style.top = `${p.top}px`;
    el.style.setProperty("--pop-origin", p.origin);
  }, [open]);

  // The last piece stays in the card while it fades out.
  const [shown, setShown] = useState<string | null>(null);
  if (open && open.slug !== shown) setShown(open.slug);
  const product = shown ? products[shown] : null;
  return (
    <div ref={card} className="pop-card" data-open={open ? "true" : undefined}>
      {product && (
        <>
          <span className="pop-card-name">{product.name}</span>
          <span className="pop-card-price">{product.soldOut ? labels.soldOut : product.price}</span>
          <a className="pop-card-cta" href={product.href}>
            {labels.view} <span className="pop-card-cta-arrow" aria-hidden="true">→</span>
          </a>
        </>
      )}
    </div>
  );
}
