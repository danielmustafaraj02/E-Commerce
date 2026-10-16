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
// swipe carousel with a thumbnail strip beneath. Both presentations open the
// same full-screen viewer. Which
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
  const [swiped, setSwiped] = useState(false);
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

      <div className="shop-gallery-mobile" data-swiped={swiped || undefined}>
        <div className="shop-gallery-stage">
          <div
            ref={mobileRailRef}
            className="shop-gallery-swipe"
            role="region"
            aria-roledescription="carousel"
            aria-label={alt}
            onScroll={(event) => {
              // The current photo is the one whose leading edge sits nearest
              // the rail's — measured on screen, where scrollLeft would run
              // negative on right-to-left pages.
              const rail = event.currentTarget;
              const rtl = getComputedStyle(rail).direction === "rtl";
              const box = rail.getBoundingClientRect();
              let nextIndex = 0;
              let nearest = Infinity;
              Array.from(rail.children).forEach((item, index) => {
                const itemBox = item.getBoundingClientRect();
                const offset = Math.abs(rtl ? box.right - itemBox.right : itemBox.left - box.left);
                if (offset < nearest) {
                  nearest = offset;
                  nextIndex = index;
                }
              });
              if (rail.scrollLeft !== 0) setSwiped(true);
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
          {/* Over the photo in view: where you are in the set, and that a tap
              opens it larger. Decorative — the photo buttons and thumbnails
              already say both — and they let taps through to the photo. The
              zoom label folds to its icon once the visitor has swiped. */}
          {images.length > 1 && (
            <span className="shop-gallery-count" aria-hidden="true">
              {selected + 1} / {images.length}
            </span>
          )}
          <span className="shop-gallery-zoom-chip" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
            </svg>
            <span className="shop-gallery-zoom-label">{zoomLabels.open}</span>
          </span>
        </div>
        {/* Thumbnails rather than dots, so the rest of the set is visible
            before anyone swipes to it. */}
        {images.length > 1 && (
          <div className="shop-gallery-strip" aria-label={alt}>
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`${alt} ${index + 1}`}
                aria-current={index === selected ? "true" : undefined}
                className={`shop-thumb shop-thumb--strip ${index === selected ? "shop-thumb--active" : ""}`}
                onClick={() => {
                  setSelected(index);
                  setSwiped(true);
                  const item = mobileRailRef.current?.children[index];
                  if (!item) return;
                  const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
                  item.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "nearest",
                    inline: "start",
                  });
                }}
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
