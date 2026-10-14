"use client";

import { useState } from "react";
import { ColorField } from "@/components/color-field";
import {
  SHOWCASE_SCENES,
  SHOWCASE_STYLES,
  type ShowcaseSceneKey,
  type ShowcaseSceneOverride,
  type ShowcaseScroll,
} from "@/lib/showcase-options";
import { SCROLL_PER_UNIT, SCROLL_PER_UNIT_RANGE, timelineLength } from "@/lib/showcase-timeline";
import { ImagePick } from "./image-pick";

/**
 * The editor for the collections scroll story: the composition (picked from
 * visual cards), colours (presets or custom), how the scroll behaves, and each
 * scene's text, link, picture and the size/position of its parts. Anything left
 * empty keeps the site's own value. Parts can also be dragged in the preview.
 */

const SCENE_NAMES: Record<ShowcaseSceneKey, string> = {
  necklace: "1 · Necklaces",
  bracelet: "2 · Bracelets",
  earrings: "3 · Earrings",
};

/** A small drawing of each composition: piece (circle), its plane, and text lines. */
function StyleSketch({ style }: { style: string }) {
  const plane: Record<string, React.ReactNode> = {
    editorial: <rect x="44" y="14" width="40" height="40" fill="#eadfca" />,
    minimal: null,
    classical: (
      <>
        <rect x="38" y="8" width="40" height="44" fill="none" stroke="#b08d57" />
        <rect x="35" y="5" width="46" height="50" fill="none" stroke="#ccc" />
      </>
    ),
    arched: <path d="M36 54V26a22 22 0 0 1 44 0v28z" fill="#efe6d6" stroke="#ccc" />,
    bold: <circle cx="58" cy="30" r="24" fill="#d9c3e6" />,
    studio: <rect x="36" y="8" width="44" height="46" fill="#f6f4ef" stroke="#ddd" />,
    couture: (
      <>
        <rect x="42" y="12" width="40" height="42" fill="#f1e8d8" stroke="#b08d57" />
        <rect x="34" y="6" width="40" height="42" fill="none" stroke="#ccc" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 120 60" className="h-14 w-full" aria-hidden="true">
      <rect width="120" height="60" fill="#fff" />
      {plane[style]}
      <circle cx="58" cy="30" r="13" fill="none" stroke="#3a2a35" strokeWidth="2" strokeDasharray="2 2" />
      <rect x="90" y="18" width="22" height="5" fill="#3a2a35" />
      <rect x="90" y="27" width="18" height="2.5" fill="#999" />
      <rect x="90" y="32" width="14" height="2.5" fill="#999" />
      <rect x="90" y="40" width="14" height="5" fill="#6b4a63" />
      <circle cx="10" cy="22" r="1.6" fill="#6b4a63" />
      <circle cx="10" cy="30" r="1.6" fill="#ccc" />
      <circle cx="10" cy="38" r="1.6" fill="#ccc" />
    </svg>
  );
}

/** One-click colour sets; "site" clears them so the site style applies. */
const PRESETS: { name: string; colors: Partial<ShowcaseScroll> | null; swatch: string[] }[] = [
  { name: "Site style", colors: null, swatch: ["var(--site-bg,#fff)", "var(--site-primary,#3a2a35)"] },
  {
    name: "Ivory",
    colors: { bg: "#faf8f5", title: "#2b1f28", textColor: "#6b5f66", accent: "#2b1f28", accentText: "#ffffff" },
    swatch: ["#faf8f5", "#2b1f28"],
  },
  {
    name: "Champagne",
    colors: { bg: "#f3ead9", title: "#3a2a1f", textColor: "#6b5a48", accent: "#8a6a3a", accentText: "#ffffff" },
    swatch: ["#f3ead9", "#8a6a3a"],
  },
  {
    name: "Night",
    colors: { bg: "#1d1820", title: "#f5efe6", textColor: "#c9bfc5", accent: "#e8d9b5", accentText: "#1d1820" },
    swatch: ["#1d1820", "#e8d9b5"],
  },
];

const PARTS = [
  ["title", "Title"],
  ["description", "Description"],
  ["counter", "Counter (01 / 03)"],
  ["button", "Button"],
] as const;
const PART_KEYS = PARTS.flatMap(([part]) => [`${part}Scale`, `${part}X`, `${part}Y`]) as (keyof ShowcaseSceneOverride)[];
const IMAGE_KEYS = ["imageScale", "imageX", "imageY"] as const;

type Props = {
  layout?: "row";
  scenes?: Partial<Record<ShowcaseSceneKey, ShowcaseSceneOverride>>;
  scroll?: ShowcaseScroll;
  onChange: (patch: {
    layout?: "row" | undefined;
    scenes?: Partial<Record<ShowcaseSceneKey, ShowcaseSceneOverride>> | undefined;
    scroll?: ShowcaseScroll | undefined;
  }) => void;
};

/** A labelled slider with its value and a one-click reset. */
function Slider({
  label,
  value,
  initial,
  min,
  max,
  unit = "%",
  onChange,
}: {
  label: string;
  value: number | undefined;
  initial: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number | undefined) => void;
}) {
  const current = value ?? initial;
  return (
    <label className="grid grid-cols-[7rem_1fr_3.5rem_1.25rem] items-center gap-2 text-xs text-neutral-600">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={current}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(v === initial ? undefined : v);
        }}
      />
      <span className="text-right tabular-nums">
        {current}
        {unit}
      </span>
      <button
        type="button"
        title="Reset"
        aria-label={`Reset ${label}`}
        className={`text-neutral-500 ${value === undefined ? "invisible" : ""}`}
        onClick={() => onChange(undefined)}
      >
        ↺
      </button>
    </label>
  );
}

export function ShowcaseFields({ layout, scenes, scroll, onChange }: Props) {
  const [active, setActive] = useState<ShowcaseSceneKey>("necklace");
  const setScroll = (patch: Partial<ShowcaseScroll>) => {
    const next: Record<string, unknown> = { ...scroll, ...patch };
    for (const key of Object.keys(next)) if (next[key] === undefined) delete next[key];
    onChange({ scroll: Object.keys(next).length ? (next as ShowcaseScroll) : undefined });
  };
  const clean = (value: Record<string, unknown>) => {
    for (const key of Object.keys(value))
      if (value[key] === "" || value[key] === undefined) delete value[key];
    return value;
  };
  const writeScenes = (all: Record<string, unknown>) => {
    for (const key of Object.keys(all))
      if (!all[key] || !Object.keys(all[key] as object).length) delete all[key];
    onChange({ scenes: Object.keys(all).length ? (all as Props["scenes"]) : undefined });
  };
  const setScene = (scene: ShowcaseSceneKey, patch: Partial<ShowcaseSceneOverride>) =>
    writeScenes({ ...scenes, [scene]: clean({ ...scenes?.[scene], ...patch }) });
  /** Same patch on every scene (e.g. reset or copy a layout). */
  const setAll = (patchFor: (scene: ShowcaseSceneKey) => Partial<ShowcaseSceneOverride>) =>
    writeScenes(
      Object.fromEntries(
        SHOWCASE_SCENES.map((scene) => [scene, clean({ ...scenes?.[scene], ...patchFor(scene) })])
      )
    );
  const pick = (from: ShowcaseSceneOverride | undefined, keys: readonly (keyof ShowcaseSceneOverride)[]) =>
    Object.fromEntries(keys.map((key) => [key, from?.[key]])) as Partial<ShowcaseSceneOverride>;
  const unset = (keys: readonly (keyof ShowcaseSceneOverride)[]) =>
    Object.fromEntries(keys.map((key) => [key, undefined])) as Partial<ShowcaseSceneOverride>;

  const unit = scroll?.distance ?? SCROLL_PER_UNIT;
  const screens = 1 + timelineLength(3) * unit;
  const moved = SHOWCASE_SCENES.some((scene) => PART_KEYS.some((key) => scenes?.[scene]?.[key] !== undefined));
  const toggle = (key: "rail" | "counter" | "text" | "cta" | "hint", label: string) => (
    <label className="flex items-center gap-1.5 text-xs">
      <input
        type="checkbox"
        checked={scroll?.[key] !== false}
        onChange={(e) => setScroll({ [key]: e.target.checked ? undefined : false })}
      />
      {label}
    </label>
  );
  const v = scenes?.[active];
  const seg = (on: boolean) =>
    `rounded border px-3 py-1.5 text-xs ${on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Presentation">
        <button type="button" role="radio" aria-checked={layout !== "row"} className={seg(layout !== "row")} onClick={() => onChange({ layout: undefined })}>
          Scroll story (pinned, animated)
        </button>
        <button type="button" role="radio" aria-checked={layout === "row"} className={seg(layout === "row")} onClick={() => onChange({ layout: "row" })}>
          Row of three cards
        </button>
      </div>

      {layout !== "row" && (
        <section className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-neutral-700">Composition</h4>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2" role="radiogroup" aria-label="Composition">
            {SHOWCASE_STYLES.map((style) => {
              const on = (scroll?.style ?? "editorial") === style.value;
              const [name, note] = style.label.split(" — ");
              return (
                <button
                  key={style.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`flex flex-col gap-1 rounded border p-1.5 text-left text-[11px] leading-snug ${on ? "border-neutral-900 ring-2 ring-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
                  onClick={() => setScroll({ style: style.value === "editorial" ? undefined : style.value })}
                >
                  <StyleSketch style={style.value} />
                  <strong className="text-xs text-neutral-900">{name}</strong>
                  <span className="text-neutral-600">{note}</span>
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={scroll?.fullScreen ?? false}
              onChange={(event) => setScroll({ fullScreen: event.target.checked ? true : undefined })} />
            Fill the screen (full width and height)
          </label>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-neutral-700">Colours</h4>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="flex items-center gap-2 rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:border-neutral-900"
              onClick={() =>
                setScroll(preset.colors ?? { bg: undefined, title: undefined, textColor: undefined, accent: undefined, accentText: undefined })
              }
            >
              <span className="flex">
                {preset.swatch.map((c) => (
                  <span key={c} className="h-4 w-4 rounded-full border border-neutral-300" style={{ background: c }} />
                ))}
              </span>
              {preset.name}
            </button>
          ))}
        </div>
        <details className="rounded border border-neutral-200 p-2">
          <summary className="cursor-pointer text-xs">Custom colours</summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["bg", "Background", "#ffffff"],
                ["title", "Title", "#111111"],
                ["textColor", "Text and counter", "#555555"],
                ["accent", "Button and progress", "#154230"],
                ["accentText", "Button text", "#ffffff"],
              ] as const
            ).map(([key, label, fallback]) => (
              <div key={key} className="flex flex-col gap-1 text-xs text-neutral-600">
                {label}
                <ColorField value={scroll?.[key]} label={label} fallback={fallback} onChange={(c) => setScroll({ [key]: c })} />
              </div>
            ))}
          </div>
        </details>
      </section>

      {layout !== "row" && (
        <details className="rounded border border-neutral-200 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-neutral-700">Scrolling and what shows</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-neutral-600">
              How the scenes change
              <select
                value={scroll?.transition ?? ""}
                onChange={(e) => setScroll({ transition: (e.target.value || undefined) as ShowcaseScroll["transition"] })}
                className="field"
              >
                <option value="">Slide (the picture travels up)</option>
                <option value="fade">Fade (cross-fade in place)</option>
                <option value="zoom">Zoom (cross-fade while scaling)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-neutral-600">
              Scroll length: about {screens.toFixed(1)} screens
              <input
                type="range"
                min={SCROLL_PER_UNIT_RANGE.min}
                max={SCROLL_PER_UNIT_RANGE.max}
                step={0.05}
                value={unit}
                onChange={(e) => setScroll({ distance: Number(e.target.value) })}
              />
              <span className="flex justify-between text-[11px] text-neutral-500">
                <span>Quick</span>
                <button type="button" className="underline" onClick={() => setScroll({ distance: undefined })}>
                  Reset
                </button>
                <span>Slow</span>
              </span>
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1 sm:col-span-2">
              {toggle("rail", "Progress dots")}
              {toggle("counter", "Counter (01 / 03)")}
              {toggle("text", "Description")}
              {toggle("cta", "Button")}
              {toggle("hint", "Swipe hint on phones")}
            </div>
            <p className="text-[11px] text-neutral-500 sm:col-span-2">
              Use “Scroll preview” above the preview to move through the scenes. Visitors who prefer
              reduced motion see the scenes stacked.
            </p>
          </div>
        </details>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-neutral-700">Scenes</h4>
          {moved && (
            <button
              type="button"
              className="text-xs underline"
              title="Puts the counter, title, description and button of every scene back on one clean edge"
              onClick={() => setAll(() => unset(PART_KEYS))}
            >
              Realign the text in all scenes
            </button>
          )}
        </div>
        <div className="flex gap-1" role="tablist" aria-label="Scene">
          {SHOWCASE_SCENES.map((scene) => (
            <button
              key={scene}
              type="button"
              role="tab"
              aria-selected={active === scene}
              className={`flex-1 border-b-2 px-2 py-1.5 text-xs ${active === scene ? "border-neutral-900 font-semibold" : "border-transparent text-neutral-500"}`}
              onClick={() => setActive(scene)}
            >
              {SCENE_NAMES[scene]}
              {scenes?.[scene] && <span className="text-accent ml-1">●</span>}
            </button>
          ))}
        </div>

        <div className="grid gap-3 rounded border border-neutral-200 bg-white p-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Title
            <input value={v?.name ?? ""} maxLength={60} onChange={(e) => setScene(active, { name: e.target.value })} placeholder="The collection's name" className="field" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Button text
            <input value={v?.cta ?? ""} maxLength={60} onChange={(e) => setScene(active, { cta: e.target.value })} placeholder="The site's own" className="field" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
            Description
            <input value={v?.description ?? ""} maxLength={300} onChange={(e) => setScene(active, { description: e.target.value })} placeholder="The site's own" className="field" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Where the button goes
            <input value={v?.href ?? ""} onChange={(e) => setScene(active, { href: e.target.value })} placeholder="/category/… (the collection's page)" className="field font-mono" />
          </label>
          <div className="flex flex-col gap-1 text-xs text-neutral-600">
            Text side
            <div className="flex gap-1">
              {([["", "Alternate"], ["left", "Left"], ["right", "Right"]] as const).map(([value, label]) => (
                <button key={label} type="button" className={seg((v?.side ?? "") === value)}
                  onClick={() => setScene(active, { side: (value || undefined) as "left" | "right" | undefined })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
            Product in the hover card (its web address, e.g. collana-acquamarina-98782c)
            <input
              value={v?.product ?? ""}
              onChange={(e) => setScene(active, { product: e.target.value.trim() })}
              placeholder="Automatic: the product whose photo this scene shows"
              className="field font-mono"
            />
          </label>
          <div className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
            Picture (empty = the collection&apos;s own photo)
            <ImagePick src={v?.image ?? ""} onChange={(image) => setScene(active, { image })} />
          </div>

          {layout !== "row" && (
            <div className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-medium text-neutral-700">Picture</span>
              <Slider label="Size" value={v?.imageScale} initial={100} min={20} max={250} onChange={(n) => setScene(active, { imageScale: n })} />
              <Slider label="Left / right" value={v?.imageX} initial={0} min={-50} max={50} onChange={(n) => setScene(active, { imageX: n })} />
              <Slider label="Up / down" value={v?.imageY} initial={0} min={-50} max={50} onChange={(n) => setScene(active, { imageY: n })} />

              <span className="mt-2 text-xs font-medium text-neutral-700">Text parts</span>
              <p className="text-[11px] text-neutral-500">
                Tip: you can also drag these parts in the preview. Moves are relative to each part&apos;s own size.
              </p>
              {PARTS.map(([part, label]) => (
                <details key={part} className="rounded border border-neutral-200 p-2" open={part === "title"}>
                  <summary className="cursor-pointer text-xs">
                    {label}
                    {(["Scale", "X", "Y"] as const).some((a) => v?.[`${part}${a}` as keyof ShowcaseSceneOverride] !== undefined) && (
                      <span className="text-accent ml-1">●</span>
                    )}
                  </summary>
                  <div className="mt-2 flex flex-col gap-1.5">
                    <Slider label="Size" value={v?.[`${part}Scale`] as number | undefined} initial={100} min={20} max={250}
                      onChange={(n) => setScene(active, { [`${part}Scale`]: n })} />
                    <Slider label="Left / right" value={v?.[`${part}X`] as number | undefined} initial={0} min={-200} max={200}
                      onChange={(n) => setScene(active, { [`${part}X`]: n })} />
                    <Slider label="Up / down" value={v?.[`${part}Y`] as number | undefined} initial={0} min={-200} max={200}
                      onChange={(n) => setScene(active, { [`${part}Y`]: n })} />
                  </div>
                </details>
              ))}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded border px-2.5 py-1 text-xs"
                  onClick={() => setAll(() => ({ ...pick(v, PART_KEYS), ...pick(v, IMAGE_KEYS) }))}>
                  Use this layout in all scenes
                </button>
                <button type="button" className="rounded border px-2.5 py-1 text-xs"
                  onClick={() => setScene(active, { ...unset(PART_KEYS), ...unset(IMAGE_KEYS) })}>
                  Reset sizes and positions in this scene
                </button>
              </div>
            </div>
          )}
          {v && (
            <button
              type="button"
              onClick={() => writeScenes({ ...scenes, [active]: undefined })}
              className="w-fit text-xs text-red-700 underline sm:col-span-2"
            >
              Back to the site&apos;s own content for this scene
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
