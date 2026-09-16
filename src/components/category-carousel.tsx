"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
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

export function CategoryCarousel({
  categories,
  prevLabel,
  nextLabel,
}: {
  categories: Category[];
  prevLabel: string;
  nextLabel: string;
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center gap-2">
      <CarouselNavButton direction="prev" refCallback={setPrevEl} label={prevLabel} />
      <Swiper
        modules={[Navigation]}
        navigation={{ prevEl, nextEl }}
        spaceBetween={28}
        slidesPerView={2.2}
        breakpoints={{
          640: { slidesPerView: 3.2 },
          1024: { slidesPerView: categories.length > 4 ? 4.2 : categories.length },
        }}
        className="min-w-0 flex-1 px-2 py-10"
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
                className="category-card border-foreground/10 group relative flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_6px_16px_-6px_var(--accent),0_22px_40px_-24px_var(--accent)] active:translate-y-0 active:scale-[0.97] active:bg-[color-mix(in_srgb,var(--accent)_14%,var(--background))] active:shadow-[0_2px_10px_-4px_var(--accent)] active:duration-100"
              >
                <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-lg">
                  {category.image ? (
                    <Image
                      src={category.image.url}
                      alt={category.image.altText || category.name}
                      fill
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 45vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <Image
                      src={`https://loremflickr.com/480/360/${encodeURIComponent(category.slug)}`}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 45vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  )}
                  {/* Accent-tinted wash that fades in on hover, echoing the card's
                      own accent color instead of a generic dark overlay. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(0deg, ${accent}40, transparent 60%)` }}
                  />
                </div>
                <span className="group-hover:text-primary flex items-center justify-between gap-2 px-0.5 text-[0.95rem] font-semibold transition-colors">
                  {category.name}
                  <span
                    aria-hidden
                    className="text-primary -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    →
                  </span>
                </span>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <CarouselNavButton direction="next" refCallback={setNextEl} label={nextLabel} />
    </div>
  );
}
