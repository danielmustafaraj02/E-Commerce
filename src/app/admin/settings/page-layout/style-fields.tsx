"use client";

import { BackgroundFields } from "./background-fields";
import { ColorField } from "@/components/color-field";
import { MAX_SECTION_CSS } from "@/lib/custom-section";
import type { SectionStyle } from "@/lib/page-layout";

/** Appearance options shared by every section: colours, spacing, alignment,
 *  width, background image, lines, hide-on-device, and scoped CSS. */
export function StyleFields({
  style,
  onChange,
}: {
  style: SectionStyle | undefined;
  onChange: (style: SectionStyle | undefined) => void;
}) {
  const set = (patch: Partial<SectionStyle>) => {
    const next = { ...style, ...patch };
    onChange(Object.values(next).some((v) => v !== undefined && v !== "") ? next : undefined);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-4">
        <BackgroundFields style={style} onChange={onChange} />
      </div>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Hide on
        <select
          value={style?.hideOn ?? ""}
          onChange={(e) => set({ hideOn: (e.target.value || undefined) as SectionStyle["hideOn"] })}
          className="field"
        >
          <option value="">Nothing (show everywhere)</option>
          <option value="mobile">Phones</option>
          <option value="desktop">Computers</option>
        </select>
      </label>

      <div className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
        Text colour
        <ColorField
          value={style?.color}
          label="Text colour"
          fallback="#111111"
          onChange={(v) => set({ color: v })}
        />
        <input
          value={style?.color ?? ""}
          onChange={(e) => set({ color: e.target.value || undefined })}
          placeholder="default"
          className="field font-mono text-xs"
          aria-label="Text colour (any CSS colour)"
        />
      </div>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Text alignment
        <select
          value={style?.align ?? ""}
          onChange={(e) => set({ align: (e.target.value || undefined) as SectionStyle["align"] })}
          className="field"
        >
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Centre</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Max width (rem, 20–100)
        <input
          type="number"
          min={20}
          max={100}
          step={1}
          value={style?.maxWidth ?? ""}
          onChange={(e) =>
            set({ maxWidth: e.target.value === "" ? undefined : Number(e.target.value) })
          }
          placeholder="full width"
          className="field"
        />
      </label>
      <div className="flex gap-4 text-xs text-neutral-600 sm:col-span-2">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={style?.borderTop ?? false}
            onChange={(e) => set({ borderTop: e.target.checked || undefined })}
          />
          Line above
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={style?.borderBottom ?? false}
            onChange={(e) => set({ borderBottom: e.target.checked || undefined })}
          />
          Line below
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
        Height:{" "}
        {style?.minHeight ? `at least ${style.minHeight}% of the screen` : "as tall as its content"}
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={style?.minHeight ?? 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            set({ minHeight: n >= 30 ? n : undefined });
          }}
        />
      </label>
      <fieldset className="border-foreground/10 rounded-lg border p-3 sm:col-span-4">
        <legend className="px-1 text-xs font-semibold text-neutral-700">
          Rich background (gradient, parallax, video, overlay)
        </legend>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1 text-xs text-neutral-600">
            Gradient from
            <ColorField
              value={style?.gradFrom}
              label="Gradient start colour"
              fallback="#ffffff"
              onChange={(v) => set({ gradFrom: v })}
            />
          </div>
          <div className="flex flex-col gap-1 text-xs text-neutral-600">
            Gradient to
            <ColorField
              value={style?.gradTo}
              label="Gradient end colour"
              fallback="#dddddd"
              onChange={(v) => set({ gradTo: v })}
            />
          </div>
          <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
            Gradient angle: {style?.gradAngle ?? 135}°
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={style?.gradAngle ?? 135}
              onChange={(e) => set({ gradAngle: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-neutral-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={style?.parallax ?? false}
              onChange={(e) => set({ parallax: e.target.checked || undefined })}
            />
            Parallax: the background image stays still while the page scrolls (needs a background
            image above)
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
            Background video (.mp4 or .webm)
            <input
              value={style?.bgVideo ?? ""}
              onChange={(e) => set({ bgVideo: e.target.value || undefined })}
              placeholder="/hero/film.mp4 or an uploaded https:// link"
              className="field font-mono text-xs"
            />
            <span className="text-neutral-500">
              Plays muted and looping behind the content. Use a file from the site or an upload;
              other hosts are blocked by the site&apos;s security policy.
            </span>
          </label>
          <div className="flex flex-col gap-1 text-xs text-neutral-600">
            Overlay colour
            <ColorField
              value={style?.overlayColor}
              label="Overlay colour"
              fallback="#000000"
              onChange={(v) => set({ overlayColor: v })}
            />
          </div>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Overlay strength: {style?.overlayStrength ?? 40}%
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              disabled={!style?.overlayColor}
              value={style?.overlayStrength ?? 40}
              onChange={(e) => set({ overlayStrength: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Overlay covers
            <select
              value={style?.overlayFade ?? ""}
              disabled={!style?.overlayColor}
              onChange={(e) =>
                set({ overlayFade: (e.target.value || undefined) as SectionStyle["overlayFade"] })
              }
              className="field"
            >
              <option value="">Everything evenly</option>
              <option value="left">Left side, fading out (text on the left)</option>
              <option value="right">Right side, fading out</option>
              <option value="bottom">Bottom, fading up</option>
              <option value="top">Top, fading down</option>
            </select>
          </label>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Entrance animation
        <select
          value={style?.anim ?? ""}
          onChange={(e) => set({ anim: (e.target.value || undefined) as SectionStyle["anim"] })}
          className="field"
        >
          <option value="">None</option>
          <option value="fade">Fade in</option>
          <option value="fade-up">Fade up</option>
          <option value="fade-down">Fade down</option>
          <option value="slide-left">Slide from the left</option>
          <option value="slide-right">Slide from the right</option>
          <option value="zoom">Zoom in</option>
          <option value="shrink">Shrink into place</option>
          <option value="blur">Focus (unblur)</option>
          <option value="wipe">Wipe open</option>
          <option value="rotate">Turn in</option>
          <option value="skew-rise">Rise with a skew</option>
          <option value="flip">Flip up</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Animation speed
        <select
          value={style?.animSpeed ?? ""}
          disabled={!style?.anim}
          onChange={(e) =>
            set({ animSpeed: (e.target.value || undefined) as SectionStyle["animSpeed"] })
          }
          className="field disabled:opacity-50"
        >
          <option value="">Normal</option>
          <option value="fast">Fast</option>
          <option value="slow">Slow</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Animation delay (ms)
        <input
          type="number"
          min={0}
          max={2000}
          step={100}
          disabled={!style?.anim}
          value={style?.animDelay ?? ""}
          onChange={(e) =>
            set({ animDelay: e.target.value === "" ? undefined : Number(e.target.value) })
          }
          placeholder="0"
          className="field disabled:opacity-50"
        />
      </label>
      <p className="self-end text-xs text-neutral-500">
        Plays once when the section scrolls into view (not in the preview).
      </p>

      <details className="sm:col-span-4">
        <summary className="cursor-pointer text-xs font-medium text-neutral-700">
          Advanced: your own CSS for this section
        </summary>
        <textarea
          rows={6}
          spellCheck={false}
          maxLength={MAX_SECTION_CSS}
          value={style?.css ?? ""}
          onChange={(e) => set({ css: e.target.value || undefined })}
          placeholder={".shelf-heading { font-size: 3rem; }\n.shelf-row { gap: 2rem; }"}
          className="field mt-2 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Applies only inside this section. Useful targets: <code>.shelf-heading</code>,{" "}
          <code>.shelf-heading-intro</code>, <code>.shelf-row</code>, <code>.shelf-button</code>,{" "}
          <code>h2</code>, <code>p</code>, <code>img</code>, <code>a</code>.
        </p>
      </details>
    </div>
  );
}
