"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Cursor-following zoom on hover — the image itself scales up with its
// transform-origin tracking the pointer, rather than a separate magnifier
// pane, so it works at any container size without extra layout. Falls back
// to doing nothing on touch (no hover event), which is the standard,
// expected behavior on mobile rather than a half-working hover simulation.
export function ProductImageZoom({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZooming(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setZooming(false)}
      className="bg-surface relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-contain transition-transform duration-300 ease-out"
        style={{
          transformOrigin: origin,
          transform: zooming ? "scale(2.2)" : "scale(1)",
        }}
      />
    </div>
  );
}
