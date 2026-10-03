"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/components/localized-link";
import type { LookPieceView } from "@/lib/look-data";

/**
 * For single-photo looks (cover image, no composed pieces): renders a row of
 * small piece thumbnails overlaid at the bottom of the image. Hovering (or
 * focusing) each thumbnail opens a popup card with the piece's name, price
 * and a direct link to its product page.
 */
export function LookSinglePieces({
  pieces,
  cta,
  locale,
  currency,
}: {
  pieces: LookPieceView[];
  cta: string;
  locale: string;
  currency: string;
}) {
  return (
    <div className="look-single-pieces">
      {pieces.map((piece) => (
        piece.imageUrl && (
          <LookSinglePiece
            key={piece.productId}
            piece={piece}
            cta={cta}
            locale={locale}
            currency={currency}
          />
        )
      ))}
    </div>
  );
}

function LookSinglePiece({
  piece,
  cta,
  locale,
  currency,
}: {
  piece: LookPieceView;
  cta: string;
  locale: string;
  currency: string;
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

  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: piece.price % 100 === 0 ? 0 : 2,
  }).format(piece.price / 100);

  return (
    <div
      className="look-single-piece"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Image
        src={piece.imageUrl!}
        alt={piece.name}
        width={48}
        height={48}
        className="look-single-piece-thumb"
      />
      <div
        className="look-single-piece-card"
        data-open={open ? "true" : undefined}
        aria-hidden={!open}
        inert={!open}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <p className="look-single-piece-name">{piece.name}</p>
        <p className="look-single-piece-price">{price}</p>
        <Link href={`/products/${piece.slug}`} className="look-single-piece-link">
          {cta}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </div>
    </div>
  );
}
