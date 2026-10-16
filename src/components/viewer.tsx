"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Viewer } from "@/app/api/viewer/route";

// The visitor's own state (signed in, staff, wishlist, a product's review)
// for pages that are cached and therefore identical for everyone. Asked once
// per page (and product), shared by every component on it, and asked again
// after a navigation — signing in or out is one, so the header follows.
const requests = new Map<string, Promise<Viewer | null>>();

function load(pathname: string, productId?: string): Promise<Viewer | null> {
  const key = `${pathname}|${productId ?? ""}`;
  let request = requests.get(key);
  if (!request) {
    const url = productId ? `/api/viewer?productId=${encodeURIComponent(productId)}` : "/api/viewer";
    request = fetch(url, { credentials: "same-origin", cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<Viewer>) : null))
      .catch(() => null);
    // Answers for other pages are stale once the visitor has moved on.
    for (const old of requests.keys()) if (!old.startsWith(`${pathname}|`)) requests.delete(old);
    requests.set(key, request);
  }
  return request;
}

/** null while loading (render the signed-out state, which is also the cached
 *  page's), then the visitor. */
export function useViewer(productId?: string): Viewer | null {
  const pathname = usePathname();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  useEffect(() => {
    let live = true;
    load(pathname, productId).then((value) => {
      if (live) setViewer(value);
    });
    return () => {
      live = false;
    };
  }, [pathname, productId]);
  return viewer;
}
