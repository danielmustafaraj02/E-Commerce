"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  Grid3x3,
  Monitor,
  Play,
  Smartphone,
  StretchHorizontal,
  StretchVertical,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { canvasViewport } from "@/lib/canvas-viewport";
import styles from "./section-preview.module.css";
import { CANVAS_CSS, patchBlockStyle, type BlockPos } from "@/lib/section-builder-editing";
import {
  alignSelection,
  applySelection,
  attachCanvas,
  playAnimations,
  syncGrid,
  type CanvasApi,
  type Device,
} from "./canvas-interactions";
import type { AlignKind } from "./canvas-tools";
import { applyShowcaseDraft, findShowcase } from "./showcase-preview";
import { readingProgress } from "@/lib/showcase-timeline";
import { sanitizeSectionHtml, scopeSectionCss } from "@/lib/custom-section";
import type { LayoutEntry } from "@/lib/page-layout";
import { resolveStreaming } from "@/lib/resolve-streaming";
import { readableSectionHtml } from "@/lib/format-html";
import { entryContent, innerClass } from "@/lib/section-content";
import { fromMap, localizeDoc } from "@/lib/builder-i18n";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import {
  backgroundLayersHtml,
  hasBackgroundLayers,
  optionAttributes,
  sectionInlineStyle,
} from "@/lib/section-style";

/**
 * Inline section previews for Admin > Settings > Page layout.
 *
 * The editor fetches the real storefront page once (same origin, with the
 * admin's session, in preview mode so every section is present) and keeps its
 * stylesheets, root classes and each section's markup. A section is then drawn
 * in a sandboxed <iframe srcdoc> (no scripts can run) using the site's own
 * CSS, with the unsaved draft applied. Nothing is framed from the storefront
 * and nothing is saved.
 */

const NO_SELECTION: BlockPos[] = [];

/** A screen's height per device, for sections sized in vh. */
const FRAME_HEIGHT: Record<Device, number> = { computer: 820, tablet: 1024, phone: 780 };

const DEVICES: [Device, LucideIcon, string][] = [
  ["computer", Monitor, "Computer"],
  ["tablet", Tablet, "Tablet"],
  ["phone", Smartphone, "Phone"],
];

export type PageSnapshot = {
  stylesheets: string[];
  htmlClass: string;
  htmlStyle: string;
  bodyClass: string;
  mainClass: string;
  /** Each section's original markup, by section id. */
  sections: Record<string, string>;
};

export function usePageSnapshot(url: string | null, enabled: boolean) {
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const load = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      // A cold or briefly unreachable database makes the page answer 5xx once;
      // retry a couple of times before giving up.
      let response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
      for (let attempt = 0; attempt < 2 && response.status >= 500; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
      }
      if (!response.ok) {
        throw new Error(
          response.status >= 500
            ? `The page answered ${response.status} (the database may be slow or unreachable; check the dev server log).`
            : `The page answered ${response.status}.`
        );
      }
      const doc = new DOMParser().parseFromString(await response.text(), "text/html");
      resolveStreaming(doc);
      const sections: Record<string, string> = {};
      let mainClass = "";
      doc.querySelectorAll<HTMLElement>("[data-layout-id]").forEach((el) => {
        sections[el.dataset.layoutId!] = el.innerHTML;
        mainClass ||= el.parentElement?.className ?? "";
      });
      if (Object.keys(sections).length === 0) {
        throw new Error("Preview mode is only available to admins. Sign in again and retry.");
      }
      setSnapshot({
        stylesheets: [...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
          .map((l) => l.getAttribute("href") ?? "")
          .filter(Boolean),
        htmlClass: doc.documentElement.className,
        htmlStyle: doc.documentElement.getAttribute("style") ?? "",
        bodyClass: doc.body.className,
        mainClass,
        sections,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && !started.current) {
      started.current = true;
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { snapshot, error, loading, reload: load };
}

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** A section's own markup, cleaned and formatted for editing. */
export const editableHtml = readableSectionHtml;

/** A minimal section in the site's own classes, for sections that currently
 *  render nothing (no data yet) and so have no markup to start from. */
export const STARTER_HTML = `<section class="shelf-section">
  <div class="shelf-wrap">
    <div class="shelf-heading-row">
      <h2 class="shelf-heading">Your title</h2>
    </div>
    <p>Your text goes here.</p>
  </div>
</section>`;

/** A draft with its site text and per-language wording resolved, as the
 *  preview's language shows them. */
export function localizeEntry(draft: LayoutEntry, siteText?: Record<string, string>): LayoutEntry {
  return draft.builder
    ? { ...draft, builder: localizeDoc(draft.builder, defaultLocale, fromMap(siteText ?? {})) }
    : draft;
}

/** The sandboxed document that draws one section: the page's own stylesheets
 *  and the section's markup with the draft applied. Shared by the editing
 *  canvas and the design thumbnails, so both show exactly the same thing. */
export function previewDocument(entry: LayoutEntry, snapshot: PageSnapshot, edit: boolean) {
  const { style } = entry;
  const content = entryContent(entry, { edit });
  const scopeClass = `layout-sec-${entry.id}`;
  const original = (snapshot.sections[entry.id] ?? "").replace(
    /data-reveal="false"/g,
    'data-reveal="true"'
  );
  // Live blocks have no data in the preview; where the page already rendered
  // the real thing (the collections animation, the journal), show that.
  const fillLive = (html: string) =>
    (["showcase", "journal", "original"] as const).reduce((out, kind) => {
      let real = (snapshot.sections[kind === "original" ? entry.id : kind] ?? "").replace(
        /data-reveal="false"/g,
        'data-reveal="true"'
      );
      if (kind === "showcase") {
        // Reuse the live scene, not a saved builder wrapper around it.
        const parsed = new DOMParser().parseFromString(real, "text/html");
        real = parsed.querySelector(".showcase")?.outerHTML ?? real;
      }
      return real.trim()
        ? out.replace(
            new RegExp(`<div class="bld-live" data-bld-live="${kind}"[^>]*></div>`),
            `<div class="bld-live-filled">${real}</div>`
          )
        : out;
    }, html);
  const inner = content
    ? `<div${innerClass(content) ? ` class="${innerClass(content)}"` : ""}>${fillLive(sanitizeSectionHtml(content.html))}</div>`
    : original;
  const css = scopeSectionCss(`${content?.css ?? ""}\n${style?.css ?? ""}`, scopeClass);
  const inline = Object.entries(sectionInlineStyle(style))
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${v}`)
    .join(";");
  const classes = [
    css ? scopeClass : "",
    entry.custom ? "custom-section" : "",
    hasBackgroundLayers(style) ? "lay-has-bg" : "",
    style?.parallax && style.bgImage ? "lay-parallax" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<!doctype html><html class="${esc(snapshot.htmlClass)}" style="${esc(snapshot.htmlStyle)}"><head><meta charset="utf-8"><base target="_blank">${snapshot.stylesheets
    .map((href) => `<link rel="stylesheet" href="${esc(href)}">`)
    .join(
      ""
    )}<style>body{margin:0}body>main{width:100%;min-width:0}body>main>div{width:100%;min-width:0;box-sizing:border-box}</style><style>${css}</style>${edit ? `<style>${CANVAS_CSS}</style>` : ""}</head><body class="${esc(snapshot.bodyClass)}"><main class="${esc(snapshot.mainClass)}"><div class="${esc(classes)}" style="${esc(inline)}"${Object.entries(
    optionAttributes(entry.options)
  )
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join(
      ""
    )}>${hasBackgroundLayers(style) ? `<div class="lay-bg-layers" aria-hidden="true">${backgroundLayersHtml(style)}</div>` : ""}${inner}</div></main></body></html>`;
}

/** Whether the section draws anything at all (some show nothing until there
 *  is data, such as best sellers). */
export function hasPreviewContent(entry: LayoutEntry, snapshot: PageSnapshot) {
  return !!entryContent(entry) || !!(snapshot.sections[entry.id] ?? "").trim();
}

export function SectionPreview({
  entry: draft,
  snapshot,
  canvas,
  siteText,
  maxHeight,
}: {
  entry: LayoutEntry;
  snapshot: PageSnapshot;
  /** The site's text in the preview's language, for designs that use it. */
  siteText?: Record<string, string>;
  /** Makes the preview an editable canvas (drag blocks, click text) for sections
   *  made with the visual editor. */
  canvas?: {
    api: CanvasApi;
    selection: BlockPos[];
    view: { device: Device; grid: boolean };
    setView: (view: { device: Device; grid: boolean }) => void;
  };
  /** The tallest the preview grows before it scrolls (px, at 100% zoom). */
  maxHeight?: number;
}) {
  // Site text and per-language wording, shown as the preview's language shows it.
  const entry = useMemo(() => localizeEntry(draft, siteText), [draft, siteText]);
  const [localDevice, setLocalDevice] = useState<Device>("computer");
  const [zoom, setZoom] = useState(1);
  const [height, setHeight] = useState(240);
  const frame = useRef<HTMLIFrameElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frameObserver = useRef<ResizeObserver | null>(null);
  const [availableWidth, setAvailableWidth] = useState(1280);
  useEffect(() => {
    const host = viewport.current;
    if (!host) return;
    const observer = new ResizeObserver(() => setAvailableWidth(host.clientWidth));
    observer.observe(host);
    setAvailableWidth(host.clientWidth);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => frameObserver.current?.disconnect(), []);
  const edit = !!canvas && !!entry.builder;
  const device = canvas?.view.device ?? localDevice;
  const grid = canvas?.view.grid ?? false;
  const setDevice = (next: Device) =>
    canvas ? canvas.setView({ ...canvas.view, device: next }) : setLocalDevice(next);
  const canvasRef = useRef(canvas);
  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);

  // The collections scroll story: its draft is applied to the real markup, and
  // the scroll preview puts it at any point of its sequence.
  const showcase = findShowcase(entry.builder);
  const scrollable = !!showcase && showcase.layout !== "row";
  const [scrollAt, setScrollAt] = useState<number | null>(null);
  const [hasShowcase, setHasShowcase] = useState(false);
  const playing = useRef(0);
  const showcaseRef = useRef({ showcase, scrollAt: scrollable ? scrollAt : null });
  useEffect(() => {
    showcaseRef.current = { showcase, scrollAt: scrollable ? scrollAt : null };
    const d = frame.current?.contentDocument;
    if (d && showcase) applyShowcaseDraft(d, showcase, scrollable ? scrollAt : null);
  });
  useEffect(() => () => cancelAnimationFrame(playing.current), []);
  const playScroll = () => {
    cancelAnimationFrame(playing.current);
    const start = performance.now();
    const length = 7000;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / length);
      setScrollAt(t);
      if (t < 1) playing.current = requestAnimationFrame(step);
    };
    playing.current = requestAnimationFrame(step);
  };

  const doc = useMemo(() => previewDocument(entry, snapshot, edit), [entry, snapshot, edit]);

  // Screenshot capture waits for the exact current srcdoc, rather than the
  // previous style's iframe during a pending navigation.
  let visualHash = 2166136261;
  for (let i = 0; i < doc.length; i++)
    visualHash = Math.imul(visualHash ^ doc.charCodeAt(i), 16777619);
  const visualRevision = (visualHash >>> 0).toString(36);
  const visualDoc = doc.replace("<html ", `<html data-visual-revision="${visualRevision}" `);

  // Keep the highlighted blocks in step with the selection made in the editor.
  const selection = canvas?.selection ?? NO_SELECTION;
  useEffect(() => {
    const d = frame.current?.contentDocument;
    if (edit && d) applySelection(d, selection);
  }, [edit, selection, entry]);
  useEffect(() => {
    const d = frame.current?.contentDocument;
    if (edit && d) syncGrid(d, grid);
  }, [edit, grid]);

  // The section's own height. The frame is never shorter than a real screen
  // (FRAME_HEIGHT), so a section sized in vh looks as it does on the site; the
  // canvas then shows just the section, not the empty rest of that screen.
  const measure = () => {
    const main = frame.current?.contentDocument?.querySelector("main");
    if (main)
      setHeight(
        Math.min(
          maxHeight ?? (edit ? 1200 : 700),
          Math.max(120, Math.ceil(main.getBoundingClientRect().height))
        )
      );
  };

  if (!hasPreviewContent(entry, snapshot)) {
    return (
      <p className="rounded border border-dashed border-neutral-300 bg-white p-4 text-xs text-neutral-600">
        This section shows nothing on the site right now (for example, there are no best sellers or
        reviews to display yet), so there is nothing to preview. You can still style it, or write
        its HTML from scratch below.
      </p>
    );
  }

  const widths: Record<Device, number> = { computer: 1280, tablet: 768, phone: 390 };
  const fixedWidth = widths[device];
  const fitted = canvasViewport(availableWidth, fixedWidth, zoom);
  const block =
    edit && selection.length === 1
      ? entry.builder?.cells[selection[0].col]?.[selection[0].idx]
      : undefined;
  const hasMotion = !!entry.builder?.cells.some((cell) => cell.some((b) => b.motion));
  const withDoc = (run: (d: Document) => void) => {
    const d = frame.current?.contentDocument;
    if (d) run(d);
  };
  const keys =
    device === "phone"
      ? ({ x: "mx", y: "my", w: "mw", h: "mh" } as const)
      : ({ x: "x", y: "y", w: "w", h: "h" } as const);
  const setStyleField = (key: "x" | "y" | "w" | "h" | "mx" | "my" | "mw" | "mh" | "rotate", raw: string) => {
    if (!canvas || selection.length !== 1) return;
    const value = raw === "" ? undefined : Number(raw);
    if (value !== undefined && !Number.isFinite(value)) return;
    canvas.api.update((doc) => patchBlockStyle(doc, selection[0], { [key]: value }));
  };
  const btn =
    "rounded border border-neutral-300 bg-white px-2 py-1 text-[11px] hover:bg-neutral-100 disabled:opacity-40";
  const align = (kind: AlignKind) => canvas && withDoc((d) => alignSelection(d, canvas.api, kind));
  const sel = (key: "x" | "y" | "w" | "h" | "rotate") => {
    const style = block?.style;
    const v = key === "rotate" ? style?.rotate : style?.[keys[key as "x" | "y" | "w" | "h"]];
    return v === undefined ? "" : String(v);
  };

  return (
    <div className={styles.preview}>
      <div className={styles.toolbar} role="toolbar" aria-label="Preview">
        <div className={styles.segment} role="group" aria-label="Screen size">
          {DEVICES.map(([dev, Icon, name]) => (
            <button
              key={dev}
              type="button"
              aria-pressed={device === dev}
              onClick={() => setDevice(dev)}
              title={`Preview at ${name.toLowerCase()} width`}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
              <span>{name}</span>
            </button>
          ))}
        </div>
        {!entry.visible && <span className="text-amber-700">Hidden on the site</span>}
        {edit && (
          <>
            <button
              type="button"
              aria-pressed={grid}
              onClick={() => canvas && canvas.setView({ ...canvas.view, grid: !grid })}
              title="Show a 12-column grid to line things up (blocks snap to it)"
            >
              <Grid3x3 aria-hidden="true" size={16} strokeWidth={1.75} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              disabled={!hasMotion}
              onClick={() => withDoc((d) => playAnimations(d))}
              title={
                hasMotion
                  ? "Play the scroll animations here"
                  : "No block has a scroll animation yet"
              }
            >
              <Play aria-hidden="true" size={16} strokeWidth={1.75} />
              <span>Play animations</span>
            </button>
          </>
        )}
        <label>
          Zoom
          <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
            {[0.5, 0.75, 1, 1.25, 1.5].map((z) => (
              <option key={z} value={z}>
                {Math.round(z * 100)}%
              </option>
            ))}
          </select>
        </label>
      </div>
      {edit && selection.length > 0 && (
        <div className={`${styles.contextRow} flex flex-wrap items-center gap-1 text-[11px] text-neutral-600`}>
          <span className="mr-1 text-neutral-500">Align</span>
          {(
            [
              ["left", AlignHorizontalJustifyStart, "Align left"],
              ["hcenter", AlignHorizontalJustifyCenter, "Centre horizontally"],
              ["right", AlignHorizontalJustifyEnd, "Align right"],
              ["top", AlignVerticalJustifyStart, "Align top"],
              ["vmiddle", AlignVerticalJustifyCenter, "Centre vertically"],
              ["bottom", AlignVerticalJustifyEnd, "Align bottom"],
            ] as [AlignKind, LucideIcon, string][]
          ).map(([kind, Icon, title]) => (
            <button
              key={kind}
              type="button"
              title={title}
              aria-label={title}
              disabled={selection.length === 0}
              onClick={() => align(kind)}
              className={`${btn} inline-flex items-center`}
            >
              <Icon aria-hidden="true" size={14} strokeWidth={1.75} />
            </button>
          ))}
          <button
            type="button"
            className={`${btn} inline-flex items-center gap-1`}
            disabled={selection.length < 2}
            onClick={() => align("same-width")}
          >
            <StretchHorizontal aria-hidden="true" size={14} strokeWidth={1.75} />
            Same width
          </button>
          <button
            type="button"
            className={`${btn} inline-flex items-center gap-1`}
            disabled={selection.length < 2}
            onClick={() => align("same-height")}
          >
            <StretchVertical aria-hidden="true" size={14} strokeWidth={1.75} />
            Same height
          </button>
          <button
            type="button"
            className={`${btn} inline-flex items-center gap-1`}
            disabled={selection.length < 3}
            onClick={() => align("distribute-h")}
          >
            <AlignHorizontalSpaceAround aria-hidden="true" size={14} strokeWidth={1.75} />
            Spread across
          </button>
          <button
            type="button"
            className={`${btn} inline-flex items-center gap-1`}
            disabled={selection.length < 3}
            onClick={() => align("distribute-v")}
          >
            <AlignVerticalSpaceAround aria-hidden="true" size={14} strokeWidth={1.75} />
            Spread down
          </button>
          <span className="ml-2 text-neutral-500">
            {selection.length > 1
              ? `${selection.length} blocks selected`
              : "Shift-click to select several · arrow keys nudge · right-click for more"}
          </span>
        </div>
      )}
      {edit && scrollable && (
        <div className={`${styles.contextRow} flex flex-wrap items-center gap-2 text-[11px] text-neutral-700`}>
          <label className="flex items-center gap-1.5 font-semibold">
            <input
              type="checkbox"
              checked={scrollAt !== null}
              disabled={!hasShowcase}
              onChange={(e) => {
                cancelAnimationFrame(playing.current);
                setScrollAt(e.target.checked ? 0 : null);
                window.setTimeout(measure, 60);
              }}
            />
            Scroll preview
          </label>
          {!hasShowcase && (
            <span className="text-neutral-500">
              The collections animation needs your collections with photos to preview.
            </span>
          )}
          {hasShowcase && scrollAt !== null && (
            <>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={scrollAt}
                aria-label="Scroll position"
                onChange={(e) => {
                  cancelAnimationFrame(playing.current);
                  setScrollAt(Number(e.target.value));
                }}
                className="min-w-40 flex-1"
              />
              <span className="w-10 tabular-nums">{Math.round(scrollAt * 100)}%</span>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={btn}
                  onClick={() => {
                    cancelAnimationFrame(playing.current);
                    setScrollAt(readingProgress(i, 3));
                  }}
                >
                  Scene {i + 1}
                </button>
              ))}
              <button type="button" className={btn} onClick={playScroll}>
                ▶ Scroll through
              </button>
            </>
          )}
        </div>
      )}
      {block && (
        <div className={`${styles.contextRow} flex flex-wrap items-center gap-2 text-[11px] text-neutral-600`}>
          <span className="text-neutral-500">
            {device === "phone" ? "On phones" : "Position and size"}
          </span>
          {(
            [
              ["x", "X %"],
              ["y", "Y rem"],
              ["w", "Width %"],
              ["h", "Height rem"],
              ["rotate", "Rotation °"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-1">
              {label}
              <input
                type="number"
                step={k === "w" ? 5 : k === "rotate" ? 5 : 1}
                min={k === "rotate" ? -180 : undefined}
                max={k === "rotate" ? 180 : undefined}
                value={sel(k)}
                placeholder="auto"
                onChange={(e) => setStyleField(k === "rotate" ? "rotate" : keys[k], e.target.value)}
                className="w-16 rounded border border-neutral-300 bg-white px-1 py-0.5"
              />
            </label>
          ))}
        </div>
      )}
      <div ref={viewport} className={styles.viewport}>
        <div
          className={styles.canvas}
          style={{ width: fitted.width, height: height * fitted.scale }}
        >
          <iframe
            data-visual-preview="section"
            data-visual-revision={visualRevision}
            ref={frame}
            title={`Preview of ${entry.id}`}
            // No scripts can run; same-origin only so the site's fonts and CSS load.
            sandbox="allow-same-origin"
            srcDoc={visualDoc}
            onLoad={() => {
              const d = frame.current?.contentDocument;
              const sc = showcaseRef.current;
              setHasShowcase(!!d?.querySelector(".showcase"));
              if (d && sc.showcase) applyShowcaseDraft(d, sc.showcase, sc.scrollAt);
              frameObserver.current?.disconnect();
              if (d?.body) {
                frameObserver.current = new ResizeObserver(measure);
                frameObserver.current.observe(d.body);
                d.fonts?.ready.then(measure);
                d.addEventListener("load", measure, true);
                // Preview controls select/edit content; they never navigate or submit.
                d.addEventListener("click", (event) => {
                  if ((event.target as Element).closest("a,button[type=submit]"))
                    event.preventDefault();
                });
                d.addEventListener("submit", (event) => event.preventDefault());
              }
              measure();
              const current = canvasRef.current;
              if (edit && d && current) {
                attachCanvas(d, current.api);
                applySelection(d, current.selection);
                syncGrid(d, current.view.grid);
              }
            }}
            style={{
              height: Math.max(height, FRAME_HEIGHT[device]),
              width: fixedWidth,
              transform: `scale(${fitted.scale})`,
              transformOrigin: "top left",
            }}
            className={styles.frame}
          />
        </div>
      </div>
    </div>
  );
}
