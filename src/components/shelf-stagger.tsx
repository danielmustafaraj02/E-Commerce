"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Staggered scroll reveal for a shelf grid (a <ul> of .shelf-item cards).
 *
 * The cards arrive left-to-right, top-to-bottom (row by row, each a beat
 * behind the last), once, the first time the grid reaches the viewport. The
 * reveal is one-way: once a piece is on the page it stays there.
 *
 * Safety properties:
 *  - the grid renders visible by default — the staging attribute is only
 *    added by JS, and only when the whole grid is below the viewport at
 *    load, so no-JS visitors and above-the-fold content are never hidden;
 *  - reduced motion: the effect returns early and the CSS animation block
 *    is gated behind prefers-reduced-motion: no-preference;
 *  - per-frame work is a plain IntersectionObserver on the grid, not React
 *    state, so scrolling never re-renders.
 */
export function ShelfStagger({
  children,
  className,
}: {
  children: ReactNode;
  /** The ul's own layout classes (shelf-row etc.) come through here. */
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Stage only when the grid is entirely below the fold at load; anything
    // already on screen must never blink away.
    const rect = root.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    root.dataset.shown = "false";
    /* Reveal once, and never take it back. The observer used to drive the
       attribute BOTH ways, so dropping below the 0.15 threshold re-ran an exit
       animation that fades the cards to nothing — and on a two-row grid taller
       than the threshold's share of itself, that happens while part of the
       grid is still on screen: a reader scrolling slowly past watched the
       pieces disappear. Products stay put once shown. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        root.dataset.shown = "true";
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={ref} className={`shelf-stagger ${className ?? ""}`.trim()}>
      {children}
    </ul>
  );
}
