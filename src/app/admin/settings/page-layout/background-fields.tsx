"use client";

import { ColorField } from "@/components/color-field";
import type { SectionStyle } from "@/lib/page-layout";
import { ImagePick } from "./image-pick";

export function BackgroundFields({
  style,
  onChange,
}: {
  style?: SectionStyle;
  onChange: (style: SectionStyle | undefined) => void;
}) {
  const set = (patch: Partial<SectionStyle>) => {
    const next = { ...style, ...patch };
    onChange(Object.values(next).some((v) => v !== undefined && v !== "") ? next : undefined);
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 text-xs text-neutral-600">
        <span>Section background color</span>
        <ColorField
          label="Section background color"
          value={style?.bg}
          fallback="#ffffff"
          onChange={(bg) => set({ bg, gradFrom: undefined, gradTo: undefined })}
        />
        <div className="flex flex-wrap gap-2">
          {["#ffffff", "#e7e4dc", "#154230", "#111111", "transparent"].map((bg) => (
            <button
              type="button"
              key={bg}
              aria-label={`Set background to ${bg}`}
              aria-pressed={style?.bg === bg}
              onClick={() => set({ bg, gradFrom: undefined, gradTo: undefined })}
              className="h-8 w-8 rounded border border-neutral-300"
              style={{ background: bg }}
            />
          ))}
        </div>
        <button
          type="button"
          className="self-start text-xs underline"
          onClick={() => set({ bg: undefined, gradFrom: undefined, gradTo: undefined })}
        >
          Use default color
        </button>
      </div>
      <div className="flex flex-col gap-2 text-xs text-neutral-600">
        <span>Background image</span>
        <ImagePick
          src={style?.bgImage ?? ""}
          onChange={(bgImage) => set({ bgImage: bgImage || undefined })}
        />
        {style?.bgImage && (
          <button
            type="button"
            className="self-start text-xs underline"
            onClick={() => set({ bgImage: undefined })}
          >
            Remove background image
          </button>
        )}
      </div>
      {style?.bgImage && (
        <>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Image fit
            <select
              className="field"
              value={style.bgFit ?? "cover"}
              onChange={(e) => set({ bgFit: e.target.value as SectionStyle["bgFit"] })}
            >
              <option value="cover">Fill section (cover)</option>
              <option value="contain">Show entire image (contain)</option>
              <option value="custom">Custom size</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Repeat image
            <select
              className="field"
              value={style.bgRepeat ?? "no-repeat"}
              onChange={(e) => set({ bgRepeat: e.target.value as SectionStyle["bgRepeat"] })}
            >
              <option value="no-repeat">No repeat</option>
              <option value="repeat">Tile</option>
              <option value="repeat-x">Repeat horizontally</option>
              <option value="repeat-y">Repeat vertically</option>
            </select>
          </label>
          <fieldset className="rounded border p-3">
            <legend className="px-1 text-xs">Image position</legend>
            <div className="grid w-fit grid-cols-3 gap-1">
              {[0, 50, 100].flatMap((y) =>
                [0, 50, 100].map((x) => (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    aria-label={`${y === 0 ? "Top" : y === 50 ? "Center" : "Bottom"} ${x === 0 ? "left" : x === 50 ? "center" : "right"}`}
                    aria-pressed={
                      (style.bgPositionX ?? 50) === x && (style.bgPositionY ?? 50) === y
                    }
                    onClick={() => set({ bgPositionX: x, bgPositionY: y })}
                    className={`h-8 w-8 rounded border text-xs ${(style.bgPositionX ?? 50) === x && (style.bgPositionY ?? 50) === y ? "bg-primary text-white" : "bg-white"}`}
                  >
                    ●
                  </button>
                ))
              )}
            </div>
          </fieldset>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs">
              Horizontal position: {style.bgPositionX ?? 50}%
              <input
                type="range"
                min={0}
                max={100}
                value={style.bgPositionX ?? 50}
                onChange={(e) => set({ bgPositionX: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Vertical position: {style.bgPositionY ?? 50}%
              <input
                type="range"
                min={0}
                max={100}
                value={style.bgPositionY ?? 50}
                onChange={(e) => set({ bgPositionY: Number(e.target.value) })}
              />
            </label>
            {style.bgFit === "custom" && (
              <label className="flex flex-col gap-1 text-xs">
                Image size: {style.bgScale ?? 100}%
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={style.bgScale ?? 100}
                  onChange={(e) => set({ bgScale: Number(e.target.value) })}
                />
              </label>
            )}
          </div>
        </>
      )}
      {(
        [
          ["padTop", "Space above"],
          ["padBottom", "Space below"],
          ["padInline", "Side spacing"],
          ["radius", "Rounded corners"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1 text-xs text-neutral-600">
          {label}: {style?.[key] === undefined ? "default" : `${style[key]} rem`}
          <input
            type="range"
            min={0}
            max={8}
            step={0.25}
            value={style?.[key] ?? 0}
            onChange={(e) => set({ [key]: Number(e.target.value) })}
          />
          <button
            type="button"
            className="self-start underline"
            onClick={() => set({ [key]: undefined })}
          >
            Reset
          </button>
        </label>
      ))}
      <p className="text-xs text-neutral-500 sm:col-span-2">
        Changes update the preview. Save the section to apply them to the page.
      </p>
    </div>
  );
}
