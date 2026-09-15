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
        spaceBetween={20}
        slidesPerView={2.2}
        breakpoints={{
          640: { slidesPerView: 3.2 },
          1024: { slidesPerView: categories.length > 4 ? 4.2 : categories.length },
        }}
        className="min-w-0 flex-1"
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="border-foreground/10 group flex flex-col gap-3 rounded-xl border p-3 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
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
              </div>
              <span className="group-hover:text-primary px-0.5 text-[0.95rem] font-semibold transition-colors">
                {category.name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <CarouselNavButton direction="next" refCallback={setNextEl} label={nextLabel} />
    </div>
  );
}
