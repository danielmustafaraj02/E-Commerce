"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import {
  showcaseImageVars,
  showcaseElementVars,
  showcaseRoot,
  type ShowcaseScroll,
  type ShowcaseSceneOverride,
} from "@/lib/showcase-options";
import type { ShowcasePiece } from "@/lib/showcase-pieces";
import type { ShowcaseReason } from "@/lib/showcase-reasons";
import "./collection-showcase.css";

export type ShowcaseItem = ShowcaseSceneOverride & {
  id: string;
  href: string;
  name: string;
  image: string;
  description: string;
  cta: string;
  /** The product in the hover card over the picture (no longer shown). */
  piece?: ShowcasePiece;
  /** Which collection this is. Picks the colour block behind the piece. */
  scene: "necklace" | "bracelet" | "earrings";
  /** The "why Murano" reason this scene tells. When present it is the heading
   *  and text; the collection stays in the tab, the button and the photograph. */
  reason?: ShowcaseReason;
  /** Which side the text sits on (wide screens); absent = alternating. */
  side?: "left" | "right";
  imageScale?: number;
  imageX?: number;
  imageY?: number;
};

const COPY_SIDE: Record<ShowcaseItem["scene"], "left" | "right"> = {
  necklace: "left",
  bracelet: "right",
  earrings: "left",
};

/**
 * The collections showcase: numbered tabs (01 Necklaces · 02 Bracelets ·
 * 03 Earrings) over one scene at a time — photograph, heading, text, button.
 *
 * There is deliberately no scroll animation: nothing is pinned, nothing moves
 * while the page scrolls, and a scene changes only when the reader picks a tab.
 * The same layout serves phones and desktops; it just goes from stacked to
 * side by side.
 */
export function CollectionShowcase({
  items,
  railLabel = "Collections",
  preloadFirstImage = false,
  options,
}: {
  items: ShowcaseItem[];
  /** Accessible name for the tab list. */
  railLabel?: string;
  /** Opt in only when this section is placed above the fold. */
  preloadFirstImage?: boolean;
  /** Look chosen in the visual editor. */
  options?: ShowcaseScroll;
}) {
  const root = showcaseRoot(options);
  const withReasons = items.some((item) => item.reason);
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const rail = useRef<HTMLElement | null>(null);

  /* The tabs cycle on their own while they are on screen, so a visitor sees
     that each one opens a different collection. The timing is a CSS
     animation on the active tab's underline (it also shows the countdown):
     it ends -> next tab. It pauses on hover/focus, never runs for reduced
     motion (the animation is off, so it never ends), and stops for good
     once the visitor picks a tab themselves. */
  const [auto, setAuto] = useState(items.length > 1);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = rail.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.6,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (index: number, focus = false) => {
    setAuto(false);
    setActive(index);
    if (focus) tabs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <div
      className="showcase"
      {...root.attrs}
      data-reasons={withReasons ? "" : undefined}
      style={root.vars as React.CSSProperties}
    >
      <div className="showcase-stage">
        <nav
          ref={rail}
          className="showcase-rail"
          aria-label={railLabel}
          data-showcase-rail
          data-auto={auto && inView ? "" : undefined}
        >
          <div role="tablist" aria-label={railLabel} className="showcase-tabs">
            {items.map((item, i) => (
              <button
                key={item.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`showcase-tab-${item.id}`}
                aria-selected={i === active}
                aria-controls={`showcase-panel-${item.id}`}
                tabIndex={i === active ? 0 : -1}
                className="showcase-tab"
                data-state={i === active ? "active" : "idle"}
                onClick={() => select(i)}
                onAnimationEnd={(event) => {
                  if (event.animationName === "showcase-tab-timer" && i === active) {
                    setActive((i + 1) % items.length);
                  }
                }}
                onKeyDown={(event) => onKeyDown(event, i)}
              >
                <span className="showcase-tab-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="showcase-tab-name">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="showcase-content">
          {items.map((item, i) => (
            <section
              key={item.id}
              id={`showcase-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`showcase-tab-${item.id}`}
              className="showcase-scene"
              data-scene={i}
              data-placement={item.scene}
              data-active={i === active ? "true" : "false"}
              style={{ ...showcaseImageVars(item), ...showcaseElementVars(item) } as React.CSSProperties}
            >
              <div className="showcase-figure">
                <CatalogImage
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 52rem) 34rem, (min-width: 25rem) 22rem, 90vw"
                  preload={preloadFirstImage && i === 0}
                  className="showcase-image"
                />
              </div>

              <div
                className="showcase-copy"
                data-scene-copy
                data-side={item.side ?? COPY_SIDE[item.scene]}
              >
                <p className="showcase-index" aria-hidden="true">
                  <span className="showcase-index-current">{String(i + 1).padStart(2, "0")}</span>
                  <span className="showcase-index-sep">/</span>
                  <span className="showcase-index-total">{String(items.length).padStart(2, "0")}</span>
                </p>
                <h2 className="showcase-title">{item.reason?.title ?? item.name}</h2>
                {item.reason ? (
                  <p className="showcase-description">
                    <span className="showcase-reason-full">{item.reason.body}</span>
                    <span className="showcase-reason-short">{item.reason.short}</span>
                  </p>
                ) : (
                  <p className="showcase-description">{item.description}</p>
                )}
                <Link className="btn-primary btn-arrow showcase-cta" href={item.href}>
                  {item.cta}
                  <span className="btn-arrow-glyph" aria-hidden="true">
                    &#8594;
                  </span>
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
