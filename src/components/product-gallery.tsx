"use client";

import { useRef, useState } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { ProductImageZoom } from "@/components/product-image-zoom";
import { ImageLightbox } from "@/components/image-lightbox";

export type GalleryZoomLabels = {
  open: string;
  close: string;
  previous: string;
  next: string;
  hint: string;
};

// Desktop uses a thumb rail + zoom photo; mobile stacks every photo vertically.
// Either presentation opens the same full-screen viewer. Which one shows is
// decided by shop.css's .shop-gallery-desktop/.shop-gallery-mobile rules.
export function ProductGallery({
  images,
  alt,
  zoomLabels,
}: {
  images: { id: string; url: string; isLifestyle?: boolean }[];
  alt: string;
  zoomLabels: GalleryZoomLabels;
}) {
  const [selected, setSelected] = useState(0);
  const [zoomAt, setZoomAt] = useState<number | null>(null);
  const mobileRailRef = useRef<HTMLDivElement>(null);
  const active = images[selected] ?? images[0];

  return (
    <div className="shop-gallery">
      <div className="shop-gallery-desktop">
        {images.length > 1 && (
          <div className="shop-gallery-thumbs">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`${alt} ${index + 1}`}
                aria-current={index === selected}
                className={`shop-thumb ${index === selected ? "shop-thumb--active" : ""}`}
              >
                <CatalogImage
                  src={image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className={image.isLifestyle ? "shop-photo--lifestyle" : undefined}
                />
              </button>
            ))}
          </div>
        )}
        {active && (
          <ProductImageZoom
            src={active.url}
            alt={alt}
            isLifestyle={active.isLifestyle}
            onOpen={() => setZoomAt(selected)}
            openLabel={zoomLabels.open}
          />
        )}
      </div>

      <div className="shop-gallery-mobile">
        <div
          ref={mobileRailRef}
          className="shop-gallery-swipe"
          role="region"
          aria-roledescription="carousel"
          aria-label={alt}
          onScroll={(event) => {
            const rail = event.currentTarget;
            const nextIndex = Math.round(rail.scrollLeft / rail.clientWidth);
            setSelected((current) => (current === nextIndex ? current : nextIndex));
          }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="shop-product-photo shop-gallery-swipe-item"
              aria-label={`${zoomLabels.open}: ${alt} ${index + 1}`}
              onClick={() => setZoomAt(index)}
            >
              <CatalogImage
                src={image.url}
                alt={alt}
                fill
                sizes="100vw"
                className={image.isLifestyle ? "shop-photo--lifestyle" : undefined}
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="shop-gallery-pagination" aria-label={alt}>
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`${alt} ${index + 1}`}
                aria-current={index === selected ? "true" : undefined}
                onClick={() => {
                  setSelected(index);
                  const rail = mobileRailRef.current;
                  if (!rail) return;
                  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  rail.scrollTo({
                    left: index * rail.clientWidth,
                    behavior: reduceMotion ? "auto" : "smooth",
                  });
                }}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomAt !== null && (
        <ImageLightbox
          images={images.map((image) => ({ src: image.url, alt, isLifestyle: image.isLifestyle }))}
          index={zoomAt}
          onIndexChange={(index) => {
            setZoomAt(index);
            setSelected(index);
          }}
          onClose={() => setZoomAt(null)}
          labels={zoomLabels}
        />
      )}
    </div>
  );
}
