"use client";

import { useEffect } from "react";

/**
 * Publishes the real header height as the `--hero-header-offset` custom
 * property on <html>.
 *
 * The home hero fills the first screen: its min-height is the viewport minus
 * the header that sits above it. That header's height is not a constant — the
 * logo, the row padding and the nav wrapping at a given width all move it, and
 * a hard-coded guess leaves the hero a few pixels short (a sliver of the next
 * section peeking above the fold) or a few pixels long (the trust marks pinned
 * to the hero's bottom edge falling below it). Measuring it is exact, and a
 * ResizeObserver keeps it exact when the fonts land or the nav reflows.
 *
 * This only ever writes one custom property; no layout is read back into
 * React, so it cannot loop.
 */
export function HeaderHeight() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const root = document.documentElement;
    const apply = () => {
      const height = header.getBoundingClientRect().height;
      if (height > 0) root.style.setProperty("--hero-header-offset", `${height}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);

    // A resize can re-wrap the nav without changing the header's own box in a
    // way ResizeObserver reports, so the window event is still worth having.
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return null;
}
