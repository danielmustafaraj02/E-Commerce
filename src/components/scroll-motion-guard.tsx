"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Safety net for the site's scroll-linked motion (globals.css). A CSS view
 * timeline follows the nearest scroll container, and `overflow: hidden` makes
 * one: an entrance inside a clipping box (a header that hides its overflow, a
 * horizontal carousel) would follow a box that never scrolls and stay frozen
 * part-way, half transparent. Any scroll animation not driven by the page's
 * own scroll is cancelled, so that content is simply shown at rest.
 *
 * Runs after every navigation and whenever content is added (client-rendered
 * sections, "show more" rows). Renders nothing.
 */
export function ScrollMotionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof CSS === "undefined" || !CSS.supports("animation-timeline: view()")) return;
    const page = document.scrollingElement;
    const check = () => {
      for (const animation of document.getAnimations()) {
        const timeline = animation.timeline as (AnimationTimeline & { source?: Element | null }) | null;
        if (!timeline || !("source" in timeline)) continue;
        if (timeline.source && timeline.source !== page) animation.cancel();
      }
    };
    check();
    let queued = 0;
    const observer = new MutationObserver((records) => {
      // Text updates (counters, typing) add no elements and need no check.
      const added = records.some((r) => [...r.addedNodes].some((n) => n.nodeType === 1));
      if (!added) return;
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(check);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(queued);
    };
  }, [pathname]);

  return null;
}
