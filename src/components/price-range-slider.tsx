"use client";

import { useState } from "react";
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
}) {
  // Bounds can legitimately collapse to a single price point (e.g. one
  // product, or a store with a uniform price) — pad so the track still has
  // a usable range instead of a zero-width slider.
  const hasRange = max > min;
  const sliderMin = hasRange ? min : Math.max(0, min - 1);
  const sliderMax = hasRange ? max : max + 1;
  const step = Math.max(1, Math.round((sliderMax - sliderMin) / 100));

  const [value, setValue] = useState<[number, number]>([
    Math.max(sliderMin, Math.min(defaultMin ?? sliderMin, sliderMax)),
    Math.min(sliderMax, Math.max(defaultMax ?? sliderMax, sliderMin)),
  ]);

  return (
    <div className="pf-price">
      <div className="pf-price-values">
        <span>{formatMoney(Math.round(value[0] * 100), currency, locale)}</span>
        <span className="pf-price-sep">{separatorLabel}</span>
        <span>{formatMoney(Math.round(value[1] * 100), currency, locale)}</span>
      </div>

      <Slider.Root
        className="pf-slider"
        min={sliderMin}
        max={sliderMax}
        step={step}
        minStepsBetweenThumbs={0}
        value={value}
        onValueChange={(next) => setValue([next[0], next[1]])}
      >
        <Slider.Track className="pf-slider-track">
          <Slider.Range className="pf-slider-range" />
        </Slider.Track>
        <Slider.Thumb aria-label={minLabel} className="pf-slider-thumb" />
        <Slider.Thumb aria-label={maxLabel} className="pf-slider-thumb" />
      </Slider.Root>

      <input type="hidden" name="minPrice" value={value[0]} />
      <input type="hidden" name="maxPrice" value={value[1]} />
    </div>
  );
}
