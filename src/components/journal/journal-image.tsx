import Image from "next/image";
import { CatalogImage } from "@/components/catalog-image";
import type { JournalImage as JournalImageData } from "@/lib/journal/types";
import type { JournalProductMap } from "@/lib/journal/products";

export function journalImageSrc(image: JournalImageData, products: JournalProductMap) {
  if (image.kind === "file") return image.src;
  return products.get(image.productSlug)?.images[0]?.url ?? null;
}

// An article image with its caption and, where the licence needs one, credit.
export function JournalImage({
  image,
  products,
  sizes,
  priority = false,
  className = "",
  creditLabel,
}: {
  image: JournalImageData;
  products: JournalProductMap;
  sizes: string;
  priority?: boolean;
  className?: string;
  creditLabel: (credit: string) => string;
}) {
  const src = journalImageSrc(image, products);
  if (!src) return null;
  const showCredit = image.rights.license !== "own-photography";
  // `priority` is deprecated in Next 16; eager + high fetch priority is the
  // documented way to load an above-the-fold (LCP) image first.
  const loadingProps = priority ? ({ loading: "eager", fetchPriority: "high" } as const) : {};

  return (
    <figure className={`journal-figure ${className}`}>
      <div className="journal-figure-frame">
        {image.kind === "file" ? (
          <Image src={src} alt={image.alt} fill sizes={sizes} {...loadingProps} />
        ) : (
          <CatalogImage src={src} alt={image.alt} fill sizes={sizes} {...loadingProps} />
        )}
      </div>
      {(image.caption || showCredit) && (
        <figcaption>
          {image.caption}
          {showCredit && (
            <span className="journal-credit">
              {" "}
              {image.rights.sourceUrl ? (
                <a href={image.rights.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {creditLabel(image.rights.attribution ?? image.rights.credit)}
                </a>
              ) : (
                creditLabel(image.rights.attribution ?? image.rights.credit)
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
