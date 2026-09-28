"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Only prepare off-screen content: hydration must never hide visible jewelry. */
export function EditorialReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
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

  return (
    <div ref={ref} className="home-editorial-inner">
      {children}
    </div>
  );
}
