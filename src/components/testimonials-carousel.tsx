"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
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

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-primary flex gap-0.5">
      <span className="sr-only">{rating} / 5</span>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          aria-hidden="true"
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
  pauseLabel,
  playLabel,
}: {
  testimonials: Testimonial[];
  prevLabel: string;
  nextLabel: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [paused, setPaused] = useState(false);

  // Auto-rotating content needs a way to stop it (WCAG 2.2.2), and must not
  // move at all for visitors who asked the OS to reduce motion.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
  const running = !reducedMotion && !paused;

  useEffect(() => {
    const autoplay = swiper?.autoplay;
    if (!autoplay) return;
    if (running) autoplay.start();
    else autoplay.stop();
  }, [swiper, running]);

  return (
    <div
      // Also hold still while focus is inside (a keyboard user reading a card),
      // not just while the mouse is over it.
      onFocusCapture={() => swiper?.autoplay?.pause()}
      onBlurCapture={() => {
        if (running) swiper?.autoplay?.resume();
      }}
    >
      {!reducedMotion && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="btn-secondary px-3 py-1 text-xs"
          >
            {paused ? playLabel : pauseLabel}
          </button>
        </div>
      )}
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
          onSwiper={setSwiper}
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
    </div>
  );
}
