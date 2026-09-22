"use client";

import { useState } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { ProductImageZoom } from "@/components/product-image-zoom";

export function ProductGallery({
  images,
  alt,
}: {
  images: { id: string; url: string }[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const active = images[selected] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      {active && <ProductImageZoom src={active.url} alt={alt} />}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === selected}
              className={`shop-thumb ${index === selected ? "shop-thumb--active" : ""}`}
            >
              <CatalogImage src={image.url} alt="" fill sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
