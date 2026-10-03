"use client";

import { useState } from "react";
import { uploadImage } from "../upload-image";
import {
  MAX_BLOCK_BODY,
  MAX_BLOCK_TITLE,
  MAX_CUSTOM_BLOCKS,
  PRODUCT_SECTIONS,
  type CustomBlock,
  type ProductPageLayout,
} from "@/lib/page-layout";

type ImageRow = { url: string; lifestyle: boolean };

/** The `imageUrls` textarea format: one URL per line, " lifestyle" suffix. */
function parseRows(value: string): ImageRow[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, flag] = line.split(/\s+/);
      return { url, lifestyle: flag === "lifestyle" };
    });
}

const serializeRows = (rows: ImageRow[]) =>
  rows.map((r) => (r.lifestyle ? `${r.url} lifestyle` : r.url)).join("\n");

function swap<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/**
 * Photo manager: thumbnails you can reorder, flag as lifestyle, or remove, plus
 * add-by-URL. It writes the same `imageUrls` text the server action already
 * parses, so nothing downstream changes. The first photo is the cover.
 */
export function ProductImagesField({ initial }: { initial: string }) {
  const [rows, setRows] = useState(() => parseRows(initial));
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(files.length);
    const added: ImageRow[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadImage(file);
      if ("url" in result) {
        added.push({ url: result.url, lifestyle: false });
      } else {
        setUploadError(result.error);
        break;
      }
    }
    setRows((current) => [...current, ...added]);
    setUploading(0);
  }

  function add() {
    const urls = draft
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => /^(https?:\/\/|\/)/.test(u));
    if (urls.length === 0) return;
    setRows([...rows, ...urls.map((url) => ({ url, lifestyle: false }))]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">Photos</span>
      <input type="hidden" name="imageUrls" value={serializeRows(rows)} />
      {rows.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((row, i) => (
            <li
              key={`${row.url}-${i}`}
              className="border-foreground/10 overflow-hidden rounded-lg border bg-white"
            >
              <div className="relative aspect-square bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.url} alt="" className="h-full w-full object-contain" />
                {i === 0 && (
                  <span className="bg-primary absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 p-1.5">
                <button
                  type="button"
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => setRows(swap(rows, i, i - 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Move later"
                  disabled={i === rows.length - 1}
                  onClick={() => setRows(swap(rows, i, i + 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                >
                  →
                </button>
                <label className="ml-1 flex cursor-pointer items-center gap-1 text-[11px]">
                  <input
                    type="checkbox"
                    checked={row.lifestyle}
                    onChange={() =>
                      setRows(rows.map((r, j) => (j === i ? { ...r, lifestyle: !r.lifestyle } : r)))
                    }
                  />
                  Lifestyle
                </label>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  className="ml-auto h-7 w-7 rounded border border-red-200 text-xs text-red-700"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className="border-foreground/20 hover:border-accent flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed bg-neutral-50 px-4 py-6 text-center transition-colors">
        <span className="font-medium">
          {uploading > 0
            ? `Uploading ${uploading} photo${uploading === 1 ? "" : "s"}…`
            : "Upload photos from your computer"}
        </span>
        <span className="text-foreground/60 text-xs">JPG, PNG, WebP or AVIF · up to 6 MB each</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={uploading > 0}
          className="sr-only"
          onChange={(e) => {
            void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {uploadError && (
        <p role="alert" className="text-sm text-red-700">
          {uploadError}
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Paste an image URL (https://… or /products/…) and press Add"
          className="field flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={add}
          className="border-foreground/15 rounded border px-4 text-sm"
        >
          Add
        </button>
      </div>
      <span className="text-foreground/60 text-xs">
        First photo is the cover. “Lifestyle” skips the white-background blend for on-model shots.
      </span>
    </div>
  );
}

/**
 * Per-product page content: hide store-wide sections for this piece and write
 * extra titled text blocks (care notes, materials, sizing…). Serialised into
 * the `pageLayout` hidden input.
 */
export function ProductPageContentField({ initial }: { initial: ProductPageLayout }) {
  const [hidden, setHidden] = useState(initial.hidden);
  const [blocks, setBlocks] = useState<CustomBlock[]>(initial.blocks);
  const configurable = PRODUCT_SECTIONS.filter((s) => s.id !== "customBlocks");

  return (
    <fieldset className="border-foreground/10 flex flex-col gap-4 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">Page content</legend>
      <input type="hidden" name="pageLayout" value={JSON.stringify({ hidden, blocks })} />

      <div>
        <p className="mb-2 text-sm font-medium">Sections shown on this product</p>
        <p className="text-foreground/60 mb-2 text-xs">
          Order is set for all products in Settings → Page layout. Untick to hide a section for this
          piece only.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {configurable.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                className="field-checkbox"
                checked={!hidden.includes(s.id)}
                onChange={() =>
                  setHidden(
                    hidden.includes(s.id) ? hidden.filter((h) => h !== s.id) : [...hidden, s.id]
                  )
                }
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Extra text blocks</p>
        <ul className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <li
              key={i}
              className="border-foreground/10 flex flex-col gap-2 rounded-lg border bg-white p-3"
            >
              <input
                value={block.title}
                maxLength={MAX_BLOCK_TITLE}
                placeholder="Title (e.g. Care instructions)"
                onChange={(e) =>
                  setBlocks(blocks.map((b, j) => (j === i ? { ...b, title: e.target.value } : b)))
                }
                className="field"
              />
              <textarea
                value={block.body}
                maxLength={MAX_BLOCK_BODY}
                rows={3}
                placeholder="Text"
                onChange={(e) =>
                  setBlocks(blocks.map((b, j) => (j === i ? { ...b, body: e.target.value } : b)))
                }
                className="field"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => setBlocks(swap(blocks, i, i - 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                  aria-label="Move block up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === blocks.length - 1}
                  onClick={() => setBlocks(swap(blocks, i, i + 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                  aria-label="Move block down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}
                  className="ml-auto text-xs text-red-700 underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        {blocks.length < MAX_CUSTOM_BLOCKS && (
          <button
            type="button"
            onClick={() => setBlocks([...blocks, { title: "", body: "" }])}
            className="border-foreground/15 mt-3 rounded border px-3 py-1.5 text-sm"
          >
            + Add text block
          </button>
        )}
      </div>
    </fieldset>
  );
}
