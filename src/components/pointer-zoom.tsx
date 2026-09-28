"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnifies each child layer under the pointer, following it.
 *
 * A composed look is several pieces in one frame, so a single whole-image
 * zoom would only ever answer "what is this look" — the useful question is
 * "which one is that", piece by piece. Every direct child (or the container's
 * own image) is treated as one layer; the pointer's position inside that
 * layer becomes its transform origin, so the accessory swells towards the
 * cursor instead of about the middle of the photo.
 *
 * Purely pointer-driven: no JS runs on touch or under reduced motion, where
 * the CSS in the caller's stylesheet simply doesn't transition anything.
 */
export function PointerZoom({
  children,
  className,
  scale = 1.18,
}: {
  children: ReactNode;
  className?: string;
  /** How far the hovered layer grows. */
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Only a real hovering pointer gets the effect; a finger or a stylus
    // would strand the frame mid-zoom when the pointer leaves.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    let frame = 0;
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>(":scope > *, :scope > img")
    );

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        for (const layer of layers) {
          const box = layer.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) continue;
          const inside =
            event.clientX >= box.left &&
            event.clientX <= box.right &&
            event.clientY >= box.top &&
            event.clientY <= box.bottom;
          layer.style.setProperty("--pz-scale", inside ? String(scale) : "1");
          if (!inside) continue;
          // Clamped well inside the frame: at the very edge an origin of 0%
          // would push the piece out of its own box.
          const x = Math.min(88, Math.max(12, ((event.clientX - box.left) / box.width) * 100));
          const y = Math.min(88, Math.max(12, ((event.clientY - box.top) / box.height) * 100));
          layer.style.setProperty("--pz-x", `${x}%`);
          layer.style.setProperty("--pz-y", `${y}%`);
        }
      });
    };
    const onLeave = () => {
      for (const layer of layers) layer.style.setProperty("--pz-scale", "1");
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [scale]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
