"use client";

import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";
import { Link } from "@/components/localized-link";

/**
 * Transparent hover-detection overlay for a single composed look piece.
 * Must be a SIBLING of the look-editorial-visual <Link>, never a child of it,
 * to avoid rendering a <Link> (→ <a>) inside another <a>.
 *
 * The piece image itself is rendered by the parent inside the <Link>;
 * this component covers the same area (same className + style) and shows a
 * popup card on hover/focus without duplicating the image.
 *
 * The card is a SIBLING of that scaled layer, not a child: a child inherits the
 * layer's `scale(var(--piece-size))`, which shrank the necklace's card, the
 * bracelet's and the earrings' by three different factors. Outside it, every
 * card is the same size and is placed in the frame's own coordinates.
 */
export function LookPieceHover({
  slug,
  name,
  price,
  cta,
  style,
}: {
  slug: string;
  name: string;
  price: string;
  cta: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timer.current = window.setTimeout(() => setOpen(false), 180);
  }, []);

  return (
    <>
      <div
        className="look-editorial-piece look-piece-hover"
        style={style}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      />
      <div
        className="look-piece-hover-card"
        style={style}
        data-open={open ? "true" : undefined}
        aria-hidden={!open}
        inert={!open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <p className="look-piece-hover-name">{name}</p>
        <p className="look-piece-hover-price">{price}</p>
        <Link href={`/products/${slug}`} className="look-piece-hover-link">
          {cta}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </div>
    </>
  );
}
