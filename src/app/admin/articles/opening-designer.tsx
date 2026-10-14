"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ARTICLE_OPENING_TEMPLATES,
  OPENING_DESCRIPTIONS,
  OPENING_LIMITS,
  OPENING_PARTS,
  openingNumber,
  openingPartProps,
  parseOpeningLayout,
  type ArticleOpeningTemplate,
  type OpeningAdjust,
  type OpeningLayout,
  type OpeningPart,
  OPENING_TEXT_STYLES,
  type OpeningText,
} from "@/lib/journal/opening";
// The site's own styles, so the preview is the real opening, not a sketch.
import "@/app/home.css";
import "@/app/blog/journal.css";
import "@/app/blog/article-opening.css";
import styles from "./opening-designer.module.css";

/** Widths the preview is laid out at: a laptop and a phone. */
const DESKTOP = 1100;
const PHONE = 390;

const FIELD_LABELS: Record<keyof OpeningAdjust, string> = {
  x: "Move sideways",
  y: "Move up / down",
  w: "Width",
  h: "Photo height",
  size: "Title size",
  rotate: "Rotation",
};
const FIELD_UNITS: Record<keyof OpeningAdjust, string> = {
  x: "%",
  y: "%",
  w: "%",
  h: "%",
  size: "%",
  rotate: "°",
};

type Drag = "move" | "resize" | "rotate";

/** Scale that fits `baseWidth` into the element's width (never above 1). */
function useFitScale(ref: RefObject<HTMLElement | null>, baseWidth: number) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / baseWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, baseWidth]);
  return scale;
}

/** Height of an element, kept current. */
function useHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    setHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, [ref]);
  return height;
}

type PreviewProps = {
  template: ArticleOpeningTemplate;
  layout: OpeningLayout;
  title: string;
  heroUrl: string;
  width: number;
  /** Extra props and children per part (editor handles); omitted in thumbnails. */
  part?: (part: OpeningPart) => {
    className: string;
    props: Record<string, unknown>;
    handles: ReactNode;
  };
};

/** The article opening with the site's markup and classes (see blog/[slug]/page.tsx). */
function OpeningPreview({ template, layout, title, heroUrl, width, part }: PreviewProps) {
  const propsOf = (name: OpeningPart) => {
    const base = openingPartProps(layout, name);
    const extra = part?.(name);
    return {
      ...base,
      ...extra?.props,
      className: extra?.className,
      style: base.style as CSSProperties,
      handles: extra?.handles,
    };
  };
  const { handles: headHandles, ...head } = propsOf("head");
  const { handles: titleHandles, ...titleProps } = propsOf("title");
  const { handles: imageHandles, ...image } = propsOf("image");
  const { handles: metaHandles, ...meta } = propsOf("meta");
  return (
    <div className="shelf journal">
      <article className="journal-article journal">
        <div className="journal-opening-wrap" style={{ width }}>
          <div
            className="journal-opening"
            data-has-image={!!heroUrl}
            data-opening={template}
            data-text={layout.text}
            {...(layout.shade !== undefined && {
              "data-shade": "",
              style: { "--o-shade": `${layout.shade}%` } as CSSProperties,
            })}
          >
            <header {...head} className={`journal-article-head ${head.className ?? ""}`}>
              <nav aria-label="Breadcrumb" className="journal-breadcrumb">
                <span>Journal</span>
                <span aria-hidden="true">/</span>
                <span>Category</span>
              </nav>
              <h1 {...titleProps}>
                {title.trim() || "Your article title"}
                {titleHandles}
              </h1>
              <p {...meta} className={`journal-card-meta ${meta.className ?? ""}`}>
                6 min read · Published today · The atelier
                {metaHandles}
              </p>
              {headHandles}
            </header>
            {heroUrl && (
              <figure {...image} className={`journal-figure journal-hero ${image.className ?? ""}`}>
                <div className="journal-figure-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any uploaded URL */}
                  <img src={heroUrl} alt="" className={styles.previewImg} draggable={false} />
                </div>
                {imageHandles}
              </figure>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

/** A live, scaled-down rendering of a template, for the picker. */
function TemplateThumb(props: Omit<PreviewProps, "width" | "part">) {
  const box = useRef<HTMLDivElement>(null);
  const scale = useFitScale(box, DESKTOP);
  return (
    <div ref={box} className={styles.thumb} aria-hidden="true">
      <div className={styles.thumbInner} style={{ transform: `scale(${scale})` }}>
        <OpeningPreview {...props} width={DESKTOP} />
      </div>
    </div>
  );
}

type Props = {
  /** "" = not chosen yet (Template 1). */
  template: string;
  onTemplate: (template: string) => void;
  layout: OpeningLayout;
  onLayout: (layout: OpeningLayout) => void;
  title: string;
  heroUrl: string;
};

/**
 * Admin > Articles: pick one of the ten numbered opening templates, then drag
 * the title, the text block and the photograph to move, resize and rotate them
 * for this article only.
 */
export function OpeningDesigner({
  template,
  onTemplate,
  layout,
  onLayout,
  title,
  heroUrl,
}: Props) {
  const effective = (ARTICLE_OPENING_TEMPLATES as readonly string[]).includes(template)
    ? (template as ArticleOpeningTemplate)
    : "classic";
  const [device, setDevice] = useState<"computer" | "phone">("computer");
  const [selected, setSelected] = useState<OpeningPart | null>(null);
  const [guides, setGuides] = useState<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const width = device === "computer" ? DESKTOP : PHONE;
  const scale = useFitScale(stage, width);
  const innerHeight = useHeight(inner);
  const phone = device === "phone";

  const setText = (text: OpeningText | undefined) => onLayout(parseOpeningLayout({ ...layout, text }));
  const setPart = (name: OpeningPart, adjust: OpeningAdjust | undefined) =>
    onLayout(parseOpeningLayout({ ...layout, [name]: adjust }));

  const startDrag = (name: OpeningPart, kind: Drag) => (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelected(name);
    // On phones the template's stacked layout is kept: only the title size applies.
    if (phone && !(name === "title" && kind === "resize")) return;
    const el = (event.target as HTMLElement).closest<HTMLElement>("[data-opening-part]");
    if (!el) return;
    const start = { x: event.clientX, y: event.clientY };
    const from = layout[name] ?? {};
    const box = el.getBoundingClientRect();
    const frame = el.querySelector<HTMLElement>(".journal-figure-frame");
    const startW = el.offsetWidth;
    const startH = frame?.offsetHeight ?? el.offsetHeight;
    const center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    const pct = (px: number) => (px / scale / width) * 100;
    // Snap targets (screen px): the other parts and the opening itself.
    const stageBox = stage.current!.getBoundingClientRect();
    const xs: number[] = [];
    const ys: number[] = [];
    const add = (r: DOMRect) => {
      xs.push(r.left, r.left + r.width / 2, r.right);
      ys.push(r.top, r.top + r.height / 2, r.bottom);
    };
    stage.current!.querySelectorAll<HTMLElement>("[data-opening-part], .journal-opening").forEach((other) => {
      if (other !== el && !el.contains(other) && !other.contains(el)) add(other.getBoundingClientRect());
    });
    const snap = (edges: number[], targets: number[]) => {
      let best: number | null = null;
      for (const edge of edges)
        for (const t of targets) if (Math.abs(t - edge) <= 6 && (best === null || Math.abs(t - edge) < Math.abs(best))) best = t - edge;
      if (best === null) return { delta: 0, lines: [] as number[] };
      const lines = targets.filter((t) => edges.some((edge) => Math.abs(t - (edge + best!)) < 0.5));
      return { delta: best, lines: [...new Set(lines)] };
    };

    const move = (e: globalThis.PointerEvent) => {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (kind === "move") {
        let mx = dx;
        let my = dy;
        if (!e.altKey) {
          const sx = snap([box.left + dx, box.left + dx + box.width / 2, box.right + dx], xs);
          const sy = snap([box.top + dy, box.top + dy + box.height / 2, box.bottom + dy], ys);
          mx += sx.delta;
          my += sy.delta;
          setGuides({ xs: sx.lines.map((x) => x - stageBox.left), ys: sy.lines.map((y) => y - stageBox.top) });
        } else setGuides({ xs: [], ys: [] });
        setPart(name, { ...from, x: (from.x ?? 0) + pct(mx), y: (from.y ?? 0) + pct(my) });
      } else if (kind === "resize") {
        if (name === "title") {
          const size = (from.size ?? 100) * (1 + dx / scale / Math.max(80, startW));
          setPart(name, { ...from, size: Math.round(size) });
        } else {
          setPart(name, {
            ...from,
            w: pct(startW * scale + dx),
            ...(name === "image" && { h: pct(startH * scale + dy) }),
          });
        }
      } else {
        let angle = (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) / Math.PI + 90;
        if (angle > 180) angle -= 360;
        angle = e.shiftKey ? Math.round(angle / 15) * 15 : Math.round(angle);
        if (Math.abs(angle) < 3) angle = 0;
        setPart(name, { ...from, rotate: angle || undefined });
      }
    };
    const up = () => {
      setGuides({ xs: [], ys: [] });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selected || phone) return;
    const step = event.shiftKey ? 2 : 0.5;
    const delta = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    const from = layout[selected] ?? {};
    setPart(selected, { ...from, x: (from.x ?? 0) + delta[0], y: (from.y ?? 0) + delta[1] });
  };

  const part = (name: OpeningPart) => {
    const active = selected === name;
    const canRotate = (OPENING_PARTS[name].fields as readonly string[]).includes("rotate");
    return {
      className: `${styles.part} ${active ? styles.selected : ""}`,
      props: { onPointerDown: startDrag(name, "move") },
      handles: active ? (
        <>
          <span className={styles.badge}>{OPENING_PARTS[name].label}</span>
          <span
            className={`${styles.handle} ${styles.resize}`}
            title={name === "title" ? "Drag to change the title size" : "Drag to resize"}
            onPointerDown={startDrag(name, "resize")}
          />
          {canRotate && !phone && (
            <span
              className={`${styles.handle} ${styles.rotate}`}
              title="Drag to rotate (hold Shift for 15° steps)"
              onPointerDown={startDrag(name, "rotate")}
            >
              ⟳
            </span>
          )}
        </>
      ) : null,
    };
  };

  const fields = selected ? OPENING_PARTS[selected].fields : [];
  const adjusted = Object.keys(layout).length > 0;

  return (
    <div className={styles.designer}>
      <div>
        <h3 className="text-sm font-medium">1 · Choose a template</h3>
        <p className="text-xs text-neutral-600">
          Ten numbered starting points for the title and main photograph. Your adjustments below
          stay when you switch.
        </p>
      </div>
      <div className={styles.templates} role="radiogroup" aria-label="Opening template">
        {ARTICLE_OPENING_TEMPLATES.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={effective === id}
            className={`${styles.card} ${effective === id ? styles.cardOn : ""}`}
            onClick={() => onTemplate(id)}
          >
            <TemplateThumb template={id} layout={{}} title={title} heroUrl={heroUrl} />
            <strong>Template {openingNumber(id)}</strong>
            <span>{OPENING_DESCRIPTIONS[id]}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div>
          <h3 className="text-sm font-medium">2 · Adjust it for this article</h3>
          <p className="text-xs text-neutral-600">
            Click the title, the text block or the photo. Drag it to move (it snaps to the red dotted lines; hold Alt to place freely), drag the corner square
            to resize, drag ⟳ to rotate. Arrow keys nudge.
          </p>
        </div>
        <div className={styles.devices} role="radiogroup" aria-label="Preview size">
          {(["computer", "phone"] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={device === d}
              className={device === d ? styles.deviceOn : ""}
              onClick={() => setDevice(d)}
            >
              {d === "computer" ? "Computer" : "Phone"}
            </button>
          ))}
        </div>
      </div>
      {phone && (
        <p className={styles.note}>
          On phones every template stacks the text and the photo for easy reading. Here only the
          title size can be changed; moves, widths and rotation apply on wider screens.
        </p>
      )}

      <div
        ref={stage}
        className={styles.stage}
        style={{ height: innerHeight * scale || undefined }}
        tabIndex={0}
        onKeyDown={nudge}
        onPointerDown={() => setSelected(null)}
        aria-label="Opening preview. Select a part, then use the arrow keys to move it."
      >
        <div
          ref={inner}
          className={styles.stageInner}
          style={{ width, transform: `scale(${scale})`, marginInline: phone ? "auto" : undefined }}
        >
          <OpeningPreview
            template={effective}
            layout={layout}
            title={title}
            heroUrl={heroUrl}
            width={width}
            part={part}
          />
        </div>
        {guides.xs.map((x) => (
          <span key={`x${x}`} className={`${styles.guide} ${styles.guideV}`} style={{ left: x }} />
        ))}
        {guides.ys.map((y) => (
          <span key={`y${y}`} className={`${styles.guide} ${styles.guideH}`} style={{ top: y }} />
        ))}
      </div>

      <div className={styles.panel}>
        <div className="flex flex-col gap-1 text-xs text-neutral-600">
          <span className="font-medium text-neutral-800">Components — click one to edit it</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(OPENING_PARTS) as OpeningPart[]).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={selected === name}
                className={`rounded border px-2.5 py-1 ${selected === name ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`}
                onClick={() => setSelected(name)}
              >
                {OPENING_PARTS[name].label}
                {layout[name] ? " •" : ""}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          <span className="font-medium text-neutral-800">Text over the photograph</span>
          <select
            className="field"
            value={layout.text ?? ""}
            onChange={(e) => setText((e.target.value || undefined) as OpeningText | undefined)}
          >
            <option value="">As the template designs it</option>
            {(Object.keys(OPENING_TEXT_STYLES) as OpeningText[]).map((t) => (
              <option key={t} value={t}>
                {OPENING_TEXT_STYLES[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          <span className="font-medium text-neutral-800">
            Darken the photo under the text: {layout.shade ?? "template"}
            {layout.shade !== undefined && "%"}
          </span>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={layout.shade ?? 25}
            onChange={(e) => onLayout(parseOpeningLayout({ ...layout, shade: Number(e.target.value) }))}
          />
          <span className="text-neutral-500">Used by templates whose text crosses the photo (5 and 6). 0 = no darkening.</span>
        </label>
        {selected ? (
          <>
            <strong className="text-sm">{OPENING_PARTS[selected].label}</strong>
            <div className={styles.fields}>
              {fields.map((field) => {
                const [min, max] = OPENING_LIMITS[field];
                const value = layout[selected]?.[field];
                const fallback = field === "size" ? 100 : field === "w" || field === "h" ? undefined : 0;
                return (
                  <label key={field} className="flex flex-col gap-1 text-xs text-neutral-600">
                    <span>
                      {FIELD_LABELS[field]}:{" "}
                      {value === undefined ? (fallback === undefined ? "template" : `${fallback}${FIELD_UNITS[field]}`) : `${value}${FIELD_UNITS[field]}`}
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={field === "rotate" || field === "size" ? 1 : 0.5}
                      disabled={phone && field !== "size"}
                      value={value ?? fallback ?? Math.round((min + max) / 2)}
                      onChange={(e) =>
                        setPart(selected, { ...layout[selected], [field]: Number(e.target.value) })
                      }
                    />
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              className="self-start rounded border px-2 py-1 text-xs"
              onClick={() => setPart(selected, undefined)}
            >
              Reset {OPENING_PARTS[selected].label.toLowerCase()}
            </button>
          </>
        ) : (
          <p className="text-xs text-neutral-600">
            Nothing selected. {adjusted ? "This article has its own adjustments." : "This article uses the template as it is."}
          </p>
        )}
        {adjusted && (
          <button
            type="button"
            className="self-start rounded border px-2 py-1 text-xs"
            onClick={() => {
              onLayout({});
              setSelected(null);
            }}
          >
            Reset all adjustments
          </button>
        )}
      </div>
    </div>
  );
}
