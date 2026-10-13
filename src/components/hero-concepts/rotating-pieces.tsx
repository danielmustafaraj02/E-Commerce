"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { RotatingStyle } from "@/lib/hero-concepts/config";

export type RotatingPiece = {
  /** Set when the piece can open a product card. */
  slug?: string;
  src: string;
  width: number;
  height: number;
  /** Centre and drawn width, % of the box. */
  x: number;
  y: number;
  w: number;
  rotate: number;
};

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The rotating concept's compositions. Every scene is in the page from the
 * start (so a change never waits on a download); one is shown, the one before
 * it leaves, and CSS does the movement (hero-concepts.css). The only script is
 * a timer, which stops while the tab is hidden, when the visitor prefers
 * reduced motion, and while paused (by the admin preview or the visitor's own
 * pause button).
 */
export function RotatingPieces({
  scenes,
  seconds,
  styleName,
  paused = false,
  pin,
  labels,
}: {
  scenes: RotatingPiece[][];
  seconds: number;
  styleName: RotatingStyle;
  paused?: boolean;
  /** Shows this scene and stays on it (the admin editing one scene). */
  pin?: number;
  labels: { pause: string; play: string };
}) {
  const [shown, setShown] = useState({ current: pin ?? 0, previous: -1 });
  const [held, setHeld] = useState(false);
  // A mouse resting on a piece (its card may be open) holds the scene.
  const [hovering, setHovering] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // A newly pinned scene moves in like any other change.
  const [lastPin, setLastPin] = useState(pin);
  if (pin !== lastPin) {
    setLastPin(pin);
    if (pin !== undefined && pin !== shown.current) setShown({ current: pin, previous: shown.current });
  }
  // A scene removed in the admin cannot stay current.
  const current = shown.current < scenes.length ? shown.current : 0;
  const previous = shown.previous < scenes.length ? shown.previous : -1;
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const running =
    scenes.length > 1 && pin === undefined && !paused && !held && !hovering && !reduced && !hidden;

  // A new scene closes any open product card (its piece has just left).
  useEffect(() => {
    rootRef.current?.closest(".hc")?.dispatchEvent(new Event("hc-scene"));
  }, [current]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setShown({ current: (current + 1) % scenes.length, previous: current }),
      seconds * 1000
    );
    return () => window.clearTimeout(timer);
  }, [running, current, seconds, scenes.length]);

  return (
    <>
      <div
        ref={rootRef}
        className="hc-rot"
        data-style={styleName}
        onPointerOver={(e) => {
          if (e.pointerType === "mouse" && (e.target as Element).closest(".hc-piece")) setHovering(true);
        }}
        onPointerLeave={() => setHovering(false)}
      >
        {scenes.map((pieces, s) => (
          <div
            key={s}
            className="hc-rot-scene"
            data-state={s === current ? "active" : s === previous ? "leaving" : "waiting"}
          >
            {pieces.map((piece, i) => (
              <div
                key={i}
                className="hc-piece hc-rot-piece"
                data-slug={piece.slug}
                style={
                  {
                    left: `${piece.x}%`,
                    top: `${piece.y}%`,
                    "--w": piece.w,
                    "--ar": piece.width / piece.height,
                    "--r": `${piece.rotate}deg`,
                    "--i": i,
                    "--dir": i % 2 ? -1 : 1,
                  } as CSSProperties
                }
              >
                <div className="hc-float">
                  <Image
                    src={piece.src}
                    width={piece.width}
                    height={piece.height}
                    alt=""
                    quality={90}
                    sizes={`(min-width: 768px) ${Math.ceil(piece.w * 0.55)}vw, ${Math.ceil(piece.w)}vw`}
                    // Every scene loads up front (later ones at low priority), so
                    // a change never waits on a download.
                    loading="eager"
                    fetchPriority={s === 0 ? "high" : "low"}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {scenes.length > 1 && !reduced && pin === undefined && (
        <button
          type="button"
          className="hc-hold"
          aria-pressed={held}
          aria-label={held ? labels.play : labels.pause}
          title={held ? labels.play : labels.pause}
          onClick={() => setHeld((value) => !value)}
        >
          <span aria-hidden="true" className={held ? "hc-hold-play" : "hc-hold-pause"} />
        </button>
      )}
    </>
  );
}
