"use client";

import { createContext, useContext, useRef, useState, useTransition } from "react";
import { auditDesign } from "@/lib/design-audit";
import {
  MOTION_LABELS,
  parseBuilder,
  type BuilderBlock,
  type BuilderDoc,
} from "@/lib/section-builder";
import { type BlockPos } from "@/lib/section-builder-editing";
import {
  TRANSLATABLE,
  TRANSLATABLE_LABELS,
  fromMap,
  hasTokens,
  resolveTokens,
  type BlockTranslations,
} from "@/lib/builder-i18n";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import { LOCALE_NAMES } from "@/lib/i18n/locale-names";
import type { BlockPreset } from "@/lib/block-presets";
import type { SectionVersion } from "@/lib/section-versions";

/* Small panels around the visual editor: saved block looks, the animation
   timeline, design checks, export / import and earlier saved versions. */

// ---- Saved looks for blocks ----------------------------------------------------

type PresetsValue = {
  presets: BlockPreset[];
  save: (name: string, lookJson: string) => Promise<string | undefined>;
  remove: (name: string) => Promise<void>;
};
const PresetsContext = createContext<PresetsValue | null>(null);
export const PresetsProvider = PresetsContext.Provider;
export const useBlockPresets = () => useContext(PresetsContext);

// ---- Animation timeline -------------------------------------------------------------

const DURATION = { fast: 400, normal: 800, slow: 1400 } as const;

/** When each animated block plays, as the visitor sees it: blocks that arrive
 *  together go in their order, one step apart. */
export function MotionTimeline({
  doc,
  onSelect,
}: {
  doc: BuilderDoc;
  onSelect: (pos: BlockPos) => void;
}) {
  const step = doc.stagger ?? 150;
  const items = doc.cells
    .flatMap((cell, col) =>
      cell.map((block, idx) => ({ block, pos: { col, idx }, order: col * 25 + idx }))
    )
    .filter((i) => i.block.motion);
  if (items.length === 0) return null;
  const sorted = [...items].sort(
    (a, b) =>
      (a.block.motion!.order ?? 100 + a.order) - (b.block.motion!.order ?? 100 + b.order) ||
      a.order - b.order
  );
  const rows = sorted.map((item, rank) => {
    const m = item.block.motion!;
    const scrub = m.mode === "scrub";
    const start = scrub ? 0 : (m.delay ?? 0) + rank * step;
    const length = scrub ? 0 : DURATION[m.speed ?? "normal"];
    return { ...item, m, scrub, start, length };
  });
  const end = Math.max(1000, ...rows.map((r) => r.start + r.length));
  return (
    <details className="border-foreground/15 rounded-lg border bg-white p-3 text-xs" open>
      <summary className="cursor-pointer font-semibold text-neutral-700">
        Animation timeline ({rows.length})
      </summary>
      <p className="mt-1 text-neutral-500">
        When blocks that come into view together play. Click a bar to select the block. Change the
        order, wait and speed in the block&apos;s Scroll animation box.
      </p>
      <ol className="mt-2 flex flex-col gap-1">
        {rows.map((r) => (
          <li key={`${r.pos.col}:${r.pos.idx}`} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(r.pos)}
              className="w-40 shrink-0 truncate text-left underline-offset-2 hover:underline"
              title={`${r.block.type}: ${MOTION_LABELS[r.m.type]}`}
            >
              {r.block.type} · {MOTION_LABELS[r.m.type]}
            </button>
            <span className="relative h-4 flex-1 rounded bg-neutral-100">
              {r.scrub ? (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-500">
                  follows the scroll
                </span>
              ) : (
                <span
                  className="absolute top-0 h-4 rounded bg-indigo-500/80"
                  style={{
                    left: `${(r.start / end) * 100}%`,
                    width: `${Math.max(2, (r.length / end) * 100)}%`,
                  }}
                />
              )}
            </span>
            <span className="w-24 shrink-0 text-right text-neutral-500 tabular-nums">
              {r.scrub ? "" : `${(r.start / 1000).toFixed(2)}s`}
              {r.m.mode === "toggle" ? " ↻" : ""}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

// ---- Design checks --------------------------------------------------------------------

export function DesignChecks({
  doc,
  colors,
  onSelect,
}: {
  doc: BuilderDoc;
  colors: { pageBg?: string; text?: string; sectionBg?: string; sectionText?: string };
  onSelect: (pos: BlockPos) => void;
}) {
  const issues = auditDesign(doc, colors);
  const warn = issues.filter((i) => i.level === "warn").length;
  return (
    <details className="border-foreground/15 rounded-lg border bg-white p-3 text-xs">
      <summary className="cursor-pointer font-semibold text-neutral-700">
        Design checks{" "}
        <span className={warn ? "text-amber-700" : "text-emerald-700"}>
          {issues.length === 0 ? "· all good" : `· ${warn} to fix, ${issues.length - warn} tips`}
        </span>
      </summary>
      {issues.length === 0 ? (
        <p className="mt-2 text-neutral-500">
          No accessibility or speed problems found in this design.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  issue.level === "warn"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {issue.area === "accessibility" ? "Access" : "Speed"}
              </span>
              <span className="min-w-0 flex-1">{issue.message}</span>
              {issue.pos && (
                <button
                  type="button"
                  onClick={() => onSelect(issue.pos!)}
                  className="shrink-0 underline"
                >
                  Show
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

// ---- Export / import ----------------------------------------------------------------------

export function DesignIO({
  doc,
  name,
  onImport,
}: {
  doc: BuilderDoc;
  name: string;
  onImport: (doc: BuilderDoc) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const exportFile = () => {
    const blob = new Blob([JSON.stringify({ perlaDesign: 1, builder: doc }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[^\w-]+/g, "-").toLowerCase() || "section"}.design.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importFile = async (file: File) => {
    try {
      if (file.size > 600_000) throw new Error("big");
      const json = JSON.parse(await file.text());
      const parsed = parseBuilder(json?.builder ?? json);
      if (!parsed) throw new Error("bad");
      onImport(parsed);
      setMessage("Imported. Check the preview, then save.");
    } catch {
      setMessage("That file is not a design exported from this editor.");
    }
  };
  return (
    <span className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={exportFile}
        className="rounded border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
      >
        Export design (.json)
      </button>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="rounded border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
      >
        Import design…
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = "";
        }}
      />
      {message && <span className="text-neutral-600">{message}</span>}
    </span>
  );
}

// ---- Earlier saved versions ---------------------------------------------------------------

export function VersionsPanel({
  load,
  onRestore,
}: {
  load: () => Promise<SectionVersion[]>;
  onRestore: (version: SectionVersion) => void;
}) {
  const [versions, setVersions] = useState<SectionVersion[] | null>(null);
  const [pending, start] = useTransition();
  return (
    <details
      className="border-foreground/15 rounded-lg border bg-white p-3 text-xs"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && versions === null)
          start(async () => setVersions(await load()));
      }}
    >
      <summary className="cursor-pointer font-semibold text-neutral-700">
        Earlier saved versions
      </summary>
      {pending && <p className="mt-2 text-neutral-500">Loading…</p>}
      {versions && versions.length === 0 && (
        <p className="mt-2 text-neutral-500">
          No earlier versions yet. Each time you save, the version it replaces is kept here.
        </p>
      )}
      {versions && versions.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {versions.map((v) => (
            <li key={v.at} className="flex items-center gap-3">
              <span className="tabular-nums">{new Date(v.at).toLocaleString()}</span>
              <button
                type="button"
                onClick={() => onRestore(v)}
                className="rounded border border-neutral-300 bg-white px-2 py-0.5 hover:bg-neutral-100"
              >
                Load into the editor
              </button>
            </li>
          ))}
        </ul>
      )}
      {versions && versions.length > 0 && (
        <p className="mt-2 text-neutral-500">
          Loading a version only changes the editor; nothing changes on the site until you save.
        </p>
      )}
    </details>
  );
}

// ---- Languages -------------------------------------------------------------------------

/** The site's text in the preview language, for showing what {{…}} stands for. */
const SiteTextContext = createContext<Record<string, string>>({});
export const SiteTextProvider = SiteTextContext.Provider;
export const useSiteText = () => useContext(SiteTextContext);

/**
 * A block's wording per language. The main text is used for every language
 * that has none of its own; text in {{…}} is the site's own text, which is
 * already translated.
 */
export function BlockLanguages({
  block,
  onChange,
}: {
  block: BuilderBlock;
  onChange: (tr: BlockTranslations | undefined) => void;
}) {
  const fields = TRANSLATABLE[block.type];
  const siteText = useSiteText();
  const [lang, setLang] = useState<Locale>("it");
  if (!fields) return null;
  const main = block as unknown as Record<string, unknown>;
  const own = block.tr ?? {};
  const count = Object.keys(own).length;
  const usesSiteText = fields.some(
    (f) => typeof main[f] === "string" && hasTokens(main[f] as string)
  );
  const set = (field: string, value: string) => {
    const next: BlockTranslations = { ...own };
    const entry = { ...(next[lang] ?? {}) };
    if (value) entry[field] = value;
    else delete entry[field];
    if (Object.keys(entry).length) next[lang] = entry;
    else delete next[lang];
    onChange(Object.keys(next).length ? next : undefined);
  };
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-medium text-neutral-600">
        Languages
        {usesSiteText && (
          <span className="ml-1 text-emerald-700">· uses your site&apos;s text</span>
        )}
        {count > 0 && <span className="text-accent ml-1">· own text in {count}</span>}
      </summary>
      <div className="mt-2 flex flex-col gap-2">
        {usesSiteText && (
          <p className="rounded bg-emerald-50 px-2 py-1 text-[11px] text-emerald-900">
            Text written as {"{{…}}"} is your site&apos;s own wording (Settings → Page text), so it
            already changes with the visitor&apos;s language. Type over it to use your own words,
            and add them per language here.
          </p>
        )}
        <label className="flex items-center gap-2">
          Wording for
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Locale)}
            className="field w-auto text-xs"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
                {own[l] ? " ●" : ""}
              </option>
            ))}
          </select>
        </label>
        {fields.map((field) => {
          const base = typeof main[field] === "string" ? (main[field] as string) : "";
          const shown = resolveTokens(base, fromMap(siteText));
          return (
            <label key={field} className="flex flex-col gap-1 text-neutral-600">
              {TRANSLATABLE_LABELS[field] ?? field}
              <input
                value={own[lang]?.[field] ?? ""}
                onChange={(e) => set(field, e.target.value)}
                placeholder={shown ? `Same as main: ${shown.slice(0, 80)}` : "Empty"}
                className="field"
              />
            </label>
          );
        })}
      </div>
    </details>
  );
}
