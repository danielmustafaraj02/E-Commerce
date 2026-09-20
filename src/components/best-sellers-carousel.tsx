"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ProductCard } from "@/components/product-card";
import { CarouselNavButton } from "@/components/carousel-nav-button";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  stockQty: number;
  images: { url: string; altText: string }[];
};

export function BestSellersCarousel({
  products,
  locale,
  outOfStockLabel,
  quickAddLabel,
  addedLabel,
  prevLabel,
  nextLabel,
}: {
  products: Product[];
  locale: string;
  outOfStockLabel: string;
  quickAddLabel: string;
  addedLabel?: string;
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
        spaceBetween={24}
        slidesPerView={2}
        breakpoints={{ 640: { slidesPerView: 4 } }}
        className="min-w-0 flex-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product.slug}>
            <ProductCard
              product={product}
              locale={locale}
              outOfStockLabel={outOfStockLabel}
              quickAddLabel={quickAddLabel}
              addedLabel={addedLabel}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <CarouselNavButton direction="next" refCallback={setNextEl} label={nextLabel} />
    </div>
  );
}
