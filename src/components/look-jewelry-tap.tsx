"use client";

import { useEffect, useRef, type ReactNode } from "react";

const OPEN = ".look-jewelry-product[data-open]";

// Touch screens have no hover, so the card over each piece of a look (name,
// price, "view the piece") opens on a first tap instead; a second tap on the
// piece follows its link, and a tap anywhere else closes the card. With a
// mouse the card is the CSS hover state and clicks go straight through, as do
// keyboard activations (detail 0), where the card already shows on focus.
export function LookJewelryTap({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const open = ref.current?.querySelector(OPEN);
      if (open && !open.contains(event.target as Node)) open.removeAttribute("data-open");
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") ref.current?.querySelector(OPEN)?.removeAttribute("data-open");
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onClickCapture={(event) => {
        if (event.detail === 0) return;
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const piece = (event.target as Element).closest(".look-jewelry-product");
        if (!piece?.querySelector(".look-jewelry-pop") || piece.hasAttribute("data-open")) return;
        // The data attribute is set here rather than through React state so
        // the pieces themselves can stay server-rendered.
        event.preventDefault();
        ref.current?.querySelector(OPEN)?.removeAttribute("data-open");
        piece.setAttribute("data-open", "");
      }}
    >
      {children}
    </div>
  );
}
