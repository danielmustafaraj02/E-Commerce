"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * A colour control that offers the site's own colour palette first, so a block
 * or section can be coloured from the palette in one click, with a free colour
 * picker as the second choice. Values are stored as hex.
 */

/** `hex` is what the swatch shows; `value`, when set, is what is stored: a
 *  reference to the site's palette, so the design follows Site style. */
export type Swatch = { name: string; hex: string; value?: string };

const FALLBACK: Swatch[] = [
  { name: "Background", hex: "#ffffff" },
  { name: "Surface", hex: "#e6e2da" },
  { name: "Text", hex: "#154230" },
  { name: "Secondary text", hex: "#658276" },
  { name: "Primary", hex: "#154230" },
  { name: "Text on primary", hex: "#e6e2da" },
  { name: "Accent", hex: "#a6824a" },
  { name: "Border", hex: "#ecebe6" },
];

const PaletteContext = createContext<Swatch[]>(FALLBACK);

/** Supplies the store's current colours to every ColorField below it. */
export function SitePaletteProvider({
  swatches,
  children,
}: {
  swatches: Swatch[];
  children: ReactNode;
}) {
  return <PaletteContext.Provider value={swatches}>{children}</PaletteContext.Provider>;
}

/** The store's palette, for code that needs the colours themselves. */
export const useSitePalette = () => useContext(PaletteContext);

const HEX6 = /^#[0-9a-f]{6}$/i;
const norm = (hex?: string) => (hex ?? "").trim().toLowerCase();

export function ColorField({
  value,
  onChange,
  label,
  clearLabel = "Clear",
  fallback = "#888888",
  className = "",
  siteColors = true,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label: string;
  clearLabel?: string;
  /** Shown in the free picker while nothing is chosen. */
  fallback?: string;
  className?: string;
  /** Store palette swatches as references that follow Site style (default),
   *  or as fixed hex colours (for fields that only take hex). */
  siteColors?: boolean;
}) {
  const palette = useContext(PaletteContext);
  const extras: Swatch[] = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#000000" },
  ];
  const seen = new Set<string>();
  const swatches = [...palette, ...extras]
    .map((s) => ({ ...s, store: siteColors && s.value ? s.value : s.hex }))
    .filter((s) => {
      const key = norm(s.store);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const current = norm(value);
  const isCustom = !!current && !seen.has(current);
  const pickerValue = HEX6.test(current)
    ? current
    : (swatches.find((s) => norm(s.store) === current)?.hex ?? fallback);

  return (
    <span
      className={`flex flex-wrap items-center gap-1 ${className}`}
      role="group"
      aria-label={label}
    >
      {swatches.map((s) => (
        <button
          key={s.store}
          type="button"
          title={s.value && siteColors ? `${s.name} (follows your site style)` : `${s.name} ${s.hex}`}
          aria-label={`${label}: ${s.name}`}
          aria-pressed={current === norm(s.store)}
          onClick={() => onChange(s.store)}
          style={{ background: s.hex }}
          className={`h-6 w-6 rounded-full border border-neutral-400/70 ${
            current === norm(s.store) ? "ring-2 ring-indigo-500 ring-offset-1" : ""
          }`}
        />
      ))}
      <label
        title="Any other colour"
        className={`relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-400/70 text-[11px] ${
          isCustom ? "ring-2 ring-indigo-500 ring-offset-1" : ""
        }`}
        style={{
          background: isCustom
            ? current
            : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
        }}
      >
        <span className="sr-only">{label}: other colour</span>
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      {value !== undefined && value !== "" && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="ml-1 text-xs text-neutral-600 underline"
        >
          {clearLabel}
        </button>
      )}
    </span>
  );
}
