"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaFolder } from "@/app/api/admin/media/route";
import { optimizedImageUrl } from "@/lib/optimized-image";

/**
 * Browse the site's images and uploaded photos by folder and pick one, instead
 * of typing a path. Opens as a dialog over the page.
 */
export function MediaLibrary({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [folders, setFolders] = useState<MediaFolder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => res.json() as Promise<{ folders?: MediaFolder[]; error?: string }>)
      .then((data) => {
        if (data.folders) {
          setFolders(data.folders);
          setOpen(data.folders[0]?.name ?? null);
        } else setError(data.error ?? "Could not load the images.");
      })
      .catch(() => setError("Could not load the images."));
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (!folders) return [];
    if (q) return folders.flatMap((f) => f.images.filter((i) => `${f.name}/${i.name}`.toLowerCase().includes(q)));
    return folders.find((f) => f.name === open)?.images ?? [];
  }, [folders, open, q]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image library"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b p-3">
          <strong className="text-sm">Image library</strong>
          <input
            autoFocus
            className="field flex-1 text-sm"
            placeholder="Search by name or folder…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav aria-label="Folders" className="w-56 shrink-0 overflow-y-auto border-r bg-neutral-50 p-2">
            {folders?.map((f) => (
              <button
                key={f.name}
                type="button"
                className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs ${!q && open === f.name ? "bg-neutral-900 text-white" : "hover:bg-neutral-200"}`}
                onClick={() => {
                  setQuery("");
                  setOpen(f.name);
                }}
              >
                <span className="truncate">📁 {f.name}</span>
                <span className="opacity-60">{f.images.length}</span>
              </button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto p-3">
            {error && <p className="text-sm text-red-700">{error}</p>}
            {!folders && !error && <p className="text-sm text-neutral-500">Loading images…</p>}
            {folders && shown.length === 0 && <p className="text-sm text-neutral-500">No images here.</p>}
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
              {shown.map((img) => (
                <li key={img.url}>
                  <button
                    type="button"
                    title={img.url}
                    className="group flex w-full flex-col gap-1 rounded border p-1.5 text-left hover:border-neutral-900 focus-visible:outline-2"
                    onClick={() => {
                      onPick(img.url);
                      onClose();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of arbitrary site/blob files */}
                    <img src={optimizedImageUrl(img.url, 256)} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded bg-neutral-100 object-contain" />
                    <span className="truncate text-[11px] text-neutral-600">{img.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
