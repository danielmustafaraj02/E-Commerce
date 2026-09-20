import Image, { type ImageProps } from "next/image";
import { isOptimizableSrc } from "@/lib/image-hosts";

// Drop-in for next/image wherever the src is admin-controlled data (product,
// category and logo images): images on allowlisted hosts and same-origin paths
// go through the optimizer as usual, anything else is rendered unoptimized
// rather than throwing "hostname not configured" or being proxied by us. See
// src/lib/image-hosts.ts.
export function CatalogImage(props: ImageProps) {
  const unoptimized =
    props.unoptimized ?? (typeof props.src === "string" ? !isOptimizableSrc(props.src) : false);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and forwarded.
  return <Image {...props} unoptimized={unoptimized} />;
}
