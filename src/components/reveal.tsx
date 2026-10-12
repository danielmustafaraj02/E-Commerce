"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScrollTimelines } from "@/lib/use-scroll-timelines";

/**
 * Fades/slides a section in when it scrolls into view. By default this runs
 * once; `repeatOnView` replays the entrance each time it leaves and re-enters.
 * Renders visible by default (see [data-reveal] in globals.css) so content
 * never depends on JS or IntersectionObserver support to be seen.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  repeatOnView = false,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  repeatOnView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Where scroll timelines exist the entrance follows the scroll in CSS
  // (globals.css, "Scroll-linked motion"): nothing waits to be revealed.
  const scrollLinked = useScrollTimelines();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (scrollLinked) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!repeatOnView) observer.disconnect();
        } else if (repeatOnView) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [repeatOnView, scrollLinked]);

  return (
    <div
      ref={ref}
      data-reveal={visible || scrollLinked}
      style={{ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
