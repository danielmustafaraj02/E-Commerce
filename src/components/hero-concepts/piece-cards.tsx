"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HeroProduct } from "@/lib/hero-concepts/products";

type Open = { slug: string; x: number; y: number; below: boolean };

const pieceOf = (target: EventTarget | null) =>
  (target instanceof Element ? target.closest(".hc-piece[data-slug]") : null) as HTMLElement | null;

/**
 * The product card of a hero piece: its name, price and a link to it. Opens on
 * hover with a mouse and on tap on a touch screen; closes on leaving, a tap
 * elsewhere, Escape, a resize or a change of rotating scene. One card per
 * hero, placed beside the piece and kept inside the hero's edges.
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

  useEffect(() => {
    const root = card.current?.closest(".hc") as HTMLElement | null;
    if (!root) return;
    const show = (piece: HTMLElement) => {
      const slug = piece.dataset.slug;
      if (!slug || !products[slug]) return;
      window.clearTimeout(hideTimer.current);
      const r = root.getBoundingClientRect();
      const p = piece.getBoundingClientRect();
      // Below the piece when it sits in the top part of the hero, else above.
      const below = p.top + p.height / 2 - r.top < r.height * 0.45;
      setOpen({
        slug,
        x: p.left + p.width / 2 - r.left,
        y: below ? p.bottom - r.top - p.height * 0.12 : p.top - r.top + p.height * 0.12,
        below,
      });
    };
    const hideSoon = () => {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setOpen(null), 200);
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const piece = pieceOf(e.target);
      if (piece) show(piece);
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
      if (piece) show(piece);
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

  // Keep the card inside the hero: measured once it has its size.
  useLayoutEffect(() => {
    const el = card.current;
    const root = el?.closest(".hc") as HTMLElement | null;
    if (!el || !root || !open) return;
    const margin = 12;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = Math.min(Math.max(open.x - w / 2, margin), root.clientWidth - w - margin);
    const top = open.below
      ? Math.min(open.y, root.clientHeight - h - margin)
      : Math.max(open.y - h, margin);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [open]);

  const product = open ? products[open.slug] : null;
  return (
    <div ref={card} className="hc-card" data-open={product ? "true" : undefined}>
      {product && (
        <>
          <span className="hc-card-name">{product.name}</span>
          <span className="hc-card-price">{product.soldOut ? labels.soldOut : product.price}</span>
          <a className="hc-card-link" href={product.href}>
            {labels.view} <span aria-hidden="true">→</span>
          </a>
        </>
      )}
    </div>
  );
}
