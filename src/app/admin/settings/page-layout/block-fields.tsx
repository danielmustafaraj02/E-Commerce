"use client";

import {
  ICONS,
  SHAPE_KINDS,
  SHAPE_LABELS,
  type Align,
  type BuilderBlock,
  type ShapeKind,
} from "@/lib/section-builder";
import { ImagePick } from "./image-pick";
import { ShowcaseFields } from "./showcase-fields";
import { ColorField } from "@/components/color-field";

/** A tiny glyph per shape, shown in the shape picker so each is recognisable at
 *  a glance without reading the label. */
const SHAPE_GLYPH: Record<ShapeKind, string> = {
  rectangle: "▭",
  oval: "◯",
  triangle: "▲",
  diamond: "◆",
  star: "★",
  hexagon: "⬡",
  heart: "♥",
  arrow: "➜",
  blob: "◗",
  cross: "✚",
  ring: "◎",
  speech: "🗨",
};

function AlignPick({ value, onChange }: { value?: Align; onChange: (a?: Align) => void }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || undefined) as Align | undefined)}
      aria-label="Alignment"
      className="field w-auto text-xs"
    >
      <option value="">Align: default</option>
      <option value="left">Left</option>
      <option value="center">Centre</option>
      <option value="right">Right</option>
    </select>
  );
}

function TypingPick({
  value,
  onChange,
}: {
  value?: "slow" | "normal" | "fast";
  onChange: (v?: "slow" | "normal" | "fast") => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange((e.target.value || undefined) as "slow" | "normal" | "fast" | undefined)
      }
      aria-label="Typing animation"
      className="field w-auto text-xs"
      title="Types the text out letter by letter when it scrolls into view"
    >
      <option value="">Typing animation: off</option>
      <option value="slow">Typing: slow</option>
      <option value="normal">Typing: normal</option>
      <option value="fast">Typing: fast</option>
    </select>
  );
}

/** The content controls of the selected block (text, links, images, items…),
 *  one form per block type. */
export function BlockFields({
  block,
  onChange,
}: {
  block: BuilderBlock;
  onChange: (patch: Partial<BuilderBlock>) => void;
}) {
  const set = (patch: Record<string, unknown>) => onChange(patch as Partial<BuilderBlock>);
  switch (block.type) {
    case "shape":
      return (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            Shape
            <select
              className="field"
              value={block.kind}
              onChange={(e) => set({ kind: e.target.value })}
            >
              {SHAPE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {SHAPE_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-1" aria-label="Quick shape">
            {SHAPE_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                title={SHAPE_LABELS[kind]}
                aria-label={SHAPE_LABELS[kind]}
                aria-pressed={block.kind === kind}
                onClick={() => set({ kind })}
                className={`h-7 w-7 rounded border text-[11px] ${
                  block.kind === kind
                    ? "border-accent bg-accent/10"
                    : "border-neutral-300 bg-white hover:bg-neutral-100"
                }`}
              >
                {SHAPE_GLYPH[kind]}
              </button>
            ))}
          </div>
          <ColorField
            label="Shape fill"
            value={block.fill}
            fallback="#154230"
            onChange={(fill) => set({ fill: fill || "#154230" })}
          />
          <ColorField
            label="Outline colour"
            value={block.stroke ?? ""}
            fallback="#b08d57"
            onChange={(stroke) => set({ stroke: stroke || undefined })}
          />
          <label className="flex flex-col gap-1 text-xs">
            Rotation: {block.rotate ?? 0}°
            <input
              type="range"
              min={-180}
              max={180}
              step={5}
              value={block.rotate ?? 0}
              onChange={(e) => set({ rotate: Number(e.target.value) || undefined })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Width: {block.style?.w ?? 100}%
            <input
              type="range"
              min={10}
              max={200}
              value={block.style?.w ?? 100}
              onChange={(e) => set({ style: { ...block.style, w: Number(e.target.value) } })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Height: {block.style?.h ?? 8} rem
            <input
              type="range"
              min={2}
              max={60}
              step={0.5}
              value={block.style?.h ?? 8}
              onChange={(e) => set({ style: { ...block.style, h: Number(e.target.value) } })}
            />
          </label>

          <p className="text-xs text-neutral-500">
            Drag the preview handles to move or resize. Open Style & effects below for rounded
            corners, shadows and animation.
          </p>
        </div>
      );
    case "heading":
      return (
        <div className="flex flex-col gap-1.5">
          <input
            value={block.text}
            onChange={(e) => set({ text: e.target.value })}
            className="field"
            placeholder="Heading text"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={block.size}
              onChange={(e) => set({ size: e.target.value })}
              aria-label="Size"
              className="field w-auto text-xs"
            >
              <option value="s">Small</option>
              <option value="m">Medium</option>
              <option value="l">Large</option>
              <option value="xl">Extra large</option>
            </select>
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
            <select
              value={block.rule ?? ""}
              onChange={(e) => set({ rule: e.target.value || undefined })}
              aria-label="Rule under the heading"
              className="field w-auto text-xs"
            >
              <option value="">No rule under it</option>
              <option value="gold">Gold hairline</option>
              <option value="accent">Dark hairline</option>
              <option value="thick">Thick dark rule</option>
            </select>
            <TypingPick value={block.typing} onChange={(typing) => set({ typing })} />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={block.h1 ?? false}
              onChange={(e) => set({ h1: e.target.checked || undefined })}
            />
            This is the page&apos;s main title (use it once per page)
          </label>
        </div>
      );
    case "text":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Block text
            <textarea
              rows={5}
              value={block.text}
              onChange={(e) => set({ text: e.target.value })}
              className="field"
              placeholder="Blank line = new paragraph. **bold**, *italic*, [link](/path)"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
            <TypingPick value={block.typing} onChange={(typing) => set({ typing })} />
          </div>
        </div>
      );
    case "image":
      return (
        <div className="flex flex-col gap-3">
          <ImagePick src={block.src} onChange={(src) => set({ src })} />
          {block.src && (
            <div className="rounded-lg border-neutral-200 bg-neutral-50 p-2">
              <p className="mb-2 text-[11px] font-medium text-neutral-600">Selected image preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} className="max-h-72 w-full rounded object-contain" />
            </div>
          )}
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Image fit
            <select
              className="field"
              value={block.fit ?? "contain"}
              onChange={(e) => set({ fit: e.target.value === "cover" ? "cover" : undefined })}
            >
              <option value="contain">Show the whole image</option>
              <option value="cover">Fill the frame (crop edges)</option>
            </select>
          </label>
          <input
            value={block.alt}
            onChange={(e) => set({ alt: e.target.value })}
            placeholder="Describe the image (for screen readers)"
            className="field text-xs"
          />
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={block.rounded ?? false}
              onChange={(e) => set({ rounded: e.target.checked || undefined })}
            />
            Rounded corners
          </label>
        </div>
      );
    case "button":
      return (
        <div className="flex flex-col gap-1.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={block.text}
              onChange={(e) => set({ text: e.target.value })}
              className="field"
              placeholder="Button text"
            />
            <input
              value={block.href}
              onChange={(e) => set({ href: e.target.value })}
              className="field font-mono text-xs"
              placeholder="/products or https://…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={block.look}
              onChange={(e) => set({ look: e.target.value })}
              aria-label="Style"
              className="field w-auto text-xs"
            >
              <option value="solid">Filled</option>
              <option value="outline">Outline</option>
            </select>
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={block.afterTyping ?? false}
                onChange={(e) => set({ afterTyping: e.target.checked || undefined })}
              />
              Appear after the typing
            </label>
          </div>
        </div>
      );
    case "vline":
    case "spacer":
      return (
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            Height (rem)
            <input
              type="number"
              min={block.type === "vline" ? 1 : 0.5}
              max={block.type === "vline" ? 40 : 12}
              step={0.5}
              value={block.height}
              onChange={(e) => set({ height: Number(e.target.value) })}
              className="field w-24"
            />
          </label>
          {block.type === "vline" && (
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={block.draw ?? false}
                onChange={(e) => set({ draw: e.target.checked || undefined })}
              />
              Draw in on scroll
            </label>
          )}
        </div>
      );
    case "list":
      return (
        <div className="flex flex-col gap-1.5">
          <textarea
            rows={4}
            value={block.items.join("\n")}
            onChange={(e) => set({ items: e.target.value.split("\n") })}
            className="field"
            placeholder="One item per line"
          />
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={block.ordered ?? false}
              onChange={(e) => set({ ordered: e.target.checked || undefined })}
            />
            Numbered
          </label>
        </div>
      );
    case "quote":
      return (
        <div className="flex flex-col gap-1.5">
          <textarea
            rows={2}
            value={block.text}
            onChange={(e) => set({ text: e.target.value })}
            className="field"
          />
          <input
            value={block.cite ?? ""}
            onChange={(e) => set({ cite: e.target.value })}
            placeholder="Who said it (optional)"
            className="field text-xs"
          />
        </div>
      );
    case "video":
      return (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Video URL
            <input
              value={block.url}
              onChange={(e) => set({ url: e.target.value })}
              placeholder="YouTube/Vimeo link or /media/film.mp4"
              className="field font-mono text-xs"
            />
          </label>
          {block.url && /^\/(?!\/)[^\s]+\.(mp4|webm)(?:[?#].*)?$/i.test(block.url) && (
            <video key={block.url} src={block.url} controls muted playsInline className="max-h-72 w-full rounded border-neutral-200 bg-black object-contain" />
          )}
          {block.url && /^https?:\/\//i.test(block.url) && (
            <p className="text-xs text-neutral-500">YouTube and Vimeo videos appear in the live preview after saving.</p>
          )}
          <p className="text-xs text-neutral-500">Use an uploaded .mp4/.webm file to preview the video here, or paste a YouTube/Vimeo link.</p>
        </div>
      );
    case "counter":
      return (
        <div className="flex flex-col gap-1.5">
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              type="number"
              min={0}
              value={block.value}
              onChange={(e) => set({ value: Number(e.target.value) })}
              className="field"
              aria-label="Number"
            />
            <input
              value={block.prefix ?? ""}
              onChange={(e) => set({ prefix: e.target.value })}
              className="field"
              placeholder="Before (€, +)"
              maxLength={8}
            />
            <input
              value={block.suffix ?? ""}
              onChange={(e) => set({ suffix: e.target.value })}
              className="field"
              placeholder="After (+, %)"
              maxLength={8}
            />
          </div>
          <input
            value={block.label ?? ""}
            onChange={(e) => set({ label: e.target.value })}
            className="field"
            placeholder="Caption under the number"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={block.size}
              onChange={(e) => set({ size: e.target.value })}
              aria-label="Size"
              className="field w-auto text-xs"
            >
              <option value="m">Medium</option>
              <option value="l">Large</option>
              <option value="xl">Extra large</option>
            </select>
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
          </div>
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={block.countUp !== false}
              onChange={(e) => set({ countUp: e.target.checked ? undefined : false })}
            />
            Count up from 0 when it scrolls into view
          </label>
        </div>
      );
    case "icon":
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Icon">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                role="radio"
                aria-checked={block.icon === icon}
                onClick={() => set({ icon })}
                className={`rounded border px-2 py-1 text-xs ${block.icon === icon ? "border-accent bg-accent/10 font-semibold" : "border-neutral-300 bg-white"}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            value={block.title}
            onChange={(e) => set({ title: e.target.value })}
            className="field"
            placeholder="Title"
          />
          <textarea
            rows={2}
            value={block.text ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            className="field"
            placeholder="Short text"
          />
          <AlignPick value={block.align} onChange={(align) => set({ align })} />
        </div>
      );
    case "stars":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs">
            Rating (0–5)
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={block.rating}
              onChange={(e) => set({ rating: Number(e.target.value) })}
              className="field w-24"
            />
          </label>
          <input
            value={block.label ?? ""}
            onChange={(e) => set({ label: e.target.value })}
            className="field"
            placeholder="e.g. 4.8 · 1,200 reviews"
          />
          <AlignPick value={block.align} onChange={(align) => set({ align })} />
        </div>
      );
    case "countdown":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs">
            Ends on
            <input
              type="datetime-local"
              value={block.until}
              onChange={(e) => set({ until: e.target.value })}
              className="field w-auto"
            />
          </label>
          <input
            value={block.label ?? ""}
            onChange={(e) => set({ label: e.target.value })}
            className="field"
            placeholder="Text above the clock"
          />
          <input
            value={block.doneText ?? ""}
            onChange={(e) => set({ doneText: e.target.value })}
            className="field"
            placeholder="Text when the time is up"
          />
          <AlignPick value={block.align} onChange={(align) => set({ align })} />
        </div>
      );
    case "badge":
      return (
        <div className="flex flex-col gap-1.5">
          <input
            value={block.text}
            onChange={(e) => set({ text: e.target.value })}
            className="field"
            maxLength={60}
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={block.look}
              onChange={(e) => set({ look: e.target.value })}
              aria-label="Style"
              className="field w-auto text-xs"
            >
              <option value="solid">Filled</option>
              <option value="outline">Outline</option>
              <option value="soft">Soft</option>
            </select>
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
          </div>
        </div>
      );
    case "map":
      return (
        <div className="flex flex-col gap-1.5">
          <input
            value={block.query}
            onChange={(e) => set({ query: e.target.value })}
            className="field"
            placeholder="Address or place name"
          />
          <label className="flex items-center gap-2 text-xs">
            Height (rem)
            <input
              type="number"
              min={8}
              max={40}
              step={1}
              value={block.height}
              onChange={(e) => set({ height: Number(e.target.value) })}
              className="field w-24"
            />
          </label>
        </div>
      );
    case "shelf":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs">
            Pieces
            <select
              value={block.source}
              onChange={(e) => set({ source: e.target.value })}
              className="field w-auto text-xs"
            >
              <option value="popular">Community favourites</option>
              <option value="bestSellers">Best sellers</option>
              <option value="newest">New arrivals</option>
              <option value="special">Special selection (on offer)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            How many (2–12)
            <input
              type="number"
              min={2}
              max={12}
              value={block.count}
              onChange={(e) => set({ count: Number(e.target.value) })}
              className="field w-20"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Your real products in the site&apos;s own shelf, with prices and quick add.
          </p>
        </div>
      );
    case "looks":
    case "reviews":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs">
            How many (1–6)
            <input
              type="number"
              min={1}
              max={6}
              value={block.count}
              onChange={(e) => set({ count: Number(e.target.value) })}
              className="field w-20"
            />
          </label>
          <p className="text-xs text-neutral-500">
            {block.type === "looks"
              ? "Your editorial looks, as on the home page."
              : "Real customer reviews only (shown when reviews are switched on in Settings)."}
          </p>
        </div>
      );
    case "newsletter":
    case "journal":
    case "siteFaq":
      return (
        <p className="text-xs text-neutral-500">
          {
            {
              newsletter:
                "The newsletter signup form. Write the message around it with other blocks.",
              journal: "Your latest journal articles, with their own heading.",
              siteFaq: "The site's questions and answers, built from your shipping settings.",
            }[block.type]
          }
        </p>
      );
    case "showcase":
      return (
        <ShowcaseFields
          layout={block.layout}
          scenes={block.scenes}
          scroll={block.scroll}
          onChange={(patch) => set({
            ...patch,
            ...(patch.scroll?.fullScreen && {
              style: { ...block.style, w: undefined, h: undefined, x: undefined, y: undefined,
                mw: undefined, mh: undefined, mx: undefined, my: undefined },
            }),
          })}
        />
      );
    case "original":
      return (
        <p className="text-xs text-neutral-500">
          The section&apos;s own content, exactly as the site shows it: products, forms, articles,
          prices and every language stay live. Put headings, text, pictures or animations above,
          below or beside it, or style it with the Style panel.
        </p>
      );
    case "story":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={block.eyebrow ?? ""}
            onChange={(e) => set({ eyebrow: e.target.value || undefined })}
            placeholder="Small label above the title (optional)"
            className="field text-xs"
          />
          <input
            value={block.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Title"
            className="field"
          />
          <textarea
            rows={3}
            value={block.text}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Text"
            className="field sm:col-span-2"
          />
          <input
            value={block.cta ?? ""}
            onChange={(e) => set({ cta: e.target.value || undefined })}
            placeholder="Button text (empty = no button)"
            className="field text-xs"
          />
          <input
            value={block.href ?? ""}
            onChange={(e) => set({ href: e.target.value || undefined })}
            placeholder="/products/… or https://…"
            className="field font-mono text-xs"
          />
          <div className="sm:col-span-2">
            <ImagePick src={block.src} onChange={(src) => set({ src })} />
          </div>
          <input
            value={block.alt}
            onChange={(e) => set({ alt: e.target.value })}
            placeholder="Describe the picture (for screen readers)"
            className="field text-xs sm:col-span-2"
          />
          <select
            value={block.side}
            onChange={(e) => set({ side: e.target.value })}
            className="field text-xs"
            aria-label="Picture side"
          >
            <option value="right">Picture on the right</option>
            <option value="left">Picture on the left</option>
          </select>
          <select
            value={block.ratio ?? "portrait"}
            onChange={(e) =>
              set({ ratio: e.target.value === "portrait" ? undefined : e.target.value })
            }
            className="field text-xs"
            aria-label="Picture shape"
          >
            <option value="portrait">Tall picture</option>
            <option value="square">Square picture</option>
            <option value="landscape">Wide picture</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs sm:col-span-2">
            <input
              type="checkbox"
              checked={block.blend ?? false}
              onChange={(e) => set({ blend: e.target.checked || undefined })}
            />
            Jewellery on a white background: blend it into the page (no frame, no crop)
          </label>
          <fieldset className="grid gap-3 rounded border border-neutral-200 p-3 sm:col-span-2">
            <legend className="px-1 text-xs">Picture size and position</legend>
            {([
              ["imageScale", "Size", 25, 200, 100],
              ["imageX", "Move horizontally", -50, 50, 0],
              ["imageY", "Move vertically", -50, 50, 0],
            ] as const).map(([key, label, min, max, initial]) => (
              <label key={key} className="grid gap-1 text-xs">
                <span>{label}: {block[key] ?? initial}%</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={1}
                  value={block[key] ?? initial}
                  onChange={(e) => set({ [key]: Number(e.target.value) })}
                  className="w-full"
                />
              </label>
            ))}
            <button
              type="button"
              className="justify-self-start text-xs underline underline-offset-4"
              onClick={() => set({ imageScale: undefined, imageX: undefined, imageY: undefined })}
            >
              Reset picture size and position
            </button>
          </fieldset>
          <ColorField
            label="Picture background"
            value={block.imageBackground}
            fallback="#ffffff"
            clearLabel="No background"
            onChange={(imageBackground) => set({ imageBackground })}
            className="sm:col-span-2"
          />
          <fieldset className="border-foreground/15 grid gap-2 rounded border p-2 sm:col-span-2 sm:grid-cols-2">
            <legend className="px-1 text-xs text-neutral-600">
              Optional piece caption
            </legend>
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input type="checkbox" checked={block.showCaption ?? false}
                onChange={(e) => set({ showCaption: e.target.checked || undefined })} />
              Show name, price and link below the picture
            </label>
            <input
              value={block.cardTitle ?? ""}
              onChange={(e) => set({ cardTitle: e.target.value || undefined })}
              placeholder="Piece name"
              className="field text-xs"
            />
            <input
              value={block.cardPrice ?? ""}
              onChange={(e) => set({ cardPrice: e.target.value || undefined })}
              placeholder="Price, e.g. 80,00 €"
              className="field text-xs"
            />
            <input
              value={block.cardCta ?? ""}
              onChange={(e) => set({ cardCta: e.target.value || undefined })}
              placeholder="Link text"
              className="field text-xs"
            />
            <input
              value={block.cardHref ?? ""}
              onChange={(e) => set({ cardHref: e.target.value || undefined })}
              placeholder="Card link (default: the button's)"
              className="field font-mono text-xs"
            />
          </fieldset>
        </div>
      );
    case "faq":
      return (
        <div className="flex flex-col gap-2">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded border border-neutral-200 bg-white p-2"
            >
              <input
                value={item.q}
                onChange={(e) =>
                  set({
                    items: block.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)),
                  })
                }
                className="field"
                placeholder="Question"
              />
              <textarea
                rows={2}
                value={item.a}
                onChange={(e) =>
                  set({
                    items: block.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)),
                  })
                }
                className="field"
                placeholder="Answer"
              />
              <button
                type="button"
                onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}
                className="w-fit text-xs text-red-700 underline"
              >
                Remove question
              </button>
            </div>
          ))}
          {block.items.length < 20 && (
            <button
              type="button"
              onClick={() => set({ items: [...block.items, { q: "", a: "" }] })}
              className="w-fit rounded border border-neutral-300 bg-white px-2 py-1 text-xs hover:bg-neutral-100"
            >
              + Add a question
            </button>
          )}
        </div>
      );
    case "eyebrow":
      return (
        <div className="flex flex-col gap-1.5">
          <div className="grid gap-2 sm:grid-cols-[6rem_1fr]">
            <input
              value={block.number ?? ""}
              onChange={(e) => set({ number: e.target.value })}
              maxLength={8}
              className="field"
              placeholder="No. (02)"
            />
            <input
              value={block.text}
              onChange={(e) => set({ text: e.target.value })}
              maxLength={120}
              className="field"
              placeholder="LABEL TEXT"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={block.line}
              onChange={(e) => set({ line: e.target.value })}
              aria-label="Line"
              className="field w-auto text-xs"
            >
              <option value="after">Line after the label</option>
              <option value="before">Line before the label</option>
              <option value="both">Line on both sides</option>
              <option value="none">No line</option>
            </select>
            <AlignPick value={block.align} onChange={(align) => set({ align })} />
          </div>
          <p className="text-xs text-neutral-500">
            Shown in spaced capitals. Leave the number empty to hide the number and slash.
          </p>
        </div>
      );
    case "carousel":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs">
            Pieces
            <select
              value={block.source}
              onChange={(e) => set({ source: e.target.value })}
              className="field w-auto text-xs"
            >
              <option value="popular">Community favourites (pinned or popular)</option>
              <option value="bestSellers">Best sellers</option>
              <option value="newest">New arrivals</option>
              <option value="special">Special selection (on offer)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            How many (3–10)
            <input
              type="number"
              min={3}
              max={10}
              value={block.count}
              onChange={(e) => set({ count: Number(e.target.value) })}
              className="field w-20"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Shows your real products in the sliding carousel from the home page. The preview shows a
            placeholder; the pieces appear on the site (it needs at least 3).
          </p>
        </div>
      );
    case "divider":
      return (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs text-neutral-500">A thin horizontal line across the column.</p>
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={block.draw ?? false}
              onChange={(e) => set({ draw: e.target.checked || undefined })}
            />
            Draw in on scroll
          </label>
        </div>
      );
  }
}

/** A block's own look (colour, background, padding, rounding, shadow) and its
 *  hover effect: no CSS needed. */
