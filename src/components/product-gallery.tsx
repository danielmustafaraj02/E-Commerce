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

// Desktop uses a thumb rail + zoom photo; mobile uses a one-image-at-a-time
// swipe carousel. Both presentations open the same full-screen viewer. Which
// one shows is decided by shop.css's .shop-gallery-desktop/.shop-gallery-mobile rules.
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

  // A product with no photograph at all (an unlisted payment-test product, or
  // a piece whose shots haven't been uploaded yet) would otherwise leave the
  // whole left column blank and the page looking broken. A quiet framed panel
  // holds the same space the photo would. Purely decorative, so it carries no
  // text to translate and is hidden from assistive tech — the name, price and
  // description beside it already say what the product is.
  if (images.length === 0) {
    return (
      <div className="shop-gallery">
        <div className="shop-product-photo shop-photo-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <circle cx="8.75" cy="9.75" r="1.6" />
            <path d="M3.5 17.2l4.9-4.6a1.7 1.7 0 0 1 2.3 0l5.2 4.9" />
            <path d="M14.2 14.4l2.2-2a1.7 1.7 0 0 1 2.3 0l1.8 1.6" />
          </svg>
        </div>
      </div>
    );
  }

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
                sizes="(max-width: 639px) calc(100vw - 40px), 1px"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
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
                  const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
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
