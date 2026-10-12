"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { Link } from "@/components/localized-link";
import { useScrollTimelines } from "@/lib/use-scroll-timelines";
import "./murano-reasons.css";

// True once the row has scrolled into view (and stays true). Starts false, in
// the server HTML too, so the hidden state is there before the first paint and
// the entrance never starts from a flash of the finished row.
function useRevealed() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  // Where scroll timelines exist the entrance follows the scroll in CSS
  // (murano-reasons.css): nothing waits to be revealed.
  const scrollLinked = useScrollTimelines();
  useEffect(() => {
    const node = ref.current;
    if (!node || scrollLinked) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollLinked]);
  return [ref, revealed || scrollLinked] as const;
}

export type ReasonsProduct = {
  slug: string;
  name: string;
  price: string;
  imageUrl: string;
};

export type Reason = {
  title: string;
  body: string;
};

function ReasonRow({
  product,
  reason,
  index,
  count,
  viewLabel,
}: {
  product: ReasonsProduct;
  reason: Reason;
  index: number;
  count: number;
  viewLabel: string;
}) {
  const [rowRef, revealed] = useRevealed();
  const [hovered, setHovered] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const showPopup = useCallback(() => {
    if (closeTimer.current !== undefined) window.clearTimeout(closeTimer.current);
    setHovered(true);
  }, []);

  const hidePopup = useCallback(() => {
    closeTimer.current = window.setTimeout(() => setHovered(false), 200);
  }, []);

  const href = `/products/${product.slug}`;
  const imageRight = index % 2 === 0;

  return (
    <article
      ref={rowRef}
      data-reveal={revealed}
      className={`mr-row ${imageRight ? "mr-row--img-right" : "mr-row--img-left"}`}
    >
      <div className="mr-copy">
        {/* The editorial index, as in the collections above: decorative, the
            rows are already in order. */}
        <p className="mr-index" aria-hidden="true">
          <span className="mr-index-current">{String(index + 1).padStart(2, "0")}</span>
          <span className="mr-index-sep">/</span>
          <span className="mr-index-total">{String(count).padStart(2, "0")}</span>
        </p>
        <h2 className="mr-title">{reason.title}</h2>
        <span className="mr-title-rule" aria-hidden="true" />
        <p className="mr-body">{reason.body}</p>
        <Link href={href} className="mr-cta">
          {viewLabel}
          <span className="mr-cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <figure
        className="mr-visual"
        onMouseEnter={showPopup}
        onMouseLeave={hidePopup}
        onFocus={showPopup}
        onBlur={hidePopup}
      >
        <Link href={href} className="mr-visual-link" tabIndex={-1} aria-hidden="true">
          <CatalogImage
            src={product.imageUrl}
            alt=""
            fill
            sizes="(min-width: 64rem) 34rem, (min-width: 52rem) 45vw, 90vw"
          />
        </Link>

        {/* The same card as the pieces in a look: one size, centred on the
            piece, fixed so a long name never changes it. */}
        <div
          className="mr-popup"
          data-open={hovered ? "true" : undefined}
          aria-hidden={!hovered}
          inert={!hovered}
          onMouseEnter={showPopup}
          onMouseLeave={hidePopup}
          onFocus={showPopup}
          onBlur={hidePopup}
        >
          <p className="mr-popup-name">{product.name}</p>
          <p className="mr-popup-price">{product.price}</p>
          <Link href={href} className="mr-popup-link">
            {viewLabel}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
      </figure>
    </article>
  );
}

export function MuranoReasons({
  products,
  reasons,
  viewLabel,
}: {
  products: ReasonsProduct[];
  reasons: Reason[];
  viewLabel: string;
}) {
  // One row per reason that has a piece to show beside it.
  const count = Math.min(products.length, reasons.length);
  return (
    <div className="mr-section shelf-wrap">
      {products.slice(0, count).map((product, i) => (
        <ReasonRow
          key={product.slug}
          product={product}
          reason={reasons[i]}
          index={i}
          count={count}
          viewLabel={viewLabel}
        />
      ))}
    </div>
  );
}
