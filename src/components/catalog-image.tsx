import Image, { type ImageProps } from "next/image";
import { isOptimizableSrc } from "@/lib/image-hosts";
import { publicImageSrc } from "@/lib/public-image";

// Drop-in for next/image wherever the src is admin-controlled data (product,
// category and logo images): images on allowlisted hosts and same-origin paths
// go through the optimizer as usual, anything else is rendered unoptimized
// rather than throwing "hostname not configured" or being proxied by us. See
// src/lib/image-hosts.ts.
export function CatalogImage(props: ImageProps) {
  // The bundled photos are WebP now; database rows written earlier still name
  // the .jpg/.jpeg/.png files they replaced.
  const src = typeof props.src === "string" ? publicImageSrc(props.src) : props.src;
  const unoptimized =
    props.unoptimized ?? (typeof src === "string" ? !isOptimizableSrc(src) : false);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and forwarded.
  return <Image {...props} src={src} quality={90} unoptimized={unoptimized} />;
}
