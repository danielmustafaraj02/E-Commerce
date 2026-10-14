"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Menu, Pause, Play, RotateCcw, Search, ShoppingBag, Shuffle, Star, X, Expand } from "lucide-react";
import { HeroConcept, type HeroCopy } from "@/components/hero-concepts/hero-concept";
import type { HeroProduct } from "@/lib/hero-concepts/products";
import {
  CONCEPTS,
  CONCEPT_LABELS,
  CUTOUTS,
  DEFAULTS,
  LIMITS,
  ROTATING_STYLES,
  ROTATING_STYLE_LABELS,
  WALLPAPER_POOL,
  cutoutFor,
  isQuiet,
  sharpAt,
  type ConceptId,
  type CutoutKind,
  type HeroConceptsConfig,
  type Placement,
} from "@/lib/hero-concepts/config";
import { publishHeroConcept, saveHeroConceptsDraft, unpublishHeroConcept } from "./actions";

type Lang = "en" | "it";
type View = "both" | "computer" | "phone";

// The screens the previews stand for: a 1440 × 900 laptop (the hero takes 88%
// of its height, as on the site) and a 390 × 844 phone under the 92px header.
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844, header: 92 };

const KIND_LABELS: Record<CutoutKind | "all", string> = {
  all: "All",
  necklace: "Necklaces",
  bracelet: "Bracelets",
  earrings: "Earrings",
  other: "Other",
};

export function HeroConceptsWorkbench({
  initial,
  savedAt: initialSavedAt,
  copy,
  names,
  logoSrc,
  live: initialLive,
  products,
}: {
  initial: HeroConceptsConfig;
  savedAt: string | null;
  copy: Record<Lang, HeroCopy>;
  names: Record<string, string>;
  logoSrc: string;
  /** The design on the home page now, or null for the original hero. */
  live: { concept: ConceptId; at: string } | null;
  /** Each piece's card (name, price, link), by language. */
  products: Record<Lang, Record<string, HeroProduct>>;
}) {
  const [live, setLive] = useState(initialLive);
  const [liveError, setLiveError] = useState("");
  const [publishing, startPublishing] = useTransition();
  const [config, setConfig] = useState(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();
  const [concept, setConcept] = useState<ConceptId>(initial.chosen ?? "minimal");
  const [view, setView] = useState<View>("both");
  const [lang, setLang] = useState<Lang>("en");
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [scene, setScene] = useState(0);
  const [editingScene, setEditingScene] = useState(false);

  const dirty = JSON.stringify(config) !== savedJson;
  const nameOf = (slug: string) => names[slug] ?? slug.replace(/-[0-9a-f]{6}$/, "").replace(/-/g, " ");

  function update<K extends ConceptId>(key: K, patch: Partial<HeroConceptsConfig[K]>) {
    setConfig((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }
  function save() {
    setError("");
    startSaving(async () => {
      const result = await saveHeroConceptsDraft(JSON.stringify(config));
      if (result.error) setError(result.error);
      else if (result.at) {
        setSavedAt(result.at);
        setSavedJson(JSON.stringify(config));
      }
    });
  }

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pinnedScene = concept === "rotating" && editingScene ? scene : undefined;
  const hero = (style: CSSProperties) => (
    <HeroConcept
      key={`${concept}-${replay}`}
      concept={concept}
      config={config}
      copy={copy[lang]}
      paused={paused}
      scene={pinnedScene}
      products={products[lang]}
      style={style}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ---- Toolbar ---- */}
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur">
        <Segmented
          label="Concept"
          value={concept}
          options={CONCEPTS.map((id) => ({
            value: id,
            label: (
              <span className="inline-flex items-center gap-1.5">
                {CONCEPT_LABELS[id]}
                {live?.concept === id && (
                  <span className="rounded bg-emerald-600 px-1 text-[10px] font-semibold uppercase text-white">
                    live
                  </span>
                )}
                {config.chosen === id && (
                  <Star aria-label="favourite" className="size-3.5 fill-amber-400 text-amber-500" />
                )}
              </span>
            ),
          }))}
          onChange={(id) => {
            setConcept(id);
            setEditingScene(false);
          }}
        />
        <Segmented
          label="Screen"
          value={view}
          options={[
            { value: "both", label: "Both" },
            { value: "computer", label: "Computer" },
            { value: "phone", label: "Phone" },
          ]}
          onChange={setView}
        />
        <Segmented
          label="Language"
          value={lang}
          options={[
            { value: "en", label: "English" },
            { value: "it", label: "Italiano" },
          ]}
          onChange={setLang}
        />
        <div className="flex items-center gap-1.5">
          <ToolButton onClick={() => setPaused((value) => !value)} pressed={paused}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? "Play animations" : "Pause animations"}
          </ToolButton>
          <ToolButton onClick={() => setReplay((value) => value + 1)}>
            <RotateCcw className="size-4" />
            Replay
          </ToolButton>
          <ToolButton onClick={() => setFullScreen(true)}>
            <Expand className="size-4" />
            Full screen
          </ToolButton>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-neutral-500" aria-live="polite">
            {error ? (
              <span className="text-red-700">{error}</span>
            ) : dirty ? (
              "Unsaved changes"
            ) : savedAt ? (
              `Draft saved ${new Date(savedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`
            ) : (
              "Not saved yet"
            )}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="btn-primary rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---- Previews ---- */}
        <div className="flex min-w-0 flex-col gap-6">
          {view !== "phone" && (
            <figure className="m-0">
              <figcaption className="mb-2 text-xs text-neutral-500">
                Computer · {DESKTOP.width} × {DESKTOP.height} screen, drawn to fit
              </figcaption>
              <DesktopFrame>
                {hero({ "--hc-vh": `${DESKTOP.height / 100}px` } as CSSProperties)}
              </DesktopFrame>
            </figure>
          )}
          {view !== "computer" && (
            <figure className="m-0 flex flex-col items-center">
              <figcaption className="mb-2 text-xs text-neutral-500">
                Phone · {PHONE.width} × {PHONE.height}, scroll inside it
              </figcaption>
              <PhoneFrame logoSrc={logoSrc}>
                {hero({
                  "--hc-vh": `${PHONE.height / 100}px`,
                  "--hc-header": `${PHONE.header}px`,
                } as CSSProperties)}
              </PhoneFrame>
            </figure>
          )}
        </div>

        {/* ---- Settings ---- */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{CONCEPT_LABELS[concept]}</h2>
              <button
                type="button"
                onClick={() => setConfig((current) => ({ ...current, [concept]: DEFAULTS[concept] }))}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
              >
                <RotateCcw className="size-3.5" />
                Reset to default
              </button>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-neutral-500">{CONCEPT_NOTES[concept]}</p>
            {concept === "minimal" && (
              <MinimalControls config={config} update={update} nameOf={nameOf} />
            )}
            {concept === "rotating" && (
              <RotatingControls
                config={config}
                setConfig={setConfig}
                update={update}
                nameOf={nameOf}
                scene={Math.min(scene, config.rotating.scenes.length - 1)}
                setScene={setScene}
                editing={editingScene}
                setEditing={setEditingScene}
              />
            )}
            {concept === "wallpaper" && (
              <WallpaperControls config={config} update={update} nameOf={nameOf} />
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-1 text-base font-semibold">Product cards</h2>
            <p className="mb-3 text-xs leading-relaxed text-neutral-500">
              Hovering a piece (tapping it on a phone) shows its name, price and a link to it. Applies
              to all three designs; try it in the preview.
            </p>
            <Toggle
              label="Show product cards"
              checked={config.cards}
              onChange={(cards) => setConfig((current) => ({ ...current, cards }))}
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-1 text-base font-semibold">Live hero</h2>
            <p className="mb-3 text-xs leading-relaxed text-neutral-500" aria-live="polite">
              {live
                ? `The home page shows ${CONCEPT_LABELS[live.concept]}${
                    live.at
                      ? ` (since ${new Date(live.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })})`
                      : ""
                  }.`
                : "The home page shows the original hero."}
            </p>
            {liveError && <p className="mb-2 text-xs text-red-700">{liveError}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={publishing}
                onClick={() => {
                  if (
                    !window.confirm(
                      `Show the ${CONCEPT_LABELS[concept]} hero, with the settings you see now, on the live home page?`
                    )
                  )
                    return;
                  setLiveError("");
                  startPublishing(async () => {
                    const result = await publishHeroConcept(concept, JSON.stringify(config));
                    if (result.error) setLiveError(result.error);
                    else setLive({ concept, at: result.at ?? "" });
                  });
                }}
                className="btn-primary rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {publishing ? "Working…" : `Use ${CONCEPT_LABELS[concept]} as live hero`}
              </button>
              {live && (
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => {
                    if (!window.confirm("Bring back the original hero on the live home page?")) return;
                    setLiveError("");
                    startPublishing(async () => {
                      const result = await unpublishHeroConcept();
                      if (result.error) setLiveError(result.error);
                      else setLive(null);
                    });
                  }}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-40"
                >
                  Restore the original hero
                </button>
              )}
            </div>
            <a
              href="/en"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-neutral-600 underline-offset-2 hover:underline"
            >
              Open the home page ↗
            </a>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-1 text-base font-semibold">Favourite</h2>
            <p className="mb-3 text-xs leading-relaxed text-neutral-500">
              Marks the design to publish later. It is kept with the draft; the home page stays as it
              is.
            </p>
            <button
              type="button"
              onClick={() =>
                setConfig((current) => ({
                  ...current,
                  chosen: current.chosen === concept ? null : concept,
                }))
              }
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
                config.chosen === concept
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <Star
                className={`size-4 ${config.chosen === concept ? "fill-amber-400 text-amber-500" : ""}`}
              />
              {config.chosen === concept
                ? `${CONCEPT_LABELS[concept]} is the favourite`
                : `Mark ${CONCEPT_LABELS[concept]} as favourite`}
            </button>
          </div>
        </aside>
      </div>

      {fullScreen && (
        <FullScreen onClose={() => setFullScreen(false)}>
          {hero({ "--hc-vh": "1svh", "--hc-header": "0px" } as CSSProperties)}
        </FullScreen>
      )}
    </div>
  );
}

const CONCEPT_NOTES: Record<ConceptId, string> = {
  minimal:
    "One large piece beside the text. Choose a piece with a sharp photo: it is drawn about half the width of the screen.",
  rotating:
    "Two to four pieces per scene; the scenes take turns. Pick a scene below to edit it — the preview holds on that scene while you do.",
  wallpaper:
    "Many pieces over the whole hero, laid out once from the settings below and never moved again. Shuffle for a different arrangement.",
};

// ---- Frames ---------------------------------------------------------------------------

/** A true 1440px-wide hero, scaled down to the space available. */
function DesktopFrame({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(DESKTOP.height * 0.88);
  useEffect(() => {
    const measure = () => {
      if (outer.current) setScale(Math.min(1, outer.current.clientWidth / DESKTOP.width));
      if (inner.current) setHeight(inner.current.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={outer}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm"
      style={{ height: height * scale }}
    >
      <div
        ref={inner}
        style={{ width: DESKTOP.width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}

/** A 390 × 844 phone: the site's header, then the hero, scrollable inside. */
function PhoneFrame({ children, logoSrc }: { children: ReactNode; logoSrc: string }) {
  return (
    <div
      className="overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-white shadow-lg"
      style={{ width: PHONE.width + 20 }}
    >
      <div className="overflow-y-auto" style={{ width: PHONE.width, height: PHONE.height }}>
        <div
          className="flex items-center justify-between border-b border-neutral-200 bg-[#f6f8fb] px-5"
          style={{ height: PHONE.header }}
          aria-hidden="true"
        >
          <Menu className="size-6 text-neutral-800" />
          <Image src={logoSrc} alt="" width={100} height={56} className="h-14" style={{ width: "auto" }} />
          <ShoppingBag className="size-6 text-neutral-800" />
        </div>
        {children}
      </div>
    </div>
  );
}

function FullScreen({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  // Straight into <body>: the admin layout's stacking would otherwise keep
  // the site header above it.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen preview"
      className="fixed inset-0 z-[1000] overflow-y-auto bg-white"
    >
      {children}
      <button
        type="button"
        onClick={onClose}
        autoFocus
        className="fixed right-4 top-4 z-[1001] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-900 shadow"
      >
        <X className="size-4" />
        Close
      </button>
    </div>,
    document.body
  );
}

// ---- Concept settings -----------------------------------------------------------------

type Update = <K extends ConceptId>(key: K, patch: Partial<HeroConceptsConfig[K]>) => void;

function MinimalControls({
  config,
  update,
  nameOf,
}: {
  config: HeroConceptsConfig;
  update: Update;
  nameOf: (slug: string) => string;
}) {
  const m = config.minimal;
  return (
    <div className="flex flex-col gap-4">
      <PiecePicker
        label="The piece"
        value={m.slug}
        onChange={(slug) => update("minimal", { slug })}
        nameOf={nameOf}
        needs={520}
      />
      <Slider
        label="Size"
        unit="% of the right half"
        value={m.size}
        range={LIMITS.minimalSize}
        onChange={(size) => update("minimal", { size })}
      />
      <Slider label="Across" unit="%" value={m.x} range={LIMITS.position} onChange={(x) => update("minimal", { x })} />
      <Slider label="Down" unit="%" value={m.y} range={LIMITS.position} onChange={(y) => update("minimal", { y })} />
      <Slider label="Tilt" unit="°" value={m.rotate} range={LIMITS.rotate} onChange={(rotate) => update("minimal", { rotate })} />
      <Toggle label="Float gently" checked={m.float} onChange={(float) => update("minimal", { float })} />
      <Slider
        label="Animation"
        unit="%"
        value={m.intensity}
        range={LIMITS.intensity}
        onChange={(intensity) => update("minimal", { intensity })}
        hint="How far the piece rises in and floats."
      />
    </div>
  );
}

function RotatingControls({
  config,
  setConfig,
  update,
  nameOf,
  scene,
  setScene,
  editing,
  setEditing,
}: {
  config: HeroConceptsConfig;
  setConfig: (next: (current: HeroConceptsConfig) => HeroConceptsConfig) => void;
  update: Update;
  nameOf: (slug: string) => string;
  scene: number;
  setScene: (index: number) => void;
  editing: boolean;
  setEditing: (value: boolean) => void;
}) {
  const r = config.rotating;
  const pieces = r.scenes[scene]?.pieces ?? [];
  const setScenes = (scenes: HeroConceptsConfig["rotating"]["scenes"]) =>
    setConfig((current) => ({ ...current, rotating: { ...current.rotating, scenes } }));
  const setPiece = (index: number, patch: Partial<Placement>) =>
    setScenes(
      r.scenes.map((s, i) =>
        i === scene
          ? { pieces: s.pieces.map((p, j) => (j === index ? { ...p, ...patch } : p)) }
          : s
      )
    );

  return (
    <div className="flex flex-col gap-4">
      <Slider
        label="Each scene shows for"
        unit=" s"
        value={r.seconds}
        range={LIMITS.seconds}
        step={0.5}
        onChange={(seconds) => update("rotating", { seconds })}
        hint="5–7 seconds reads as calm."
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Movement</span>
        <select
          className="field rounded-lg border px-2 py-1.5"
          value={r.style}
          onChange={(event) => update("rotating", { style: event.target.value as typeof r.style })}
        >
          {ROTATING_STYLES.map((style) => (
            <option key={style} value={style}>
              {ROTATING_STYLE_LABELS[style]}
            </option>
          ))}
        </select>
      </label>
      <Slider
        label="Animation"
        unit="%"
        value={r.intensity}
        range={LIMITS.intensity}
        onChange={(intensity) => update("rotating", { intensity })}
        hint="How far pieces travel and turn as they come and go."
      />

      <div className="border-t border-neutral-200 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Scenes</span>
          <Toggle label="Hold the preview on this scene" checked={editing} onChange={setEditing} small />
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {r.scenes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setScene(i);
                setEditing(true);
              }}
              aria-pressed={i === scene}
              className={`rounded-md border px-2.5 py-1 text-sm ${
                i === scene ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          {r.scenes.length < LIMITS.scenes[1] && (
            <button
              type="button"
              onClick={() => {
                setScenes([...r.scenes, structuredClone(r.scenes[scene])]);
                setScene(r.scenes.length);
                setEditing(true);
              }}
              className="rounded-md border border-dashed border-neutral-400 px-2.5 py-1 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              + Scene
            </button>
          )}
        </div>
        {r.scenes.length > LIMITS.scenes[0] && (
          <button
            type="button"
            onClick={() => {
              setScenes(r.scenes.filter((_, i) => i !== scene));
              setScene(Math.max(0, scene - 1));
            }}
            className="mb-3 text-xs text-red-700 hover:underline"
          >
            Remove scene {scene + 1}
          </button>
        )}

        <div className="flex flex-col gap-3">
          {pieces.map((piece, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 p-3">
              <PiecePicker
                label={`Piece ${i + 1}`}
                value={piece.slug}
                onChange={(slug) => setPiece(i, { slug })}
                nameOf={nameOf}
                needs={280}
              />
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                <Slider compact label="Across" unit="%" value={piece.x} range={LIMITS.position} onChange={(x) => setPiece(i, { x })} />
                <Slider compact label="Down" unit="%" value={piece.y} range={LIMITS.position} onChange={(y) => setPiece(i, { y })} />
                <Slider compact label="Size" unit="%" value={piece.size} range={LIMITS.pieceSize} onChange={(size) => setPiece(i, { size })} />
                <Slider compact label="Tilt" unit="°" value={piece.rotate} range={LIMITS.rotate} onChange={(rotate) => setPiece(i, { rotate })} />
              </div>
              {pieces.length > LIMITS.piecesPerScene[0] && (
                <button
                  type="button"
                  onClick={() =>
                    setScenes(
                      r.scenes.map((s, k) => (k === scene ? { pieces: s.pieces.filter((_, j) => j !== i) } : s))
                    )
                  }
                  className="mt-2 text-xs text-red-700 hover:underline"
                >
                  Remove piece
                </button>
              )}
            </div>
          ))}
          {pieces.length < LIMITS.piecesPerScene[1] && (
            <button
              type="button"
              onClick={() =>
                setScenes(
                  r.scenes.map((s, k) =>
                    k === scene
                      ? { pieces: [...s.pieces, { slug: CUTOUTS[0].slug, x: 50, y: 50, size: 24, rotate: 0 }] }
                      : s
                  )
                )
              }
              className="rounded-lg border border-dashed border-neutral-400 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              + Add a piece to scene {scene + 1}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WallpaperControls({
  config,
  update,
  nameOf,
}: {
  config: HeroConceptsConfig;
  update: Update;
  nameOf: (slug: string) => string;
}) {
  const w = config.wallpaper;
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => update("wallpaper", { seed: Math.floor(Math.random() * 1_000_000_000) })}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
      >
        <Shuffle className="size-4" />
        Shuffle the arrangement
      </button>
      <Slider label="Pieces" value={w.density} range={LIMITS.density} onChange={(density) => update("wallpaper", { density })} hint="On a computer; phones show about 60% of them." />
      <Slider label="Size" unit="%" value={w.scale} range={LIMITS.scale} onChange={(scale) => update("wallpaper", { scale })} />
      <Slider label="Size contrast" unit="%" value={w.variation} range={LIMITS.variation} onChange={(variation) => update("wallpaper", { variation })} hint="0 makes every piece alike; 100 puts very large next to very small." />
      <Slider label="Tilt" unit="°" value={w.rotation} range={LIMITS.wallRotation} onChange={(rotation) => update("wallpaper", { rotation })} hint="The most a piece may lean either way." />
      <Slider label="Keep the text clear" unit="%" value={w.clearing} range={LIMITS.clearing} onChange={(clearing) => update("wallpaper", { clearing })} />
      <Slider label="Fade pieces behind the text" unit="%" value={w.dim} range={LIMITS.dim} onChange={(dim) => update("wallpaper", { dim })} />
      <Slider label="Move across" unit="%" value={w.shiftX} range={LIMITS.shift} onChange={(shiftX) => update("wallpaper", { shiftX })} />
      <Slider label="Move down" unit="%" value={w.shiftY} range={LIMITS.shift} onChange={(shiftY) => update("wallpaper", { shiftY })} />
      <Toggle label="Pieces appear one after another" checked={w.entrance} onChange={(entrance) => update("wallpaper", { entrance })} />
      <PieceSet value={w.slugs} onChange={(slugs) => update("wallpaper", { slugs })} nameOf={nameOf} />
    </div>
  );
}

// ---- Pickers ------------------------------------------------------------------------

function useFilteredCutouts() {
  const [kind, setKind] = useState<CutoutKind | "all">("all");
  const [query, setQuery] = useState("");
  return { kind, setKind, query, setQuery };
}

function CutoutFilters({
  kind,
  setKind,
  query,
  setQuery,
}: ReturnType<typeof useFilteredCutouts>) {
  const kinds = ["all", ...new Set(CUTOUTS.map((cutout) => cutout.kind))] as (CutoutKind | "all")[];
  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-full border px-2 py-0.5 text-xs ${
              kind === k ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>
      <label className="relative block">
        <span className="sr-only">Search pieces</span>
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
          className="field w-full rounded-lg border py-1 pl-7 pr-2 text-sm"
        />
      </label>
    </div>
  );
}

function matches(slug: string, kind: CutoutKind | "all", query: string, nameOf: (slug: string) => string) {
  const cutout = cutoutFor(slug)!;
  if (kind !== "all" && cutout.kind !== kind) return false;
  const q = query.trim().toLowerCase();
  return !q || nameOf(slug).toLowerCase().includes(q) || slug.includes(q);
}

function Thumb({ slug, size = 56 }: { slug: string; size?: number }) {
  const cutout = cutoutFor(slug);
  if (!cutout) return null;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-md bg-[var(--site-primary,#1d4e89)]"
      style={{ width: size, height: size }}
    >
      <Image
        src={cutout.src}
        alt=""
        width={cutout.width}
        height={cutout.height}
        sizes={`${size}px`}
        className="max-h-[85%] w-auto max-w-[85%] object-contain"
      />
    </span>
  );
}

/** One piece, with a browsable grid to change it. Pieces whose photo is too
 *  small to be drawn this large carry a warning. */
function PiecePicker({
  label,
  value,
  onChange,
  nameOf,
  needs,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
  nameOf: (slug: string) => string;
  /** Roughly how wide (CSS px) the piece is drawn, to flag soft photos. */
  needs: number;
}) {
  const [open, setOpen] = useState(false);
  const filters = useFilteredCutouts();
  const cutout = cutoutFor(value);
  const visible = CUTOUTS.filter((c) => matches(c.slug, filters.kind, filters.query, nameOf));
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <Thumb slug={value} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{nameOf(value)}</p>
          {cutout && !sharpAt(cutout, needs) && (
            <p className="text-xs text-amber-700">Small photo: may look soft this large.</p>
          )}
          {cutout && isQuiet(cutout) && (
            <p className="text-xs text-amber-700">Blue glass: quiet on the blue ground.</p>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="text-xs text-neutral-600 underline-offset-2 hover:underline"
          >
            {open ? "Close" : "Change piece"}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-2">
          <CutoutFilters {...filters} />
          <ul className="grid max-h-72 grid-cols-4 gap-1.5 overflow-y-auto">
            {visible.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.slug);
                    setOpen(false);
                  }}
                  title={nameOf(c.slug)}
                  aria-label={nameOf(c.slug)}
                  aria-pressed={c.slug === value}
                  className={`relative block rounded-md ring-offset-1 ${c.slug === value ? "ring-2 ring-neutral-900" : "hover:ring-2 hover:ring-neutral-300"}`}
                >
                  <Thumb slug={c.slug} size={64} />
                  {!sharpAt(c, needs) && (
                    <span className="absolute right-0.5 top-0.5 rounded bg-amber-100 px-1 text-[10px] text-amber-800">
                      small
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** The wallpaper's pieces: every cut-out, or a chosen set. */
function PieceSet({
  value,
  onChange,
  nameOf,
}: {
  value: string[];
  onChange: (slugs: string[]) => void;
  nameOf: (slug: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const filters = useFilteredCutouts();
  const standard = value.length === 0;
  const chosen = new Set(standard ? WALLPAPER_POOL : value);
  const visible = CUTOUTS.filter((c) => matches(c.slug, filters.kind, filters.query, nameOf));
  const toggle = (slug: string) => {
    const next = new Set(chosen);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(next.size ? [...next] : []);
  };
  return (
    <div className="border-t border-neutral-200 pt-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">Pieces used</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-xs text-neutral-600 hover:underline"
        >
          {open ? "Close" : "Choose"}
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        {standard
          ? `The ${WALLPAPER_POOL.length} sharpest pieces that stand out on the blue (small photos and blue glass left out)`
          : `${chosen.size} of ${CUTOUTS.length} pieces`}
      </p>
      {open && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-2">
          <CutoutFilters {...filters} />
          <div className="mb-2 flex gap-3 text-xs">
            <button type="button" className="hover:underline" onClick={() => onChange([])}>
              Standard set
            </button>
            <button
              type="button"
              className="hover:underline"
              onClick={() => onChange(CUTOUTS.map((c) => c.slug))}
            >
              Every piece
            </button>
            <button
              type="button"
              className="hover:underline"
              disabled={visible.length === 0}
              onClick={() => onChange(visible.map((c) => c.slug))}
            >
              Only those shown
            </button>
          </div>
          <ul className="grid max-h-72 grid-cols-4 gap-1.5 overflow-y-auto">
            {visible.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => toggle(c.slug)}
                  title={nameOf(c.slug)}
                  aria-label={nameOf(c.slug)}
                  aria-pressed={chosen.has(c.slug)}
                  className={`relative block rounded-md ${chosen.has(c.slug) ? "" : "opacity-35"}`}
                >
                  <Thumb slug={c.slug} size={64} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---- Small controls ------------------------------------------------------------------

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">{label}</span>
      <div className="flex rounded-lg border border-neutral-300 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 text-sm ${
              option.value === value ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm ${
        pressed ? "border-neutral-900 bg-neutral-100" : "border-neutral-300 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  unit = "",
  value,
  range,
  step = 1,
  onChange,
  hint,
  compact = false,
}: {
  label: string;
  unit?: string;
  value: number;
  range: readonly [number, number];
  step?: number;
  onChange: (value: number) => void;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={`flex items-baseline justify-between gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-neutral-500">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={range[0]}
        max={range[1]}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-neutral-900"
      />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  small = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  small?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 ${small ? "text-xs" : "text-sm"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-neutral-900"
      />
      <span className={small ? "text-neutral-600" : "font-medium"}>{label}</span>
    </label>
  );
}
