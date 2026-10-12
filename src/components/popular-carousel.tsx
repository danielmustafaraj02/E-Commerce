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

const SWIPE_PX = 40;
const CLONE = 5; /* items cloned at each end — must be >= the max visible count (see CSS) */

export type PopularCarouselLabels = {
  /** Names the group of slide buttons, e.g. the section title. */
  slides: string;
  previous: string;
  next: string;
};

const DEFAULT_LABELS: PopularCarouselLabels = {
  slides: "Slides",
  previous: "Previous",
  next: "Next",
};

export function PopularCarousel({
  products,
  labels = DEFAULT_LABELS,
}: {
  products: PopularProduct[];
  labels?: PopularCarouselLabels;
}) {
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
  const touchX = useRef<number | null>(null);
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

  const prev = useCallback(() => {
    setTrackIndex((i) => i - 1);
  }, []);

  const next = useCallback(() => {
    setTrackIndex((i) => i + 1);
  }, []);

  /* Dot: which real product is at the left of the visible window */
  const realIndex = ((trackIndex - CLONE) % n + n) % n;

  return (
    <div
      className="popular-carousel"
      style={{ "--pop-ext-n": extN } as CSSProperties}
    >
      <div
        className="popular-viewport"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < SWIPE_PX) return;
          if (dx < 0) next();
          else prev();
        }}
      >
        <ul
          className="popular-track"
          style={{
            width: "calc(var(--pop-ext-n) * 100% / var(--pop-visible))",
            transform: `translateX(calc(-${trackIndex} * 100% / var(--pop-ext-n)))`,
            transition: snap ? "none" : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((product, i) => (
            <li key={`${product.slug}-${i}`} className="popular-card-wrap">
              <div className="popular-card-inner">
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
                      sizes="(min-width: 80rem) 14vw, (min-width: 64rem) 18vw, (min-width: 48rem) 25vw, (min-width: 36rem) 40vw, calc(100vw - 6.25rem)"
                    />
                  </div>
                </Link>

              </div>
              {/* The editorial caption: number, name and price, always shown,
                  as under a photograph in a magazine. */}
              <Link
                href={`/products/${product.slug}`}
                className="popular-caption"
                tabIndex={i >= CLONE && i < CLONE + n ? undefined : -1}
                aria-hidden={i < CLONE || i >= CLONE + n ? true : undefined}
              >
                <span className="popular-caption-index">
                  {String(((((i - CLONE) % products.length) + products.length) % products.length) + 1).padStart(2, "0")}
                </span>
                <span className="popular-caption-name">{product.name}</span>
                <span className="popular-caption-price">{product.price}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="popular-btn popular-btn--prev"
        onClick={prev}
        aria-label={labels.previous}
      >
        <svg
          width="28"
          height="18"
          viewBox="0 0 32 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M29 10H3M9 4l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        className="popular-btn popular-btn--next"
        onClick={next}
        aria-label={labels.next}
      >
        <svg
          width="28"
          height="18"
          viewBox="0 0 32 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M3 10h26M23 4l6 6-6 6" />
        </svg>
      </button>

      <div className="popular-dots" role="group" aria-label={labels.slides}>
        {products.map((product, i) => (
          <button
            key={product.slug}
            type="button"
            aria-label={product.name}
            aria-current={i === realIndex ? "true" : undefined}
            className="popular-dot"
            data-active={i === realIndex ? "true" : undefined}
            onClick={() => setTrackIndex(CLONE + i)}
          />
        ))}
      </div>
    </div>
  );
}
