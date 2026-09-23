"use client";

import { useRef, useState } from "react";
import { CatalogImage } from "@/components/catalog-image";

// Cursor-following zoom on hover — the image itself scales up with its
// transform-origin tracking the pointer, rather than a separate magnifier
// pane, so it works at any container size without extra layout. Falls back
// to doing nothing on touch (no hover event), which is the standard,
// expected behavior on mobile rather than a half-working hover simulation.
export function ProductImageZoom({
  src,
  alt,
  isLifestyle,
}: {
  src: string;
  alt: string;
  isLifestyle?: boolean;
}) {
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
      className="shop-product-photo cursor-zoom-in"
    >
      <CatalogImage
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 640px) 50vw, 100vw"
        className={`transition-transform duration-300 ease-out ${isLifestyle ? "shop-photo--lifestyle" : ""}`}
        style={{
          transformOrigin: origin,
          transform: zooming ? "scale(2.2)" : "scale(1)",
        }}
      />
    </div>
  );
}
