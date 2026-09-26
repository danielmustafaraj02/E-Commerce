"use client";

import { useState } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { ProductImageZoom } from "@/components/product-image-zoom";

// Two independent presentations of the same image set rather than one
// JS-synced carousel: a thumb rail + zoomable active image on desktop
// (mouse hover makes zoom meaningful), and a native scroll-snap swipe strip
// on mobile (no JS, so nothing to keep in sync with a "selected" index that
// touch scrolling would otherwise fight with). Which one shows is decided
// entirely by shop.css's .shop-gallery-desktop/.shop-gallery-swipe media
// query, not Tailwind's hidden/sm:* utilities — see the comment there.
export function ProductGallery({
  images,
  alt,
}: {
  images: { id: string; url: string; isLifestyle?: boolean }[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
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
        {active && <ProductImageZoom src={active.url} alt={alt} isLifestyle={active.isLifestyle} />}
      </div>

      <div className="shop-gallery-swipe">
        {images.map((image) => (
          <div key={image.id} className="shop-product-photo shop-gallery-swipe-item">
            <CatalogImage
              src={image.url}
              alt={alt}
              fill
              sizes="100vw"
              className={image.isLifestyle ? "shop-photo--lifestyle" : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
