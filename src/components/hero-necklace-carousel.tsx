"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/components/localized-link";
import { ImageLightbox } from "@/components/image-lightbox";

export type HeroSlide = {
  src: string;
  alt: string;
  label?: string;
  href: string | null;
  accent: string;
};

const INTERVAL_MS = 5000;

export function HeroNecklaceCarousel({
  slides,
  sizes,
  previousLabel,
  nextLabel,
  zoomLabels,
}: {
  slides: HeroSlide[];
  sizes: string;
  previousLabel: string;
  nextLabel: string;
  zoomLabels: { open: string; close: string; hint: string; viewPiece: string };
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused || zoomed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused, zoomed, index]);

  const active = slides[index];
  const rootRef = useRef<HTMLDivElement>(null);

  // The hero's button wears the showing necklace's colour (--hero-accent,
  // read by home.css); the page sets the first one so there's no flash.
  useEffect(() => {
    const hero = rootRef.current?.closest<HTMLElement>(".shelf-hero");
    hero?.style.setProperty("--hero-accent", active.accent);
  }, [active.accent]);
  const touchStartX = useRef<number | null>(null);
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    // Only a real mouse hovering pauses it: a tap fires pointerenter without a
    // matching leave, and a clicked arrow keeps focus, so either would freeze it.
    <div
      ref={rootRef}
      className="shelf-bead-carousel"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
    >
      <div
        className="shelf-bead"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            aria-hidden={i === index ? undefined : true}
            fill
            sizes={sizes}
            quality={90}
            className={i === index ? "is-active" : undefined}
          />
        ))}
        {active.href && (
          <Link href={active.href} className="shelf-bead-link" aria-label={active.alt} />
        )}
        {/* Phones only (home.css): the photo opens full screen instead of
            linking straight away, since a thumb-sized necklace can't show
            its beads. The viewer carries the link on to the piece. */}
        <button
          type="button"
          className="shelf-bead-zoom"
          aria-label={`${zoomLabels.open}: ${active.alt}`}
          onClick={() => setZoomed(true)}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-4.9-4.9M10.5 7.5v6M7.5 10.5h6" />
          </svg>
        </button>
      </div>
      {active.label && (
        <span key={active.src} className="shelf-bead-caption" aria-hidden="true">
          {active.label}
        </span>
      )}
      {count > 1 && (
        <div className="shelf-bead-controls">
          <button
            type="button"
            aria-label={previousLabel}
            onClick={() => go(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12H3m6-6-6 6 6 6" />
            </svg>
          </button>
          <span className="shelf-bead-count" aria-hidden="true">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => go(1)}
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12h18m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>
      )}
      {count > 1 && (
        <div className="shelf-bead-thumbs">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              className="shelf-bead-thumb"
              aria-label={slide.label ?? `${i + 1} / ${count}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <Image src={slide.src} alt="" fill sizes="64px" quality={70} />
            </button>
          ))}
        </div>
      )}
      {zoomed && (
        <ImageLightbox
          images={slides.map((slide) => ({
            src: slide.src,
            alt: slide.alt,
            caption: slide.label,
            href: slide.href,
          }))}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setZoomed(false)}
          labels={{
            close: zoomLabels.close,
            previous: previousLabel,
            next: nextLabel,
            hint: zoomLabels.hint,
            viewPiece: zoomLabels.viewPiece,
          }}
        />
      )}
    </div>
  );
}
