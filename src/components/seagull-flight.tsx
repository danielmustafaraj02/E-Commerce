"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import "./seagull-flight.css";

// A small gull that starts standing under another element (on the Murano
// guide: between the feet of the big gull illustration, his father), takes
// off as you scroll, flies down the page beside the text column and lands on
// the wave of the footer's brand signature. Its position is a pure function
// of the scroll position and the layout, so scrolling back up retraces the
// same path and sets it down under its father again. Decorative only.

const EDGE = 6;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// Client only, and never for visitors who ask for less motion.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const motionAllowed = () => !window.matchMedia(REDUCED_MOTION).matches;
const onServer = () => false;

type Path = {
  x0: number;
  x1: number;
  lane: number | null; // x of the margin lane beside the text, if there is room
  amp: number;
  swoops: number;
  edge: number; // share of the flight spent moving into / out of the lane
};

function pathX(p: number, k: Path) {
  if (k.lane === null) {
    return lerp(k.x0, k.x1, easeInOut(p)) + k.amp * Math.sin(Math.PI * p) * Math.sin(Math.PI * k.swoops * p);
  }
  if (p < k.edge) return lerp(k.x0, k.lane, easeInOut(p / k.edge));
  if (p > 1 - k.edge) return lerp(k.lane, k.x1, easeInOut((p - (1 - k.edge)) / k.edge));
  const t = (p - k.edge) / (1 - 2 * k.edge);
  return k.lane + k.amp * Math.sin(Math.PI * t) * Math.sin(Math.PI * k.swoops * t);
}

export function SeagullFlight({
  from,
  lane,
}: {
  // The element the gull stands under at rest: it is centred on it, feet on
  // its bottom edge (e.g. the father's legs).
  from: string;
  // A block in the text column (full column width): the gull flies in the
  // wider free gutter beside it, when there is room, rather than over text.
  lane?: string;
}) {
  const enabled = useSyncExternalStore(subscribeMotion, motionAllowed, onServer);
  const birdRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bird = birdRef.current;
    const pose = poseRef.current;
    if (!enabled || !bird || !pose) return;

    let raf = 0;
    let running = false;
    // The take-off point, frozen for the whole flight so the path can't shift
    // under it; dropped if the layout changes (resize, rotation).
    let launch: { x: number; y: number; layout: string } | null = null;
    let lastP = -1;
    let flapUntil = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      const anchor = document.querySelector(from)?.getBoundingClientRect();
      if (!anchor) {
        bird.style.visibility = "hidden";
        return;
      }
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const w = bird.offsetWidth;
      const h = bird.offsetHeight;
      const feet = h * 0.85; // where the feet are in the bird's box

      // Rest: centred under the anchor, feet on its bottom edge.
      const restX = clamp(anchor.left + anchor.width / 2 - w / 2, EDGE, vw - w - EDGE);
      const restY = anchor.bottom + sy - feet;
      const layout = `${vw}x${docH}`;
      if (launch && launch.layout !== layout) launch = null;
      const startX = launch ? launch.x : restX;
      const startY = launch ? launch.y : restY;

      // Landing: on the footer signature's wave (its line runs through the
      // middle of that SVG), centred.
      const wave = document.querySelector(".site-footer .brand-signature svg")?.getBoundingClientRect();
      const endX = clamp(wave ? wave.left + wave.width / 2 - w / 2 : vw / 2 - w / 2, EDGE, vw - w - EDGE);
      const endY = wave ? wave.top + wave.height / 2 + sy - feet : docH - h - 16;

      // The flight runs from when the gull is a little past mid-screen to the
      // very end of the page.
      const maxScroll = Math.max(0, docH - vh);
      const begin = Math.max(0, Math.min(startY - 0.55 * vh, maxScroll - 0.25 * vh));
      const span = maxScroll - begin;
      const p = span > 1 ? clamp((sy - begin) / span, 0, 1) : sy >= maxScroll - 1 ? 1 : 0;

      if (p === 0) launch = null;
      else if (!launch) launch = { x: startX, y: startY, layout };

      // Beside the text column, in the wider free gutter, when it fits.
      const column = lane ? document.querySelector(lane)?.getBoundingClientRect() : undefined;
      const left = column ? [EDGE, column.left - 12] : null;
      const right = column ? [column.right + 12, vw - EDGE] : null;
      const gutter =
        left && right ? (left[1] - left[0] >= right[1] - right[0] ? left : right) : null;
      const gutterWidth = gutter ? gutter[1] - gutter[0] : 0;
      const hasLane = gutter !== null && gutterWidth >= w + 24;
      const path: Path = {
        x0: startX,
        x1: endX,
        lane: hasLane && gutter ? (gutter[0] + gutter[1]) / 2 - w / 2 : null,
        amp: hasLane ? Math.max(0, Math.min(gutterWidth / 2 - w / 2 - 8, 70)) : Math.min(vw * 0.16, 150),
        swoops: Math.max(2, Math.round(span / 650)),
        edge: clamp(420 / Math.max(span, 1), 0.05, 0.3),
      };

      const x = clamp(pathX(p, path), EDGE, vw - w - EDGE);
      const y = startY + (endY - startY) * p - sy;

      // Face along the path and pitch with its slope on screen.
      let face = 1;
      let pitch = 0;
      if (p > 0 && p < 1) {
        const q = Math.min(1, p + 0.002);
        const dx = pathX(q, path) - pathX(p, path);
        const dy = (endY - startY - span) * (q - p);
        face = Math.abs(dx) > 0.02 ? Math.sign(dx) : Number(pose.dataset.face || 1);
        pitch = clamp((Math.atan2(dy, Math.abs(dx) + 0.001) * 180) / Math.PI, -22, 22) * 0.6;
      }

      if (Math.abs(p - lastP) > 0.0004) flapUntil = now + 380;
      lastP = p;
      const perched = p === 0 || p > 0.985;
      const state = perched ? "landed" : now < flapUntil ? "flapping" : "gliding";

      bird.style.visibility = y < vh + 40 && y > -h - 40 ? "visible" : "hidden";
      bird.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      pose.dataset.face = String(face);
      pose.style.setProperty("--gull-face", String(face));
      pose.style.setProperty("--gull-pitch", `${(pitch * face).toFixed(2)}deg`);
      if (pose.dataset.state !== state) pose.dataset.state = state;
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      bird.style.visibility = "hidden";
    };

    // Only run the loop while some part of the journey is near the screen.
    // Every lane block is observed (not just the first), so the tiled column
    // keeps one in view for the whole descent — otherwise the loop would stop
    // mid-page and freeze the gull between the art and the footer.
    const watched = [
      document.querySelector(from),
      ...(lane ? document.querySelectorAll(lane) : []),
      document.querySelector(".site-footer"),
    ].filter((el): el is Element => Boolean(el));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        if (visible.size > 0) start();
        else stop();
      },
      { rootMargin: "50% 0px" }
    );
    watched.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      stop();
    };
  }, [enabled, from, lane]);

  if (!enabled) return null;

  return createPortal(
    <div ref={birdRef} className="gull-flight" aria-hidden="true">
      <div ref={poseRef} className="gull-pose" data-state="landed" data-face="1">
        <svg className="gull-svg" viewBox="0 0 64 40" focusable="false">
          <g className="gull-wing gull-wing--far">
            <path d="M29 19C26 12 19 6 9 3.5c5 4.5 9 8.5 12 12.5 3 2.5 5.5 3.5 8 4Z" fill="#cfd6d4" />
            <path d="M9 3.5c3 3 5.5 5.7 7.5 8.3L13.4 10C11.8 8 10.4 5.8 9 3.5Z" fill="#3a4446" />
          </g>
          <path
            d="M11 21.6 2.6 19.4c-.6-.2-1 .5-.6.9l2.4 2.6-2.2 2.2c-.4.4 0 1.1.6.9l8.4-2.4Z"
            fill="#f7f6f1"
            stroke="#6f7e7d"
            strokeOpacity=".45"
            strokeWidth=".5"
          />
          <path
            className="gull-legs gull-legs--tucked"
            d="M31 25.8 27.2 28M34 25.9 30.3 28.3"
            stroke="#e39e67"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            className="gull-legs gull-legs--down"
            d="M31 26 30.4 33.6M35 26l.2 7.6M28.6 33.8h3.8M33.4 33.8h3.8"
            stroke="#e39e67"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M9 23c5-4.6 16-6.6 27-6.4 6 .1 10.6 1.4 13.6 3.4-2.6 3.3-8.6 5.6-16.4 6-9.6.5-18.2-.6-24.2-3Z"
            fill="#fbfaf6"
            stroke="#6f7e7d"
            strokeOpacity=".4"
            strokeWidth=".6"
          />
          <path d="M16 24.6c7 1.4 17 1.5 26 .2-6 1.6-17 1.9-26-.2Z" fill="#e3e8e5" />
          <path d="M14 21.2c6-2.8 15-3.9 24-3.5-5.5 1.6-13.5 3-24 3.9Z" fill="#aab5b4" />
          <circle cx="50" cy="18.4" r="5.4" fill="#fbfaf6" stroke="#6f7e7d" strokeOpacity=".4" strokeWidth=".6" />
          <path d="m54.9 17.9 6.3 1c.8.1.9 1.1.2 1.3l-1.2.4.2.9-5.2-.6Z" fill="#e8b84a" />
          <circle cx="59.4" cy="20.2" r=".62" fill="#c8453a" />
          <circle cx="51.8" cy="17.3" r="1" fill="#1c2426" />
          <circle cx="52.1" cy="17" r=".32" fill="#fff" />
          <g className="gull-wing gull-wing--near">
            <path
              d="M33 20.4C31 12.4 23.4 5 11.4 1.4c3.8 4.6 6.8 8.8 8.8 12.8 3.4 3.6 7.8 6 12.8 7.4Z"
              fill="#aab5b4"
              stroke="#5f6e6d"
              strokeOpacity=".35"
              strokeWidth=".5"
            />
            <path d="M11.4 1.4c3.4 4 6 7.6 7.9 11.1l-3.9-2.3C13.9 7.6 12.6 4.6 11.4 1.4Z" fill="#283134" />
            <circle cx="13.6" cy="4.6" r=".75" fill="#fbfaf6" />
            <path d="M20.2 14.2c3.4 3.6 7.8 6 12.8 7.4" fill="none" stroke="#fbfaf6" strokeWidth=".9" />
          </g>
        </svg>
      </div>
    </div>,
    document.body
  );
}
