"use client";

import { useEffect } from "react";

/**
 * The scroll-linked drift for the homepage look rows.
 *
 * Every row gets three custom properties written from its own position in the
 * viewport, so the photograph, the copy and the companion pieces travel at
 * slightly different rates as the row passes through — and because every value
 * is a pure function of the row's current position, scrolling back up replays
 * the motion exactly in reverse instead of leaving the row stranded.
 *
 * One rAF-throttled scroll listener serves the whole list; per frame it writes
 * three properties per visible row and nothing else, so no React state is
 * involved and scrolling never re-renders the tree.
 *
 * Reduced motion, a phone-width screen, and a missing IntersectionObserver all
 * leave the custom properties unset, and the CSS fallback keeps the rows still.
 */
export function LookEditorialScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 51.99rem)");

    let rows: HTMLElement[] = [];
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!rows.length) return;
      const vh = window.innerHeight || 1;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) continue;
        /* -1 when the row's middle is below the viewport's middle (it has not
           arrived yet), +1 once it is above (it has left the other side). */
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
        const clamped = Math.max(-1, Math.min(1, progress));
        row.style.setProperty("--look-shift", `${(clamped * -34).toFixed(1)}px`);
        row.style.setProperty("--look-copy-shift", `${(clamped * 26).toFixed(1)}px`);
        row.style.setProperty("--look-piece-shift", `${(clamped * -52).toFixed(1)}px`);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const enable = () => {
      if (motion.matches || narrow.matches || !("IntersectionObserver" in window)) return;
      const list = document.querySelector("[data-editorial-root]");
      if (!list) return;
      rows = Array.from(list.querySelectorAll<HTMLElement>(".look-editorial"));
      if (!rows.length) return;
      for (const row of rows) row.setAttribute("data-look-scroll", "on");
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    };

    const disable = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      for (const row of rows) {
        row.removeAttribute("data-look-scroll");
        row.style.removeProperty("--look-shift");
        row.style.removeProperty("--look-copy-shift");
        row.style.removeProperty("--look-piece-shift");
      }
      rows = [];
    };

    enable();
    const onChange = () => {
      disable();
      enable();
    };
    motion.addEventListener("change", onChange);
    narrow.addEventListener("change", onChange);
    return () => {
      disable();
      motion.removeEventListener("change", onChange);
      narrow.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}