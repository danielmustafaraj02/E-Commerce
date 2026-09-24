"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type HeroSlide = { src: string; alt: string; href: string | null };

const INTERVAL_MS = 5000;

export function HeroNecklaceCarousel({
  slides,
  sizes,
  previousLabel,
  nextLabel,
}: {
  slides: HeroSlide[];
  sizes: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused, index]);

  const active = slides[index];

  return (
    <div
      className="shelf-bead-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="shelf-bead">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            aria-hidden={i === index ? undefined : true}
            fill
            sizes={sizes}
            className={i === index ? "is-active" : undefined}
            {...(i === 0 ? { loading: "eager", fetchPriority: "high" } : {})}
          />
        ))}
        {active.href && (
          <Link href={active.href} className="shelf-bead-link" aria-label={active.alt} />
        )}
      </div>
      {count > 1 && (
        <div className="shelf-bead-controls">
          <button
            type="button"
            aria-label={previousLabel}
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <span className="shelf-bead-count" aria-hidden="true">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => setIndex((i) => (i + 1) % count)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
