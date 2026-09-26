"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";
import { CarouselNavButton } from "@/components/carousel-nav-button";

type Category = {
  id: string;
  slug: string;
  name: string;
  image: { url: string; altText: string } | null;
};

// Same three colors used across the site's decorative backgrounds
// (hero, newsletter, "why shop with us" icons) — cycled per card so the
// row reads as a matched set rather than another plain white grid.
const ACCENT_COLORS = ["#f5c451", "#7cc7c0", "#e8607f"];

// Per-card entrance stagger (see .category-card in globals.css), capped so a
// long category list doesn't push the last cards' animation past ~half a
// second.
const CARD_STAGGER_MS = 70;
const MAX_STAGGER_MS = 560;

const ROMAN_NUMERALS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num: number): string {
  let n = num;
  let result = "";
  for (const [value, symbol] of ROMAN_NUMERALS) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

export function CategoryCarousel({
  categories,
  discoverLabel,
  prevLabel,
  nextLabel,
}: {
  categories: Category[];
  discoverLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex w-full items-center gap-3">
      <CarouselNavButton direction="prev" refCallback={setPrevEl} label={prevLabel} />
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{ prevEl, nextEl }}
        pagination={{ clickable: true }}
        spaceBetween={24}
        slidesPerView={1}
        loop
        className="category-showcase min-w-0 flex-1 pb-10"
      >
        {categories.map((category, index) => {
          const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
          return (
            <SwiperSlide key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                style={
                  {
                    "--accent": accent,
                    "--card-delay": `${Math.min(index * CARD_STAGGER_MS, MAX_STAGGER_MS)}ms`,
                  } as React.CSSProperties
                }
                className="category-card border-foreground/10 group flex flex-row items-center gap-6 rounded-2xl border p-6 transition-all duration-300 ease-out hover:shadow-[0_6px_16px_-6px_var(--accent),0_22px_40px_-24px_var(--accent)] sm:gap-10 sm:p-10"
              >
                <div className="relative aspect-square w-2/5 shrink-0 overflow-hidden rounded-lg sm:w-1/2">
                  {category.image ? (
                    <Image
                      src={category.image.url}
                      alt={category.image.altText || category.name}
                      fill
                      sizes="(min-width: 640px) 40vw, 45vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <Image
                      src={`https://loremflickr.com/480/480/${encodeURIComponent(category.slug)}`}
                      alt={category.name}
                      fill
                      sizes="(min-width: 640px) 40vw, 45vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
                  <span
                    style={{ color: accent }}
                    className="font-serif text-lg italic"
                    aria-hidden="true"
                  >
                    {toRoman(index + 1)}
                  </span>
                  <span className="truncate text-xl font-semibold sm:text-3xl">
                    {category.name}
                  </span>
                  <span className="group-hover:text-primary text-foreground/70 mt-1 flex items-center gap-2 text-xs font-medium tracking-wide uppercase transition-colors sm:text-sm">
                    {discoverLabel}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <CarouselNavButton direction="next" refCallback={setNextEl} label={nextLabel} />
    </div>
  );
}
