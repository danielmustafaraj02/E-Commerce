"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { lookComposition } from "@/lib/look-composition";
import type { LookView } from "@/lib/look-data";

const INTERVAL_MS = 5200;
const DESKTOP_QUERY = "(min-width: 52rem)";

export function HeroLookRollercoaster({
  looks,
  previousLabel,
  nextLabel,
  carouselLabel,
}: {
  looks: LookView[];
  previousLabel: string;
  nextLabel: string;
  carouselLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = looks.length;

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setReady(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || !desktop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, desktop, paused]);

  // The home page also has a necklace carousel. Use that when there aren't
  // enough curated looks to make this carousel navigable.
  if (count < 2) return null;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div
      className="hero-look-rollercoaster"
      data-ready={ready}
      role="region"
      aria-label={carouselLabel}
      aria-roledescription="carousel"
      onPointerEnter={(event) => event.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) > 44) go(distance < 0 ? 1 : -1);
      }}
    >
      <svg
        className="hero-look-track"
        viewBox="0 0 800 520"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-look-track-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f7a85" stopOpacity=".35" />
            <stop offset=".52" stopColor="#b89a62" stopOpacity=".8" />
            <stop offset="1" stopColor="#1f7a85" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <path
          className="hero-look-track-shadow"
          d="M8 300c92 0 80-30 168-4 84 34 108-156 224-120s160 84 280 37 80-23 112 25"
        />
        <path
          className="hero-look-track-rail"
          d="M8 300c92 0 80-30 168-4 84 34 108-156 224-120s160 84 280 37 80-23 112 25"
        />
        <path
          className="hero-look-track-rail hero-look-track-rail--inner"
          d="M8 310c92 0 80-30 168-4 84 34 108-156 224-120s160 84 280 37 80-23 112 25"
        />
        <circle cx="176" cy="296" r="4" fill="#b89a62" />
        <circle cx="400" cy="176" r="4" fill="#1f7a85" />
        <circle cx="680" cy="213" r="4" fill="#b89a62" />
      </svg>

      <div className="hero-look-carriages" aria-live="off">
        {looks.map((look, lookIndex) => {
          const relative = (lookIndex - index + count) % count;
          const position =
            relative === 0
              ? "active"
              : relative === 1
                ? "next"
                : relative === count - 1
                  ? "previous"
                  : "offstage";
          const placements = lookComposition(
            look.pieces.map((piece) => ({ kind: piece.kind, selected: true }))
          );

          return (
            <Link
              key={look.id}
              href={`/looks/${look.id}`}
              className={`hero-look-carriage hero-look-carriage--${position}`}
              tabIndex={
                position === "active" || position === "next" || position === "previous" ? 0 : -1
              }
              aria-hidden={position === "offstage" ? true : undefined}
              aria-label={look.name}
            >
              <span className="hero-look-frame">
                {look.imageUrl ? (
                  <CatalogImage
                    src={look.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 52rem) 15rem, 1px"
                    className="hero-look-photo"
                    loading={position === "active" && desktop ? "eager" : "lazy"}
                    fetchPriority={position === "active" && desktop ? "high" : "auto"}
                  />
                ) : (
                  look.pieces.map((piece, pieceIndex) => {
                    if (!piece.imageUrl) return null;
                    const placement = placements[pieceIndex].desktop;
                    return (
                      <span
                        key={piece.productId}
                        className="hero-look-piece"
                        style={
                          {
                            "--look-x": placement.x,
                            "--look-y": placement.y,
                            "--look-scale": placement.s,
                          } as CSSProperties
                        }
                      >
                        <CatalogImage
                          src={piece.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 52rem) 13rem, 1px"
                          loading={position === "active" && desktop ? "eager" : "lazy"}
                          fetchPriority={position === "active" && desktop ? "high" : "auto"}
                        />
                      </span>
                    );
                  })
                )}
              </span>
              <span className="hero-look-name">{look.name}</span>
            </Link>
          );
        })}
      </div>

      {count > 1 && (
        <div className="hero-look-controls">
          <button type="button" aria-label={previousLabel} onClick={() => go(-1)}>
            <span aria-hidden="true">←</span>
          </button>
          <span className="hero-look-count" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} <i /> {String(count).padStart(2, "0")}
          </span>
          <button type="button" aria-label={nextLabel} onClick={() => go(1)}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
