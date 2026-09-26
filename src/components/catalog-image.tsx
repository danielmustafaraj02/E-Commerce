import Image, { type ImageProps } from "next/image";
import { isOptimizableSrc } from "@/lib/image-hosts";

// Drop-in for next/image wherever the src is admin-controlled data (product,
// category and logo images): images on allowlisted hosts and same-origin paths
// go through the optimizer as usual, anything else is rendered unoptimized
// rather than throwing "hostname not configured" or being proxied by us. See
// src/lib/image-hosts.ts.
export function CatalogImage(props: ImageProps) {
  // The bundled Murano catalog photos are PNGs, while older database rows
  // still refer to their former .jpeg names. Keep that stale extension from
  // turning product galleries and cart thumbnails into broken-image alt text.
  const src =
    typeof props.src === "string" && props.src.startsWith("/products/")
      ? props.src.replace(/\.jpeg(?=($|[?#]))/i, ".png")
      : props.src;
  const unoptimized =
    props.unoptimized ?? (typeof src === "string" ? !isOptimizableSrc(src) : false);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and forwarded.
  return <Image {...props} src={src} quality={90} unoptimized={unoptimized} />;
}
