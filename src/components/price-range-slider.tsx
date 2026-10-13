"use client";

import { useEffect, useRef, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { formatMoney } from "@/lib/format";

export function PriceRangeSlider({
  min,
  max,
  defaultMin,
  defaultMax,
  currency,
  locale,
  separatorLabel,
  minLabel,
  maxLabel,
  prices,
  rangeLabels,
}: {
  min: number;
  max: number;
  defaultMin?: number;
  defaultMax?: number;
  currency: string;
  locale: string;
  separatorLabel: string;
  minLabel: string;
  maxLabel: string;
  prices?: number[];
  rangeLabels?: { one: string; many: string };
}) {
  // Bounds can legitimately collapse to a single price point (e.g. one
  // product, or a store with a uniform price) — pad so the track still has
  // a usable range instead of a zero-width slider.
  const hasRange = max > min;
  const sliderMin = hasRange ? min : Math.max(0, min - 1);
  const sliderMax = hasRange ? max : max + 1;
  const step = Math.max(1, Math.round((sliderMax - sliderMin) / 100));

  const initial = (): [number, number] => [
    Math.max(sliderMin, Math.min(defaultMin ?? sliderMin, sliderMax)),
    Math.min(sliderMax, Math.max(defaultMax ?? sliderMax, sliderMin)),
  ];
  const [value, setValue] = useState<[number, number]>(initial);
  // A new range from the page (a filter removed above the grid, "clear
  // filters", back/forward) moves the handles to it.
  const fromPage = `${defaultMin}|${defaultMax}|${sliderMin}|${sliderMax}`;
  const [shown, setShown] = useState(fromPage);
  if (shown !== fromPage) {
    setShown(fromPage);
    setValue(initial());
  }

  // Letting go of a handle applies the range (components/filter-form.tsx),
  // once the hidden fields below hold it; arrow keys settle first.
  const root = useRef<HTMLDivElement>(null);
  const [commits, setCommits] = useState(0);
  useEffect(() => {
    if (!commits) return;
    const timer = window.setTimeout(() => root.current?.closest("form")?.requestSubmit(), 250);
    return () => window.clearTimeout(timer);
  }, [commits]);

  /* Equal price bands retain the real counts. Occupied bars have a small
     visual floor so a rare price group is distinct from an empty band;
     hover labels give the exact count rather than implying a height axis. */
  const span = sliderMax - sliderMin;
  // Keep very narrow ranges from creating bands with no representable cent.
  const BANDS = Math.min(16, Math.max(1, Math.round(span * 100) + 1));
  const counts = new Array<number>(BANDS).fill(0);
  for (const price of prices ?? []) {
    const band = Math.min(BANDS - 1, Math.max(0, Math.floor(((price - sliderMin) / span) * BANDS)));
    counts[band] += 1;
  }
  const tallest = Math.max(1, ...counts);
  const inRange = (prices ?? []).filter((p) => p >= value[0] - 0.005 && p <= value[1] + 0.005).length;

  return (
    <div ref={root} className="pf-price">
      <div className="pf-price-values">
        <span>{formatMoney(Math.round(value[0] * 100), currency, locale)}</span>
        <span className="pf-price-sep">{separatorLabel}</span>
        <span>{formatMoney(Math.round(value[1] * 100), currency, locale)}</span>
      </div>
      {prices && prices.length > 0 && (
        <div className="pf-chart" aria-hidden="true">
          {counts.map((count, band) => {
            const from = sliderMin + (band / BANDS) * span;
            const to = sliderMin + ((band + 1) / BANDS) * span;
            const on = count > 0 && to >= value[0] && from <= value[1];
            const countLabel = count === 1
              ? rangeLabels?.one ?? "1"
              : (rangeLabels?.many ?? "{n}").replace("{n}", String(count));
            const fromCents = Math.ceil(from * 100 - 0.000001);
            const toCents = band === BANDS - 1
              ? Math.round(to * 100)
              : Math.ceil(to * 100 - 0.000001) - 1;
            return (
              <span
                key={band}
                className="pf-chart-bar"
                data-on={on}
                data-empty={count === 0}
                title={`${formatMoney(fromCents, currency, locale)} – ${formatMoney(toCents, currency, locale)} · ${countLabel}`}
                style={
                  {
                    "--h": count === 0 ? 0 : 0.2 + 0.8 * (count / tallest),
                    "--i": band,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}

      <Slider.Root
        className="pf-slider"
        min={sliderMin}
        max={sliderMax}
        step={step}
        minStepsBetweenThumbs={0}
        value={value}
        onValueChange={(next) => setValue([next[0], next[1]])}
        onValueCommit={() => setCommits((n) => n + 1)}
      >
        <Slider.Track className="pf-slider-track">
          <Slider.Range className="pf-slider-range" />
        </Slider.Track>
        <Slider.Thumb aria-label={minLabel} className="pf-slider-thumb" />
        <Slider.Thumb aria-label={maxLabel} className="pf-slider-thumb" />
      </Slider.Root>

      {prices && rangeLabels && (
        <p className="pf-range-count" aria-live="polite">
          {inRange === 1 ? rangeLabels.one : rangeLabels.many.replace("{n}", String(inRange))}
        </p>
      )}

      {/* A handle at its end of the track is no limit at all, so it sends
          nothing (and lights no "active filter"). */}
      {value[0] > sliderMin && <input type="hidden" name="minPrice" value={value[0]} />}
      {value[1] < sliderMax && <input type="hidden" name="maxPrice" value={value[1]} />}
    </div>
  );
}
