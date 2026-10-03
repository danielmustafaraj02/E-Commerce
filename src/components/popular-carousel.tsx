"use client";

import type { CSSProperties } from "react";
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { Link } from "@/components/localized-link";
import "./popular-carousel.css";

export type PopularProduct = {
  slug: string;
  name: string;
  price: string;
  imageUrl: string;
};

const AUTOSCROLL_MS = 3800;
const CLONE = 5; /* items cloned at each end — must match visible count */
const VISIBLE = 5;

export function PopularCarousel({ products }: { products: PopularProduct[] }) {
  const n = products.length;

  /* Extended track: [last CLONE] + [all n] + [first CLONE] */
  const extended = [
    ...products.slice(-CLONE),
    ...products,
    ...products.slice(0, CLONE),
  ];
  const extN = extended.length;

  const [trackIndex, setTrackIndex] = useState(CLONE);
  /* When true, CSS transition is disabled for the instant snap-back */
  const [snap, setSnap] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  /* Signals that the next trackIndex change is a snap (no transition) */
  const snapPending = useRef(false);

  /* After a transition ends, if we landed on a clone, jump to the real
     equivalent position. The jump itself must have no CSS transition. */
  const handleTransitionEnd = useCallback(() => {
    setTrackIndex((i) => {
      if (i >= n + CLONE) {
        snapPending.current = true;
        return i - n; /* wrap forward: clone at end → real at start */
      }
      if (i < CLONE) {
        snapPending.current = true;
        return n + i; /* wrap backward: clone at start → real at end */
      }
      return i;
    });
  }, [n]);

  /* Apply the snap immediately after the DOM update (before paint) so the
     browser never shows the jump with a transition. */
  useLayoutEffect(() => {
    if (snapPending.current) {
      snapPending.current = false;
      setSnap(true);
    }
  }, [trackIndex]);

  /* Re-enable transition one frame after the snap so future slides animate */
  useEffect(() => {
    if (!snap) return;
    const id = requestAnimationFrame(() => setSnap(false));
    return () => cancelAnimationFrame(id);
  }, [snap]);

  /* Auto-scroll */
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setTrackIndex((i) => i + 1);
    }, AUTOSCROLL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const prev = useCallback(() => {
    setPaused(true);
    setTrackIndex((i) => i - 1);
  }, []);

  const next = useCallback(() => {
    setPaused(true);
    setTrackIndex((i) => i + 1);
  }, []);

  /* Dot: which real product is at the left of the visible window */
  const realIndex = ((trackIndex - CLONE) % n + n) % n;

  const showPopup = useCallback((i: number) => {
    if (closeTimer.current !== undefined) window.clearTimeout(closeTimer.current);
    setHovered(i);
    setPaused(true);
  }, []);

  const hidePopup = useCallback(() => {
    closeTimer.current = window.setTimeout(() => {
      setHovered(null);
      setPaused(false);
    }, 200);
  }, []);

  return (
    <div className="popular-carousel" style={{ "--pop-ext-n": extN } as CSSProperties}>
      <div className="popular-viewport">
        <ul
          className="popular-track"
          style={{
            width: `calc(var(--pop-ext-n) * 100% / ${VISIBLE})`,
            transform: `translateX(calc(-${trackIndex} * 100% / var(--pop-ext-n)))`,
            transition: snap ? "none" : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((product, i) => (
            <li key={`${product.slug}-${i}`} className="popular-card-wrap">
              <div
                className="popular-card-inner"
                onMouseEnter={() => showPopup(i)}
                onMouseLeave={hidePopup}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="popular-card-link"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <div className="popular-card-media">
                    <CatalogImage
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 80rem) 20vw, (min-width: 52rem) 25vw, 50vw"
                    />
                  </div>
                </Link>

                <div
                  className="popular-card-popup"
                  data-open={hovered === i ? "true" : undefined}
                  aria-hidden={hovered !== i}
                  inert={hovered !== i}
                  onMouseEnter={() => showPopup(i)}
                  onMouseLeave={hidePopup}
                >
                  <p className="popular-popup-name">{product.name}</p>
                  <p className="popular-popup-price">{product.price}</p>
                  <Link href={`/products/${product.slug}`} className="popular-popup-link">
                    View product ↗
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="popular-btn popular-btn--prev"
        onClick={prev}
        aria-label="Previous"
      >
        ←
      </button>
      <button
        type="button"
        className="popular-btn popular-btn--next"
        onClick={next}
        aria-label="Next"
      >
        →
      </button>

      <div className="popular-dots" role="tablist" aria-label="Slides">
        {products.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === realIndex}
            className="popular-dot"
            data-active={i === realIndex ? "true" : undefined}
            onClick={() => {
              setTrackIndex(CLONE + i);
              setPaused(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
