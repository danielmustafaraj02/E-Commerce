"use client";

import { useState } from "react";
import { safeImageUrl } from "@/lib/custom-section";
import { optimizedImageUrl } from "@/lib/optimized-image";
import { uploadImage } from "@/app/admin/upload-image";
import { ImageBackgroundEditor } from "./image-background-editor";
import { MediaLibrary } from "@/app/admin/media-library";

/** A photo for a block: upload one, or paste a /path or https:// link. */
export function ImagePick({ src, onChange }: { src: string; onChange: (src: string) => void }) {
  const [editingBackground, setEditingBackground] = useState(false);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const preview = safeImageUrl(src);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {library && (
        <MediaLibrary
          onPick={(url) => {
            setFailedSrc(null);
            onChange(url);
          }}
          onClose={() => setLibrary(false)}
        />
      )}
      <div className="flex items-center gap-2">
        {preview && failedSrc !== src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageUrl(preview, 128)}
            alt="Selected image"
            onError={() => setFailedSrc(src)}
            className="h-16 w-16 shrink-0 rounded border border-neutral-200 bg-white object-contain p-1"
          />
        )}
        <button
          type="button"
          className="border-foreground/15 rounded border bg-white px-2.5 py-1 text-xs hover:bg-neutral-100"
          onClick={() => setLibrary(true)}
        >
          Choose from library
        </button>
        <label className="border-foreground/15 cursor-pointer rounded border bg-white px-2.5 py-1 text-xs hover:bg-neutral-100">
          {busy ? "Uploading…" : "Upload photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              try {
                const result = await uploadImage(file);
                if ("url" in result) {
                  setFailedSrc(null);
                  onChange(result.url);
                } else setError(result.error);
              } catch {
                setError("The photo could not be uploaded. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {failedSrc === src && (
        <p className="text-xs text-neutral-500">
          Image unavailable. Check the link or upload a photo.
        </p>
      )}
      <input
        aria-label="Image URL"
        value={src}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste /path or https:// link"
        className="field font-mono text-xs"
      />
      {preview && failedSrc !== src && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className="rounded border bg-white px-2.5 py-1.5 text-xs disabled:opacity-40"
            onClick={() => setEditingBackground((open) => !open)}
          >
            {editingBackground ? "Hide background editor" : "Remove white background"}
          </button>
          {originalSrc && src === transparentSrc && (
            <button
              type="button"
              className="rounded border bg-white px-2.5 py-1.5 text-xs"
              onClick={() => {
                onChange(originalSrc);
                setOriginalSrc(null);
                setTransparentSrc(null);
                setEditingBackground(false);
              }}
            >
              Restore original image
            </button>
          )}
        </div>
      )}
      {editingBackground && preview && (
        <ImageBackgroundEditor
          key={src}
          src={preview}
          onClose={() => setEditingBackground(false)}
          onChange={(url) => {
            setOriginalSrc(src === transparentSrc && originalSrc ? originalSrc : src);
            setTransparentSrc(url);
            onChange(url);
          }}
        />
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
