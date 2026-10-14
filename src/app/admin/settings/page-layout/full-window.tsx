"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Lifts the editor out of the admin page into a layer that fills the browser
 * window, the way a design tool opens a document. While it is open the page
 * underneath neither scrolls nor takes keyboard focus or screen-reader
 * attention (`inert`); leaving the editor restores both.
 *
 * Nothing renders until the browser has mounted it (the layer lives in
 * document.body), so the server sends `fallback` instead.
 */
export function FullWindow({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const layer = document.createElement("div");
    layer.dataset.editorWindow = "";
    document.body.append(layer);
    // Only what this layer made inert is released again afterwards.
    const covered = [...document.body.children].filter(
      (el) => el !== layer && !el.hasAttribute("inert")
    );
    covered.forEach((el) => el.setAttribute("inert", ""));
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    // Mount-time portal target: the layer exists only in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHost(layer);
    return () => {
      covered.forEach((el) => el.removeAttribute("inert"));
      root.style.overflow = overflow;
      layer.remove();
    };
  }, []);

  return host ? createPortal(children, host) : <>{fallback}</>;
}
