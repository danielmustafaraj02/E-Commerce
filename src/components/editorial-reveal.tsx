"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Prepares off-screen editorial content for its scroll-in sequence: every
 * descendant marked `data-editorial-part` is set to `pending` (invisible) and
 * flipped to `visible` by an observer as it reaches the viewport.
 *
 * It renders NO wrapper element, and observes the element the caller marks
 * with `data-editorial-root` instead. A wrapper would become the grid's only
 * child, which renumbers its items and silently kills every `nth-child` layout
 * rule that alternates the editorial rows.
 *
 * Hydration can never hide visible jewellery: parts already on screen are
 * never marked pending, and a focus or a reduced-motion change reveals
 * everything immediately.
 */
export function EditorialReveal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-editorial-root]");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || motion.matches || !("IntersectionObserver" in window)) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-editorial-part]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.editorialState = "visible";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -32px 0px" }
    );

    // Read geometry before writing attributes; elements already on screen stay put.
    const pending = targets.filter(
      (node) => node.getBoundingClientRect().top >= window.innerHeight
    );
    for (const node of pending) {
      node.dataset.editorialState = "pending";
      observer.observe(node);
    }

    const revealAll = () => {
      observer.disconnect();
      for (const node of targets) delete node.dataset.editorialState;
    };
    const onMotionChange = () => {
      if (motion.matches) revealAll();
    };
    root.addEventListener("focusin", revealAll);
    motion.addEventListener("change", onMotionChange);
    return () => {
      revealAll();
      root.removeEventListener("focusin", revealAll);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <>{children}</>;
}
