"use client";

import { useState } from "react";
import {
  EFFECTS,
  MOTION_LABELS,
  MOTION_TYPES,
  type BlockStyle,
  type Effect,
  type Ease,
  type IdleType,
  type Motion,
  type MotionType,
  EASES,
  EASE_LABELS,
  IDLE_LABELS,
  IDLE_TYPES,
  type BuilderBlock,
} from "@/lib/section-builder";
import { copyLook } from "@/lib/section-builder-editing";
import { ImagePick } from "./image-pick";
import { ColorField, useSitePalette } from "@/components/color-field";
import { contrastRatio } from "@/lib/site-style";
import { useBlockPresets } from "./builder-extras";
import { getCopiedLook, hasCopiedLook, setCopiedLook } from "./canvas-interactions";

/** The appearance controls of the selected block: colours, type, spacing,
 *  shadow, motion and effects, plus saved looks. */
export function BlockLook({
  block,
  onChange,
}: {
  block: BuilderBlock;
  onChange: (patch: Partial<BuilderBlock>) => void;
}) {
  const { style, effect, hide, motion } = block;
  const presets = useBlockPresets();
  const palette = useSitePalette();
  const [clip, setClip] = useState(0);
  const [note, setNote] = useState("");
  // Text colour against the block's own background, or the page's.
  const contrast = (() => {
    const fg = /^#[0-9a-f]{3,6}$/i.test(style?.color ?? "") ? style?.color : undefined;
    const bg = /^#[0-9a-f]{3,6}$/i.test(style?.bg ?? "") ? style?.bg : undefined;
    if (!fg && !bg) return null;
    const ratio = contrastRatio(
      fg ?? palette[2]?.hex ?? "#154230",
      bg ?? palette[0]?.hex ?? "#ffffff"
    );
    return ratio !== null && ratio < 4.5 ? ratio : null;
  })();
  const setMotion = (patch: Partial<Motion>) => {
    const next: Record<string, unknown> = { ...motion, ...patch };
    for (const key of Object.keys(next)) if (next[key] === undefined) delete next[key];
    onChange({ motion: next.type ? (next as Motion) : undefined });
  };
  const setStyle = (patch: Partial<BlockStyle>) => {
    const next = { ...style, ...patch };
    onChange({
      style: Object.values(next).some((v) => v !== undefined && v !== "") ? next : undefined,
    });
  };
  const color = (value: string | undefined, key: "color" | "bg", label: string) => (
    <div className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-3">
      {label}
      <ColorField
        value={value}
        label={label}
        fallback={key === "bg" ? "#ffffff" : "#111111"}
        onChange={(v) => setStyle({ [key]: v })}
      />
    </div>
  );
  const active =
    !!style || !!effect || !!hide || !!motion || !!block.idle || !!block.parallax || !!block.sticky;
  const numField = (
    label: string,
    value: number | undefined,
    set: (v: number | undefined) => void,
    attrs: { min: number; max: number; step: number; placeholder: string }
  ) => (
    <label className="flex flex-col gap-1 text-xs text-neutral-600">
      {label}
      <input
        type="number"
        {...attrs}
        value={value ?? ""}
        onChange={(e) => set(e.target.value === "" ? undefined : Number(e.target.value))}
        className="field"
      />
    </label>
  );
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-medium text-neutral-600">
        Style &amp; hover effect{active && <span className="text-accent ml-1">●</span>}
      </summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="col-span-full flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
            onClick={() => {
              setCopiedLook(copyLook(block));
              setClip((n) => n + 1);
              setNote("Copied. Select another block and press Paste look.");
            }}
          >
            Copy look
          </button>
          <button
            type="button"
            key={clip}
            disabled={!hasCopiedLook()}
            className="rounded border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100 disabled:opacity-40"
            onClick={() => {
              const look = getCopiedLook();
              if (look) {
                onChange({
                  style: look.style ? structuredClone(look.style) : undefined,
                  effect: look.effect,
                  hide: look.hide,
                  motion: look.motion ? structuredClone(look.motion) : undefined,
                  idle: look.idle,
                  parallax: look.parallax,
                  sticky: look.sticky,
                });
                setNote("Pasted.");
              }
            }}
          >
            Paste look
          </button>
          {presets && (
            <>
              <button
                type="button"
                className="rounded border border-neutral-300 bg-white px-2 py-1 hover:bg-neutral-100"
                onClick={async () => {
                  const name = window.prompt("Name this look (for example “Gold button”)");
                  if (!name) return;
                  const error = await presets.save(name, JSON.stringify(copyLook(block)));
                  setNote(error ?? `Saved “${name.trim()}”.`);
                }}
              >
                Save as a named look…
              </button>
              {presets.presets.map((p) => (
                <span
                  key={p.name}
                  className="inline-flex overflow-hidden rounded border border-neutral-300 bg-white"
                >
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-neutral-100"
                    title="Apply this saved look to the block"
                    onClick={() => {
                      onChange({
                        style: p.look.style ? structuredClone(p.look.style) : undefined,
                        effect: p.look.effect,
                        hide: p.look.hide,
                        motion: p.look.motion ? structuredClone(p.look.motion) : undefined,
                        idle: p.look.idle,
                        parallax: p.look.parallax,
                        sticky: p.look.sticky,
                      });
                      setNote(`Applied “${p.name}”.`);
                    }}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete the saved look ${p.name}`}
                    className="border-l border-neutral-300 px-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      if (confirm(`Delete the saved look “${p.name}”?`))
                        void presets.remove(p.name);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </>
          )}
          {note && <span className="text-neutral-500">{note}</span>}
        </div>
        {color(style?.color, "color", "Text colour")}
        {color(style?.bg, "bg", "Background")}
        {color(style?.gradFrom, "color", "Gradient from")}
        {color(style?.gradTo, "color", "Gradient to")}
        {numField("Gradient angle (deg)", style?.gradAngle, (v) => setStyle({ gradAngle: v }), {
          min: 0,
          max: 360,
          step: 15,
          placeholder: "135",
        })}
        <div className="col-span-full flex flex-col gap-1 text-xs text-neutral-600">
          Background image
          <ImagePick
            src={style?.bgImage ?? ""}
            onChange={(bgImage) => setStyle({ bgImage: bgImage || undefined })}
          />
          {style?.bgImage && (
            <button
              type="button"
              className="self-start underline"
              onClick={() => setStyle({ bgImage: undefined })}
            >
              Remove background image
            </button>
          )}
        </div>
        {style?.bgImage && (
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Image fit
            <select
              className="field"
              value={style.bgFit ?? "cover"}
              onChange={(e) => setStyle({ bgFit: e.target.value as BlockStyle["bgFit"] })}
            >
              <option value="cover">Fill the block (cover)</option>
              <option value="contain">Show the whole image</option>
            </select>
          </label>
        )}
        {(style?.bgImage || (style?.gradFrom && style?.gradTo)) && (
          <>
            {color(style?.overlayColor, "color", "Overlay colour")}
            {numField("Overlay strength (%)", style?.overlayStrength, (v) => setStyle({ overlayStrength: v }), {
              min: 0,
              max: 100,
              step: 5,
              placeholder: "40",
            })}
          </>
        )}
        {numField("Opacity (%)", style?.opacity, (v) => setStyle({ opacity: v }), {
          min: 0,
          max: 100,
          step: 5,
          placeholder: "100",
        })}
        {contrast !== null && (
          <p className="col-span-full rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
            These colours are hard to read together (contrast {contrast.toFixed(1)}:1, it needs
            4.5:1). Try a darker text colour or a lighter background.
          </p>
        )}
        {numField("Text size (% of normal)", style?.scale, (v) => setStyle({ scale: v }), {
          min: 50,
          max: 400,
          step: 10,
          placeholder: "100",
        })}
        {numField("Rotation (degrees)", style?.rotate, (v) => setStyle({ rotate: v }), {
          min: -180,
          max: 180,
          step: 5,
          placeholder: "0",
        })}
        {numField("Rotation (degrees)", style?.rotate, (v) => setStyle({ rotate: v }), {
          min: -180,
          max: 180,
          step: 5,
          placeholder: "0",
        })}
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Typeface
          <select
            value={style?.font ?? ""}
            onChange={(e) =>
              setStyle({ font: (e.target.value || undefined) as BlockStyle["font"] })
            }
            className="field"
          >
            <option value="">Default for this block</option>
            <option value="heading">The site&apos;s heading font</option>
            <option value="body">The site&apos;s body font</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Padding (rem)
          <input
            type="number"
            min={0}
            max={4}
            step={0.25}
            value={style?.pad ?? ""}
            onChange={(e) =>
              setStyle({ pad: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Width (% of column)
          <input
            type="number"
            min={10}
            max={200}
            step={5}
            value={style?.w ?? ""}
            onChange={(e) =>
              setStyle({ w: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Height (rem)
          <input
            type="number"
            min={2}
            max={60}
            step={1}
            value={style?.h ?? ""}
            onChange={(e) =>
              setStyle({ h: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="auto"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Move sideways (% of column)
          <input
            type="number"
            min={-60}
            max={60}
            step={1}
            value={style?.x ?? ""}
            onChange={(e) =>
              setStyle({ x: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Move down (rem)
          <input
            type="number"
            min={-30}
            max={30}
            step={1}
            value={style?.y ?? ""}
            onChange={(e) =>
              setStyle({ y: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Layer (higher is in front)
          <input
            type="number"
            min={-5}
            max={20}
            step={1}
            value={style?.z ?? ""}
            onChange={(e) =>
              setStyle({ z: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="auto"
          />
        </label>
        <div className="col-span-full flex flex-wrap items-center gap-1 text-[11px] text-neutral-600">
          <span>Span:</span>
          {[
            ["One column", undefined],
            ["Two columns", 200],
            ["Half a column", 50],
          ].map(([label, w]) => (
            <button
              key={String(label)}
              type="button"
              onClick={() => setStyle({ w: w as number | undefined })}
              className="rounded border border-neutral-300 bg-white px-2 py-0.5 hover:bg-neutral-100"
              title="Quick widths. Anything over 100% grows past the column into the next one."
            >
              {label}
            </button>
          ))}
        </div>
        <fieldset className="border-foreground/15 col-span-full grid gap-2 rounded border p-2 sm:grid-cols-4">
          <legend className="px-1 text-xs font-semibold text-neutral-700">
            On phones (leave empty for the normal layout)
          </legend>
          {numField("Move sideways (%)", style?.mx, (v) => setStyle({ mx: v }), {
            min: -60,
            max: 60,
            step: 1,
            placeholder: "0",
          })}
          {numField("Move down (rem)", style?.my, (v) => setStyle({ my: v }), {
            min: -30,
            max: 30,
            step: 1,
            placeholder: "0",
          })}
          {numField("Width (%)", style?.mw, (v) => setStyle({ mw: v }), {
            min: 10,
            max: 200,
            step: 5,
            placeholder: "same",
          })}
          {numField("Height (rem)", style?.mh, (v) => setStyle({ mh: v }), {
            min: 2,
            max: 60,
            step: 1,
            placeholder: "same",
          })}
        </fieldset>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Rounded corners (rem)
          <input
            type="number"
            min={0}
            max={3}
            step={0.25}
            value={style?.radius ?? ""}
            onChange={(e) =>
              setStyle({ radius: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="field"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Shadow
          <select
            value={style?.shadow ?? ""}
            onChange={(e) =>
              setStyle({ shadow: (e.target.value || undefined) as BlockStyle["shadow"] })
            }
            className="field"
          >
            <option value="">None</option>
            <option value="soft">Soft</option>
            <option value="medium">Medium</option>
            <option value="strong">Strong</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Show on
          <select
            value={hide ?? ""}
            onChange={(e) =>
              onChange({ hide: (e.target.value || undefined) as "mobile" | "desktop" | undefined })
            }
            className="field"
          >
            <option value="">Phones and computers</option>
            <option value="mobile">Computers only (hide on phones)</option>
            <option value="desktop">Phones only (hide on computers)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          On hover
          <select
            value={effect ?? ""}
            onChange={(e) =>
              onChange({ effect: (e.target.value || undefined) as Effect | undefined })
            }
            className="field"
          >
            <option value="">Nothing</option>
            {EFFECTS.map((fx) => (
              <option key={fx} value={fx}>
                {{ lift: "Lift up", zoom: "Zoom in", tilt: "Tilt", glow: "Glow" }[fx]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Looping animation
          <select
            value={block.idle ?? ""}
            onChange={(e) =>
              onChange({ idle: (e.target.value || undefined) as IdleType | undefined })
            }
            className="field"
          >
            <option value="">None</option>
            {IDLE_TYPES.map((i) => (
              <option key={i} value={i}>
                {IDLE_LABELS[i]}
              </option>
            ))}
          </select>
        </label>
        {numField(
          "Parallax (− slower, + faster, %)",
          block.parallax,
          (v) => onChange({ parallax: v || undefined }),
          { min: -60, max: 60, step: 5, placeholder: "0" }
        )}
        <label className="flex items-center gap-1.5 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={block.sticky ?? false}
            onChange={(e) => onChange({ sticky: e.target.checked || undefined })}
          />
          Stay in view while its column scrolls past (don&apos;t combine with moving the block)
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Group name (blocks with the same name move together)
          <input
            value={block.group ?? ""}
            maxLength={16}
            onChange={(e) =>
              onChange({ group: /^[\w-]{1,16}$/.test(e.target.value) ? e.target.value : undefined })
            }
            placeholder="none"
            className="field"
          />
        </label>
        <fieldset className="border-foreground/15 col-span-full grid gap-2 rounded border p-2 sm:grid-cols-3">
          <legend className="px-1 text-xs font-semibold text-neutral-700">Scroll animation</legend>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Animation
            <select
              value={motion?.type ?? ""}
              onChange={(e) => setMotion({ type: (e.target.value || undefined) as MotionType })}
              className="field"
            >
              <option value="">None</option>
              {MOTION_TYPES.map((m) => (
                <option key={m} value={m}>
                  {MOTION_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          {motion && (
            <>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                When scrolling
                <select
                  value={motion.mode ?? ""}
                  onChange={(e) =>
                    setMotion({ mode: (e.target.value || undefined) as Motion["mode"] })
                  }
                  className="field"
                >
                  <option value="">Play once</option>
                  <option value="toggle">Play again when I scroll back</option>
                  <option value="scrub">Follow the scroll</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Speed
                <select
                  value={motion.speed ?? ""}
                  onChange={(e) =>
                    setMotion({ speed: (e.target.value || undefined) as Motion["speed"] })
                  }
                  disabled={motion.mode === "scrub"}
                  className="field"
                >
                  <option value="fast">Fast</option>
                  <option value="">Normal</option>
                  <option value="slow">Slow</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                How it moves
                <select
                  value={motion.ease ?? ""}
                  onChange={(e) =>
                    setMotion({ ease: (e.target.value || undefined) as Ease | undefined })
                  }
                  disabled={motion.mode === "scrub"}
                  className="field"
                >
                  <option value="">Smooth (default)</option>
                  {EASES.filter((x) => x !== "smooth").map((x) => (
                    <option key={x} value={x}>
                      {EASE_LABELS[x]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Order in the sequence (1 = first)
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={motion.order ?? ""}
                  onChange={(e) =>
                    setMotion({ order: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="field"
                  placeholder="reading order"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Extra wait (ms)
                <input
                  type="number"
                  min={0}
                  max={3000}
                  step={100}
                  value={motion.delay ?? ""}
                  onChange={(e) =>
                    setMotion({ delay: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  disabled={motion.mode === "scrub"}
                  className="field"
                  placeholder="0"
                />
              </label>
              <p className="text-[11px] text-neutral-500 sm:col-span-3">
                Blocks that appear together play in order, one after another. Use the same number to
                play two blocks together. Press “Play animations” above the preview to see them
                here.
              </p>
            </>
          )}
        </fieldset>
      </div>
    </details>
  );
}

/** The visual editor: columns, the line between them, and blocks in each column. */
/** Where the full-window workspace draws the editor's parts, each in its own
 *  panel: the block palette, the list of blocks, and the selected block's
 *  settings (or the section's, when nothing is selected). */
