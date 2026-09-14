"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { CarouselNavButton } from "@/components/carousel-nav-button";

type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  productName: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-primary flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel({
  testimonials,
  prevLabel,
  nextLabel,
}: {
  testimonials: Testimonial[];
  prevLabel: string;
  nextLabel: string;
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center gap-2">
      <CarouselNavButton direction="prev" refCallback={setPrevEl} label={prevLabel} />
      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{ prevEl, nextEl }}
        spaceBetween={20}
        slidesPerView={1.1}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={testimonials.length > 3}
        className="testimonials-swiper min-w-0 flex-1"
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id} className="h-auto">
            <figure className="border-foreground/10 bg-surface flex h-full flex-col gap-3 rounded-lg border p-5">
              <Stars rating={testimonial.rating} />
              <blockquote className="text-foreground/80 flex-1 text-sm leading-relaxed">
                &ldquo;{testimonial.comment}&rdquo;
              </blockquote>
              <figcaption className="text-foreground/50 text-xs font-medium">
                {testimonial.authorName} &middot; {testimonial.productName}
              </figcaption>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
      <CarouselNavButton direction="next" refCallback={setNextEl} label={nextLabel} />
    </div>
  );
}
