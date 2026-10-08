"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { SectionAnim } from "@/lib/page-layout";

const SPEED = { fast: "0.4s", normal: "0.75s", slow: "1.3s" } as const;

/**
 * Wraps a page section and plays its entrance animation once it scrolls into
 * view (fade, fade up, slide from a side, zoom). Content is fully visible
 * without JavaScript and for visitors who prefer reduced motion; a section
 * already on screen at load is simply shown.
 */
export function AnimateOnView({
  anim,
  speed = "normal",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: {
  anim: SectionAnim;
  speed?: keyof typeof SPEED;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  "data-custom-section"?: string;
} & Record<`data-opt-${string}`, string | undefined>) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "waiting" | "in">("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setState("in");
      return;
    }
    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("in");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      {...rest}
      className={[
        className,
        "lay-anim",
        `lay-anim-${anim}`,
        state === "waiting" ? "lay-wait" : "",
        state === "in" ? "lay-in" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...style,
          "--lay-dur": SPEED[speed],
          "--lay-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
