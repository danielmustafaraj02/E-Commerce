"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayoutEntry } from "@/lib/page-layout";
import styles from "./design-thumb.module.css";
import {
  hasPreviewContent,
  localizeEntry,
  previewDocument,
  type PageSnapshot,
} from "./section-preview";

/** The screen a miniature is drawn on before it is scaled down: a computer's.
 *  The frame is never shorter than that screen, so sections sized in vh look as
 *  they do on the site; the thumbnail then shows only what it needs. */
const DRAWN_WIDTH = 1280;
const SCREEN_HEIGHT = 820;

// No scripts run in the frame, so scroll animations are shown in their final
// state and idle loops stand still.
const STILL = "<style>.bld-an{--bm-p:1!important;transition:none!important}*,*::before,*::after{animation-play-state:paused!important}</style>";

/**
 * A miniature of a section design: the real section, drawn at computer width
 * with the site's own CSS in a sandboxed frame and scaled down to fit. The frame
 * is only created once the thumbnail comes near the screen, so a gallery of
 * dozens stays light.
 *
 * `height`: "crop" shows the top of the design in a fixed 16:9 window (galleries);
 * a number shows the whole design scaled, up to that many pixels tall (the page
 * overview), fading out when it is cut.
 */
export function DesignThumb({
  entry,
  snapshot,
  siteText,
  height = "crop",
}: {
  entry: LayoutEntry;
  snapshot: PageSnapshot | null;
  siteText?: Record<string, string>;
  height?: "crop" | number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const resize = new ResizeObserver(() => setWidth(el.clientWidth));
    resize.observe(el);
    setWidth(el.clientWidth);
    // Once drawn, a thumbnail stays: drawing it again on every scroll would flicker.
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          seen.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    seen.observe(el);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  const localized = useMemo(() => localizeEntry(entry, siteText), [entry, siteText]);
  const empty = !!snapshot && !hasPreviewContent(localized, snapshot);
  const doc = useMemo(
    () =>
      near && snapshot && !empty
        ? previewDocument({ ...localized, visible: true }, snapshot, false).replace(
            "</head>",
            `${STILL}</head>`
          )
        : null,
    [near, snapshot, empty, localized]
  );

  const scale = width > 0 ? width / DRAWN_WIDTH : 0;
  const shown =
    height === "crop"
      ? width * (9 / 16)
      : Math.min(height, Math.max(48, contentHeight * scale || height * 0.5));
  const cut = height !== "crop" && contentHeight * scale > height;

  // The section's own height: the document is never shorter than the frame, so
  // it would report the frame's height for a short design.
  const measure = () => {
    const main = frame.current?.contentDocument?.querySelector("main");
    if (main) setContentHeight(Math.ceil(main.getBoundingClientRect().height));
  };

  return (
    <div
      ref={host}
      className={styles.thumb}
      data-loaded={loaded || empty ? "" : undefined}
      data-cut={cut ? "" : undefined}
      style={{ height: shown || undefined }}
      aria-hidden="true"
    >
      {empty ? (
        <span className={styles.empty}>Nothing to show yet</span>
      ) : (
        doc &&
        scale > 0 && (
          <iframe
            ref={frame}
            title=""
            tabIndex={-1}
            // No scripts; same-origin only so the site's fonts and CSS load.
            sandbox="allow-same-origin"
            srcDoc={doc}
            onLoad={() => {
              setLoaded(true);
              measure();
              const d = frame.current?.contentDocument;
              d?.fonts?.ready.then(measure);
              d?.addEventListener("load", measure, true);
            }}
            className={styles.frame}
            style={{
              width: DRAWN_WIDTH,
              height: Math.max(SCREEN_HEIGHT, Math.ceil(shown / scale)),
              transform: `scale(${scale})`,
            }}
          />
        )
      )}
    </div>
  );
}
