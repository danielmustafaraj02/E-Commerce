"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { ShowcaseProgressRail } from "@/components/showcase-progress-rail";
import {
  activeScene,
  clamp01,
  getSceneFrame,
  railFill as railFillAt,
  readingProgress,
  sectionHeight,
} from "@/lib/showcase-timeline";
import { showcaseRoot, type ShowcaseScroll } from "@/lib/showcase-options";
import "./collection-showcase.css";

/* The per-scene mobile rail. Duplicated markup (not a CSS move) so the DOM
   structure matches the two layouts the stylesheet picks between: on phones
   the rail is a column INSIDE each animated scene, in the scene's own
   right-hand gutter beside the piece and the copy, so it stays visible and
   clickable during the transition and never overlays anything; on wider
   screens the one stage-level rail in its own reserved column is used instead
   and these are display:none. Both are the same three dots driven by the same
   onSelect and the same --rail-fill, so the two layouts can never disagree. */
function SceneRail({
  items,
  onSelect,
  label,
  active,
}: {
  items: { id: string; name: string }[];
  onSelect: (index: number) => void;
  label: string;
  active: number;
}) {
  return (
    <nav className="showcase-rail showcase-rail-scene" aria-label={label}>
      <span className="showcase-rail-track" aria-hidden="true">
        <span className="showcase-rail-fill" />
      </span>
      {items.map((item, index) => (
        <div className="showcase-rail-row" key={item.id}>
          <button
            type="button"
            className="showcase-rail-item"
            data-rail-item={index}
            data-state={index === active ? "active" : index < active ? "passed" : "upcoming"}
            aria-current={index === active ? "true" : undefined}
            aria-label={item.name}
            onClick={() => onSelect(index)}
          />
        </div>
      ))}
    </nav>
  );
}

export type ShowcaseItem = {
  id: string;
  href: string;
  name: string;
  image: string;
  description: string;
  cta: string;
  /** Which part of the sequence this scene occupies. */
  scene: "necklace" | "bracelet" | "earrings";
  /** Which side the text sits on; absent = alternating. */
  side?: "left" | "right";
};

/**
 * The collections showcase — a scroll-driven, sticky sequence.
 *
 * The page's own scroll is the timeline: the section is tall, the stage inside
 * it is pinned, and each scene's position is a pure function of scroll. Nothing
 * is timed and nothing is stored in React state, which is what makes scrolling
 * back up replay the sequence exactly in reverse rather than stranding a scene
 * mid-flight. The timing model itself lives in lib/showcase-timeline.ts so it
 * can be tested without a DOM.
 *
 * Per scene there is a full reading interval — image settled, copy at full
 * opacity, nothing moving — and between two of them a single transition in which
 * the outgoing copy fades out first, the two photographs travel, and the
 * incoming copy fades in last. That order is what stops text ever ghosting
 * across a moving image.
 *
 * One passive scroll listener and one scheduled animation frame serve the whole
 * sequence; per frame the effect writes three custom properties per scene and
 * toggles inert/aria-hidden, so scrolling never re-renders the tree.
 *
 * Everything is rendered server-side and the effect is layered on top, so with
 * no JavaScript — and under prefers-reduced-motion, where the effect never runs
 * — the reader gets the same three scenes stacked, fully readable, links
 * working. The content never depends on JavaScript.
 */

/** The custom properties written per scene, all cleared on teardown. */
const SCENE_PROPS = [
  "--scene-y",
  "--scene-scale",
  "--image-opacity",
  "--copy-opacity",
  "--copy-reveal",
] as const;

/** Which side of the jewellery axis each scene's text sits on. Alternates so
 *  each scene mirrors the previous one. When "right", CSS also flips the
 *  piece's axis so the whole composition mirrors — piece moves left, copy moves
 *  right — rather than only the copy moving while the image stays put. */
const COPY_SIDE: Record<ShowcaseItem["scene"], "left" | "right"> = {
  necklace: "left",
  bracelet: "right",
  earrings: "left",
};

export function CollectionShowcase({
  items,
  railLabel = "Collection progress",
  options,
}: {
  items: ShowcaseItem[];
  /** Accessible name for the progress rail's landmark. */
  railLabel?: string;
  /** Scroll behaviour and look chosen in the visual editor. */
  options?: ShowcaseScroll;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const root = showcaseRoot(options);
  /* Read by the scroll effect through a ref, so a change of option re-runs it. */
  const unit = root.unit;
  const transition = root.transition;

  /* Scroll so that scene `index` sits at its reading position: the exact offset
     the timeline itself puts it at, computed from the same helper the animation
     uses. Measured against the live section and stage, so it stays correct
     after a resize or a rotation. Declared at component scope because the rail
     buttons in the markup call it. */
  const scrollToScene = (index: number) => {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>(".showcase-stage");
    if (!root || !stage) return;

    const travel = root.offsetHeight - stage.getBoundingClientRect().height;
    if (travel <= 0) return;

    /* The stage pins below the sticky header, so the sequence begins when the
       section's top reaches the stage's own `top` — the same origin the
       progress calculation uses. */
    const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
    const start = root.getBoundingClientRect().top + window.scrollY - stickyTop;
    const target = start + readingProgress(index, items.length) * travel;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stage = root.querySelector<HTMLElement>(".showcase-stage");
    if (!stage) return;

    /* The column the pieces and the copy occupy. Fixed chrome is only an
       obstruction if it overlaps this horizontally — see measureChrome. */
    const content = root.querySelector<HTMLElement>(".showcase-content");

    /* Cached once: the element list does not change while the effect is alive,
       so the per-frame work is a plain loop over plain objects. */
    const entries = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]")).map((scene) => ({
      scene,
      copy: scene.querySelector<HTMLElement>("[data-scene-copy]"),
      /* The per-scene mobile rail fades and yields interactivity with its
         scene's copy, so a non-reading scene's rail (whose fill and dot
         states reflect a DIFFERENT scroll position) can never sit visible or
         clickable on top of the reading scene's. */
      sceneRail: scene.querySelector<HTMLElement>(".showcase-rail-scene"),
    }));
    if (entries.length < 2) return;

    /* The progress rail's bullets and its fill, cached with everything else. */
    const railFills = Array.from(root.querySelectorAll<HTMLElement>(".showcase-rail-fill"));
    /* Every bullet in the section — the one stage-level rail AND the per-scene
       mobile rows, which carry the same three dots. Each is paired with the
       SCENE INDEX IT STANDS FOR, read from its own data-rail-item attribute.

       Reading the index from the attribute rather than from the loop counter is
       the bug fix: querySelectorAll returns all twelve bullets in document
       order (three per scene, then the stage rail's three), so the loop counter
       gave the stage rail's dots the indices 9, 10 and 11. Compared against a
       scene index of 0…2 those are always "upcoming", which is why the desktop
       rail rendered three identical empty dots and nothing was ever active. */
    const railItems = Array.from(root.querySelectorAll<HTMLElement>("[data-rail-item]")).map(
      (item) => ({ item, index: Number(item.dataset.railItem) })
    );

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    /* True while the effect owns the DOM. Strict Mode mounts, unmounts and
       remounts, so teardown has to be complete and re-enable has to be safe. */
    let active = false;
    /* Last viewport width seen, used to tell a real reshape (rotation, or a
       desktop↔phone switch) from the resize events a phone fires when its
       browser chrome is shown or hidden. */
    let lastWidth = window.innerWidth;

    /* A rotation or a desktop↔phone switch changes the stage height, so the
       section height has to be recomputed from it. But on a phone, showing and
       hiding the address bar also fires `resize` while the WIDTH is unchanged —
       and the stage is sized in svh, which does not change with that. Rebuilding
       the timeline then would change the section height while the reader is
       mid-scroll and visibly jump the page. So a width-unchanged resize only
       refreshes the frames; a real reshape re-measures. */
    const onResize = () => {
      const width = window.innerWidth;
      const reshaped = width !== lastWidth;
      lastWidth = width;

      if (!active) return;
      measureChrome();
      /* The START offset has to be re-read on EVERY resize, not only on a
         reshape: content ABOVE the section (the hero's typing sequence, a late
         image) changes the section's document position without changing the
         stage's size, and a cached start would map scroll to the wrong scene.
         Re-measuring the start is safe on a width-unchanged resize too — the
         stage's own height is in svh and does not move, so the travel and the
         section height stay put; only the origin shifts. */
      measure();
      /* A real reshape changes the stage height, so the timeline has to be
         rebuilt from it. A width-unchanged resize (a phone showing or hiding
         its address bar) only re-reads the frames. */
      if (reshaped) {
        if (measure()) {
          root.style.height = `${sectionHeight(entries.length, stageHeight, unit)}px`;
          /* The section just changed height, so the start offset moved too. */
          measure();
        }
      }
      schedule();
    };

    /* Content above the showcase (the hero's typing sequence, late images,
       font swaps) shifts the section's document position AFTER enable() has
       cached the start offset — and a stale start maps scroll positions to
       the wrong scenes. A ResizeObserver on the body catches every one of
       those shifts (they all change the body's height) without polling, and
       without rebuilding the timeline: only the origin is re-read. */
    let bodyRO = 0;
    let lastBodyH = 0;
    const bodyObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height ?? 0;
            if (h === lastBodyH) return;
            lastBodyH = h;
            if (!active) return;
            if (bodyRO) return;
            bodyRO = requestAnimationFrame(() => {
              bodyRO = 0;
              if (!active) return;
              measureChrome();
              measure();
              schedule();
            });
          })
        : null;

    /* Coalesces chrome re-measurements onto one frame: a click can land during
       the same frame as a scroll, and measuring is a layout read. */
    let chromeRaf = 0;
    const onChromeChange = () => {
      if (!active || chromeRaf) return;
      chromeRaf = requestAnimationFrame(() => {
        chromeRaf = 0;
        if (!active) return;
        measureChrome();
        measure();
        schedule();
      });
    };

    /* The scene currently being read. Tracked so focus can be rescued exactly
       once when a copy the reader was inside becomes inert — never per frame. */
    let readingIndex = 0;

    type Entry = (typeof entries)[number];

    const clearScene = ({ scene, copy, sceneRail }: Entry) => {
      for (const prop of SCENE_PROPS) scene.style.removeProperty(prop);
      if (!copy) return;
      copy.style.removeProperty("opacity");
      copy.style.removeProperty("pointer-events");
      copy.inert = false;
      copy.removeAttribute("aria-hidden");
      if (!sceneRail) return;
      sceneRail.style.removeProperty("opacity");
      sceneRail.inert = false;
    };

    const disable = () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (bodyRO) {
        cancelAnimationFrame(bodyRO);
        bodyRO = 0;
      }
      bodyObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", schedule);
      document.removeEventListener("click", onChromeChange, { capture: true });
      if (chromeRaf) cancelAnimationFrame(chromeRaf);
      chromeRaf = 0;
      /* Height first, then the attribute: removing the live flag restores the
         stacked layout, and only then is measuring safe. */
      root.style.removeProperty("height");
      root.removeAttribute("data-scene-live");
      root.style.removeProperty("--showcase-sticky-top");
      for (const entry of entries) clearScene(entry);
      readingIndex = 0;
      stageHeight = 0;
      travel = 0;
    };

    /* Move focus off a copy that is about to become inert, exactly once, and
       only if focus is genuinely inside it. Blurring rather than re-focusing
       somewhere else leaves the next Tab from wherever the reader was, instead
       of yanking focus on every scroll frame. */
    const releaseFocusIfInside = (index: number) => {
      const copy = entries[index]?.copy;
      if (!copy) return;
      const focused = document.activeElement;
      if (!focused || !copy.contains(focused)) return;
      if (focused instanceof HTMLElement) focused.blur();
    };

    /* Measure the fixed chrome that overlays the bottom of the stage — the
       floating checkout button, the cookie-consent sheet — and publish the
       largest obstruction as the stage's bottom clearance. Measured, not
       guessed: the button's height and its offset from the viewport edge
       change with locale, zoom and font, and a stale guess either lets the
       checkout cover the progress rail or wastes half a screen. */
    const measureChrome = () => {
      /* Only chrome that actually sits UNDER THE SCENE COLUMN obstructs it.
         The test used to be vertical only, so any fixed element anywhere along
         the bottom edge reserved a full-width band — the floating help bubble
         in the bottom-left corner, 56px of button in a corner the jewellery
         never reaches, was costing 112px off the height of every piece on the
         page. Requiring a horizontal overlap with the content column keeps the
         guard where it belongs (the full-width checkout bar and the cookie
         sheet still measure exactly as before) and gives that height back. */
      const band = (content ?? stage).getBoundingClientRect();
      let inset = 0;
      for (const el of document.querySelectorAll<HTMLElement>(
        ".btn-primary.fixed, .fixed.inset-x-0"
      )) {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" || cs.display === "none") continue;
        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) continue;
        if (rect.right <= band.left || rect.left >= band.right) continue;
        inset = Math.max(inset, window.innerHeight - rect.top);
      }
      root.style.setProperty("--showcase-measured-inset", `${Math.ceil(inset + 12)}px`);
    };

    /* Cached geometry, re-measured only when the viewport RESHAPES.

       The previous version re-read `stage.getBoundingClientRect()`,
       `root.getBoundingClientRect()` and `getComputedStyle(stage)` on EVERY
       animation frame. Each of those forces a synchronous layout, so the effect
       was doing a forced reflow per frame while also writing styles — which is
       what made the animation trail the scroll instead of tracking it exactly.

       Nothing here needs the live rects: the stage's height and its sticky offset
       change only on a real reshape, and the progress can then be derived from
       window.scrollY (a plain number, free to read) against a cached start
       offset. The result is identical maths with no per-frame layout. */
    let stageHeight = 0;
    let travel = 0;
    let startScroll = 0;

    const measure = () => {
      stageHeight = stage.getBoundingClientRect().height;
      if (stageHeight <= 0) return false;

      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
      travel = root.offsetHeight - stageHeight;
      if (travel <= 0) return false;

      /* The scroll position at which the stage first docks: the section's top
         reaches the stage's sticky offset. */
      startScroll = root.getBoundingClientRect().top + window.scrollY - stickyTop;
      return true;
    };

    const update = () => {
      raf = 0;
      if (!active) return;
      if (stageHeight <= 0 || travel <= 0) return;

      /* Progress is read straight off the scroll position, so it is exactly where
         the scrollbar is on this frame — no layout read in between to introduce
         lag, and no dependence on which element happens to be painted where. */
      const progress = clamp01((window.scrollY - startScroll) / travel);

      /* Travel a little over one stage height, so a departing scene is fully
         clear of the stage rather than stopping with its edge showing. */
      const distance = stageHeight * 1.15;

      /* The ONE authoritative answer to "which category is current", derived
         from the timeline's own transition boundaries — defined at every
         progress, including mid-transition and at both ends. */
      const nextReading = activeScene(progress, entries.length);

      entries.forEach(({ scene, copy, sceneRail }, index) => {
        const frame = getSceneFrame(progress, index, entries.length, distance, transition);

        scene.style.setProperty("--scene-y", `${frame.y.toFixed(1)}px`);
        if (frame.scale !== undefined)
          scene.style.setProperty("--scene-scale", frame.scale.toFixed(3));
        scene.style.setProperty("--image-opacity", frame.imageOpacity.toFixed(3));
        scene.style.setProperty("--copy-opacity", frame.copyOpacity.toFixed(3));
        /* The text's own travel, mirrored from its opacity so it finishes moving
           exactly as it finishes fading: 0 while the text is out, 1 once in. */
        scene.style.setProperty("--copy-reveal", frame.copyOpacity.toFixed(3));

        if (copy) {
          const interactive = frame.copyOpacity >= 0.99;
          /* `inert` covers pointer events, the tab order and the accessibility
             tree in one attribute; the explicit aria-hidden value keeps the
             state legible to assistive tech that reads attributes directly. */
          copy.inert = !interactive;
          copy.setAttribute("aria-hidden", String(!interactive));
          copy.style.pointerEvents = interactive ? "auto" : "none";
        }
        if (sceneRail) {
          /* Same fade and same gate as the copy: the rail belongs to its
             scene's reading interval. */
          sceneRail.style.opacity = frame.copyOpacity.toFixed(3);
          sceneRail.inert = frame.copyOpacity < 0.99;
        }
      });

      /* Rescue focus once, on the transition between two reading intervals —
         not on every frame of a scroll. */
      if (nextReading !== readingIndex) {
        releaseFocusIfInside(readingIndex);
        readingIndex = nextReading;
      }

      /* The rail reads from the SAME progress value as the scenes, so it can
         never drift out of step and costs no second listener or loop. The fill
         is the position in scene units over the total; each bullet's state is
         derived from whether that scene is the one being read, already passed,
         or still to come — so it reverses naturally on the way back up. */
      /* The track spans the first dot's centre to the last dot's centre, so
         the fill is normalised between the first and last READING positions —
         empty exactly when scene 0 is current, full exactly when the last is.
         Both rails (the desktop column and the per-scene mobile rows) read the
         same number. */
      const fill = railFillAt(progress, entries.length).toFixed(4);
      for (const el of railFills) el.style.setProperty("--rail-fill", fill);

      railItems.forEach(({ item, index }) => {
        const state =
          index === nextReading ? "active" : index < nextReading ? "passed" : "upcoming";
        item.dataset.state = state;
        /* aria-current moves with the active state, so assistive tech sees the
           same information the visuals do. */
        if (state === "active") item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const enable = () => {
      if (motion.matches) return;

      /* Order matters. The sticky offset must be published BEFORE the stage is
         measured: the stage's height is derived from it
         (calc(100svh - sticky-top)), and while the section is still in its
         stacked layout the stage is as tall as all three scenes put together.
         Measuring first would size the whole timeline off a stacked height. */
      const headerTop = (() => {
        const header = document.querySelector<HTMLElement>("header");
        if (!header) return 0;
        /* Only a header that is actually pinned over the content needs to be
           reserved; a static one scrolls away and must not shorten the stage. */
        if (getComputedStyle(header).position !== "sticky") return 0;
        return Math.round(header.getBoundingClientRect().height);
      })();
      root.style.setProperty("--showcase-sticky-top", `${headerTop}px`);
      measureChrome();
      root.setAttribute("data-scene-live", "");

      /* Now the stage is pinned and has its real, viewport-sized height. */
      const stageHeight = stage.getBoundingClientRect().height;
      if (stageHeight <= 0) {
        root.removeAttribute("data-scene-live");
        return;
      }

      /* The section's TOTAL height (stage + one stage-height per timeline
         unit) has to exist BEFORE the travel is measured: travel is the
         section height minus the stage height, and in the pinned layout the
         section's natural height equals the stage's exactly — so measuring
         first always read travel 0, measure() failed, and enable() silently
         removed the live flag and left the fallback stacked layout running:
         scenes scrolling under the sticky header, text stacked, no rail.
         The section height derives from the stage height alone, so setting
         it first is always valid. */
      root.style.height = `${sectionHeight(entries.length, stageHeight, unit)}px`;
      if (!measure()) {
        root.style.removeProperty("height");
        root.removeAttribute("data-scene-live");
        return;
      }
      /* Setting the height moved the section's top; re-measure so the start
         offset is measured against the final layout. */
      measure();
      active = true;
      readingIndex = 0;
      update();

      /* A single passive listener for the whole sequence — none per scene. */
      window.addEventListener("scroll", schedule, { passive: true });
      /* Watch the body's height: any content shift above (or below) the
         section — the hero's typing sequence settling, a late image, the
         cookie banner appearing or being dismissed — changes it, and every
         such change re-reads the start offset and the fixed chrome's
         footprint. Without this the timeline is measured against a page that
         no longer exists: scenes land at the wrong scroll positions and a
         dismissed banner leaves a huge stale clearance under the stage. */
      if (bodyObserver) {
        lastBodyH = document.body.getBoundingClientRect().height;
        bodyObserver.observe(document.body);
      }
      /* Recalculate the timeline whenever the viewport changes shape or size:
         a rotation or a desktop↔phone switch changes the stage height, and the
         section height is derived from it. */
      window.addEventListener("resize", onResize);
      /* Re-measure the fixed chrome after any click. Dismissing the cookie
         sheet or the checkout bar removes a POSITION:FIXED element, which
         changes neither the body's height nor the viewport, so neither the
         ResizeObserver above nor `resize` ever fires — and the stage went on
         reserving a fifth of a phone screen for a sheet that was no longer
         there, with the piece shrunk to fit around it. A dismissal is always a
         click, the listener is passive and capturing (so it still sees the
         click when the handler stops propagation), and the work is one
         measurement on the next frame. */
      document.addEventListener("click", onChromeChange, {
        passive: true,
        capture: true,
      });
      /* Late-loading images and font swaps can change the stage's height, so
         re-measure once the page has settled rather than trusting the first
         measurement. */
      window.addEventListener("load", schedule);
    };

    const onMotionChange = () => {
      disable();
      enable();
    };

    enable();

    /* Swipe to navigate between scenes on mobile. A horizontal swipe calls
       scrollToScene so the page jumps to the correct reading position for the
       adjacent scene — same path as the dot buttons, no extra state. The guard
       on deltaX > deltaY means a slow vertical scroll never triggers navigation
       by accident. Passive listeners keep the touch path off the main thread. */
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!active) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      /* Require a minimum horizontal travel and that X dominates Y, so a
         diagonal scroll doesn't accidentally fire the swipe. */
      if (Math.abs(dx) < 48 || Math.abs(dy) > Math.abs(dx) * 0.9) return;
      const direction = dx < 0 ? 1 : -1; // swipe left → next, right → prev
      const next = Math.min(Math.max(readingIndex + direction, 0), entries.length - 1);
      if (next !== readingIndex) scrollToScene(next);
    };

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });

    motion.addEventListener("change", onMotionChange);
    return () => {
      motion.removeEventListener("change", onMotionChange);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchend", onTouchEnd);
      disable();
    };
  }, [items, unit, transition]);

  return (
    <div
      className="showcase"
      ref={rootRef}
      {...root.attrs}
      style={root.vars as React.CSSProperties}
    >
      <div className="showcase-stage">
        {/* The scene content column. Every scene lives inside this wrapper, so
            the stage can lay out `piece | content | rail` as real grid columns:
            the rail gets space the layout has already reserved, rather than
            floating over the text. */}
        <div className="showcase-content">
          {items.map((item, i) => (
            <section
              key={item.id}
              className="showcase-scene"
              data-scene={i}
              data-placement={item.scene}
              aria-label={item.name}
            >
              {/* The photograph. object-fit: contain keeps the piece whole — never
                  cropped, never stretched — and the figure holds a fixed box so
                  the copy never jumps when the file arrives. */}
              <div className="showcase-figure">
                {/* `preload`, not the deprecated `priority`: the first scene is
                    this section's LCP candidate. */}
                <CatalogImage
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 52rem) 34svh, 62vw"
                  preload={i === 0}
                  className="showcase-image"
                />
              </div>

              <div
                className="showcase-copy"
                data-scene-copy
                data-side={item.side ?? COPY_SIDE[item.scene]}
              >
                {/* The editorial index. Decorative numbering, not content:
                    the position is already conveyed by the progress rail's
                    aria-current, so this is hidden from assistive tech rather
                    than read out as a second, competing count. */}
                <p className="showcase-index" aria-hidden="true">
                  <span className="showcase-index-current">{String(i + 1).padStart(2, "0")}</span>
                  <span className="showcase-index-sep">/</span>
                  <span className="showcase-index-total">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </p>
                <h2 className="showcase-title">{item.name}</h2>
                <p className="showcase-description">{item.description}</p>
                <Link className="btn-primary btn-arrow showcase-cta" href={item.href}>
                  {item.cta}
                  {/* The shared arrow: moves 3px on hover, hidden from the
                      accessible name so the link still reads as its label. */}
                  <span className="btn-arrow-glyph" aria-hidden="true">
                    &#8594;
                  </span>
                </Link>
              </div>

              {/* The mobile rail: the same navigation, rendered in the scene's
                  own right-hand gutter so it sits beside the content rather
                  than under it. Hidden by CSS on wider screens. */}
              <SceneRail
                items={items.map((it) => ({ id: it.id, name: it.name }))}
                onSelect={scrollToScene}
                label={railLabel}
                active={i}
              />
            </section>
          ))}
        </div>

        {/* The progress rail: one dot per collection, joined by a line that fills
            with the scroll. Navigation, not decoration. */}
        <ShowcaseProgressRail
          items={items.map((item) => ({ id: item.id, name: item.name }))}
          onSelect={scrollToScene}
          label={railLabel}
        />

        {/* Mobile swipe hint — visible at the base of the pinned stage only on
            phones (CSS hides it on wider screens). Tells users they can swipe
            between collections in addition to scrolling. Hidden from
            assistive tech because the rail's aria-labels already convey
            that navigation is available. */}
        <p className="showcase-swipe-hint" aria-hidden="true">
          <span className="showcase-swipe-arrow">←</span>
          {" Swipe "}
          <span className="showcase-swipe-arrow">→</span>
        </p>
      </div>
    </div>
  );
}
