"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogImage } from "@/components/catalog-image";
import { Link } from "@/components/localized-link";

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
  href?: string | null;
  isLifestyle?: boolean;
};

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 280;
const SWIPE_PX = 50;

type View = { scale: number; x: number; y: number };
const REST: View = { scale: 1, x: 0, y: 0 };

// A full-screen viewer on the modal <dialog> (focus trap, Esc and the top
// layer come from the browser). Every gesture is handled here — pinch and
// double-tap zoom, pan while zoomed, swipe between photos at rest — so the
// stage is touch-action: none and the page itself never zooms.
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
  labels,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: { close: string; previous: string; next: string; hint: string; viewPiece?: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(REST);
  const [animate, setAnimate] = useState(true);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    start: View;
    startDist: number;
    startMid: { x: number; y: number };
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);
  const count = images.length;
  const active = images[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
      if (dialog.open) dialog.close();
    };
  }, []);

  // A new photo always opens at rest (reset while rendering, not in an effect).
  const [shownIndex, setShownIndex] = useState(index);
  const [sharpSrc, setSharpSrc] = useState<string | null>(null);
  if (view.scale > 1 && active && sharpSrc !== active.src) setSharpSrc(active.src);
  if (shownIndex !== index) {
    setShownIndex(index);
    setAnimate(true);
    setView(REST);
  }

  const go = (step: number) => onIndexChange((index + step + count) % count);

  function clampView(next: View): View {
    const rect = stageRef.current?.getBoundingClientRect();
    const scale = Math.min(MAX_SCALE, Math.max(1, next.scale));
    if (!rect || scale === 1) return { scale, x: 0, y: 0 };
    const maxX = ((scale - 1) * rect.width) / 2;
    const maxY = ((scale - 1) * rect.height) / 2;
    return {
      scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  // Zoom so the point under (cx, cy) — client coordinates — stays put.
  function zoomAt(target: number, cx: number, cy: number, from: View): View {
    const rect = stageRef.current!.getBoundingClientRect();
    const px = cx - (rect.left + rect.width / 2);
    const py = cy - (rect.top + rect.height / 2);
    const ratio = target / from.scale;
    return clampView({
      scale: target,
      x: px - (px - from.x) * ratio,
      y: py - (py - from.y) * ratio,
    });
  }

  function startGesture() {
    const pts = [...pointers.current.values()];
    const [a, b] = pts;
    gesture.current = {
      start: view,
      startDist: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      startMid: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
      startX: a.x,
      startY: a.y,
      moved: false,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (pointers.current.size >= 2) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    startGesture();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.startDist > 0) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const zoomed = zoomAt(g.start.scale * (dist / g.startDist), g.startMid.x, g.startMid.y, g.start);
      g.moved = true;
      setView(clampView({ ...zoomed, x: zoomed.x + mid.x - g.startMid.x, y: zoomed.y + mid.y - g.startMid.y }));
      return;
    }
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
    if (g.start.scale > 1) {
      setView(clampView({ ...g.start, x: g.start.x + dx, y: g.start.y + dy }));
    } else if (count > 1) {
      // At rest a horizontal drag previews the swipe.
      setView({ scale: 1, x: dx, y: 0 });
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    setAnimate(true);
    if (pointers.current.size === 1) {
      // One finger lifted mid-pinch: carry on panning with the other.
      startGesture();
      return;
    }
    gesture.current = null;
    if (!g) return;

    if (view.scale <= 1.02) {
      const dx = e.clientX - g.startX;
      if (g.start.scale === 1 && count > 1 && Math.abs(dx) > SWIPE_PX) {
        go(dx < 0 ? 1 : -1);
        return;
      }
      setView(REST);
    }

    if (!g.moved && e.type === "pointerup") {
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        setView(view.scale > 1 ? REST : zoomAt(DOUBLE_TAP_SCALE, e.clientX, e.clientY, REST));
      } else {
        lastTap.current = now;
      }
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    setAnimate(false);
    setView(zoomAt(view.scale * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY, view));
  }

  if (!active) return null;

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={active.alt}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="lightbox-bar">
        {count > 1 ? (
          <span className="lightbox-count" aria-live="polite">
            {String(index + 1).padStart(2, "0")}
            <i aria-hidden="true" />
            {String(count).padStart(2, "0")}
          </span>
        ) : (
          <span />
        )}
        <button type="button" className="lightbox-close" onClick={onClose} aria-label={labels.close}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </div>

      <div
        ref={stageRef}
        className="lightbox-stage"
        data-zoomed={view.scale > 1 ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="lightbox-frame"
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            transition: animate ? undefined : "none",
          }}
        >
          <CatalogImage
            key={active.src}
            src={active.src}
            alt={active.alt}
            fill
            sizes="100vw"
            loading="eager"
            draggable={false}
            className={active.isLifestyle ? "lightbox-img lightbox-img--lifestyle" : "lightbox-img"}
          />
          {/* The large file only once the shopper zooms: it is slow to
              encode the first time and heavy to send, and the screen-size
              photo underneath stays in view until it has arrived. */}
          {sharpSrc === active.src && (
            <CatalogImage
              key={`${active.src}-sharp`}
              src={active.src}
              alt=""
              fill
              sizes="300vw"
              loading="eager"
              draggable={false}
              onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "")}
              className="lightbox-img lightbox-img--sharp"
            />
          )}
        </div>
        {count > 1 && (
          <>
            <button type="button" className="lightbox-arrow lightbox-arrow--prev" onClick={() => go(-1)} onPointerDown={(e) => e.stopPropagation()} aria-label={labels.previous}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12H3m6-6-6 6 6 6" />
              </svg>
            </button>
            <button type="button" className="lightbox-arrow lightbox-arrow--next" onClick={() => go(1)} onPointerDown={(e) => e.stopPropagation()} aria-label={labels.next}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12h18m-6-6 6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="lightbox-foot">
        <p className="lightbox-hint">{labels.hint}</p>
        {active.caption && (
          <p key={active.src} className="lightbox-caption">
            {active.caption}
          </p>
        )}
        {active.href && labels.viewPiece && (
          <Link href={active.href} className="lightbox-link" onClick={onClose}>
            {labels.viewPiece}
            <span aria-hidden="true">→</span>
          </Link>
        )}
        {count > 1 && (
          <div className="lightbox-thumbs">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                className="lightbox-thumb"
                aria-label={`${i + 1} / ${count}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => onIndexChange(i)}
              >
                <CatalogImage src={image.src} alt="" fill sizes="56px" className={image.isLifestyle ? "lightbox-img--lifestyle" : undefined} />
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
