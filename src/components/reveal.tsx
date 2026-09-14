"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades/slides a section in the first time it scrolls into view.
 * Renders visible by default (see [data-reveal] in globals.css) so content
 * never depends on JS or IntersectionObserver support to be seen.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={visible}
      style={{ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
