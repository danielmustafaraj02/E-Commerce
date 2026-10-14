"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

export type LookStylePanel = {
  id: string;
  name: string;
  note: string;
  lookName: string;
  content: ReactNode;
};

/** Server-rendered storefront compositions inside an interactive workbench. */
export function LookStylePreview({ previews }: { previews: LookStylePanel[] }) {
  const [width, setWidth] = useState(1440);
  const [only, setOnly] = useState("all");
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const mobile = width < 768;
  const shown = only === "all" ? previews : previews.filter((panel) => panel.id === only);

  function updateEdges() {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    updateEdges();
    return () => observer.disconnect();
  }, [only, width, previews.length]);

  function slide(direction: number) {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return;
    const next = first.nextElementSibling as HTMLElement | null;
    const step = next ? next.offsetLeft - first.offsetLeft : first.offsetWidth;
    track.scrollBy({
      left: direction * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <div className="look-preview">
      <header className="look-preview-bar">
        <div className="look-preview-bar-inner">
          <div className="look-preview-intro">
            <Link href="/admin/settings/page-layout" className="look-preview-back">
              Back to Page layout
            </Link>
            <h1 className="look-preview-title">Look row styles</h1>
            <p className="look-preview-lede">
              Compare {previews.length} compositions with your catalog looks. Selection only changes
              this preview. Apply your choice in Page layout → Looks → Options, then save.
            </p>
          </div>
          <div className="look-preview-controls">
            <div role="group" aria-label="Preview device" className="look-preview-seg">
              <button type="button" aria-pressed={!mobile} onClick={() => setWidth(1440)}>
                Desktop
              </button>
              <button type="button" aria-pressed={mobile} onClick={() => setWidth(390)}>
                Mobile
              </button>
            </div>
            <label className="look-preview-select">
              <span>Canvas width</span>
              <select value={width} onChange={(event) => setWidth(Number(event.target.value))}>
                {[320, 375, 390, 768, 1440].map((size) => (
                  <option key={size} value={size}>
                    {size} px
                  </option>
                ))}
              </select>
            </label>
            <label className="look-preview-select">
              <span>Template</span>
              <select value={only} onChange={(event) => setOnly(event.target.value)}>
                <option value="all">Compare all {previews.length}</option>
                {previews.map((panel) => (
                  <option key={panel.id} value={panel.id}>
                    {panel.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>
      <div
        className="look-preview-stage"
        style={{ "--preview-width": `${width}px` } as CSSProperties}
      >
        <div className="look-preview-navigation">
          <p className="look-preview-status" role="status" aria-live="polite">
            {only === "all" ? `${previews.length} styles` : shown[0]?.name} · {width} px maximum ·
            Canvas fits the available space
          </p>
          <div className="look-preview-seg" role="group" aria-label="Slide through styles">
            <button
              type="button"
              aria-label="Previous styles"
              aria-controls="look-preview-track"
              disabled={edges.start}
              onClick={() => slide(-1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              aria-label="Next styles"
              aria-controls="look-preview-track"
              disabled={edges.end || shown.length < 2}
              onClick={() => slide(1)}
            >
              Next →
            </button>
          </div>
        </div>
        <div
          id="look-preview-track"
          className={`look-preview-track${shown.length === 1 ? "look-preview-track-single" : ""}`}
          ref={trackRef}
          onScroll={updateEdges}
          tabIndex={0}
          aria-label="Look style previews"
        >
          {shown.map((panel) => (
            <section
              key={panel.id}
              className="look-preview-block"
              aria-labelledby={`tpl-${panel.id}`}
            >
              <div className="look-preview-block-head">
                <div>
                  <h2 id={`tpl-${panel.id}`}>{panel.name}</h2>
                  <p>{panel.note}</p>
                </div>
                <span className="look-preview-catalog-name">{panel.lookName}</span>
              </div>
              <div className="look-preview-canvas">
                <div className="looks-editorial-list">{panel.content}</div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
