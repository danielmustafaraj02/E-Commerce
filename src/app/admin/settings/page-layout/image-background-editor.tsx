"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/app/admin/upload-image";
import { removeWhiteBackground } from "@/lib/white-background";

export function ImageBackgroundEditor({
  src,
  onChange,
  onClose,
}: {
  src: string;
  onChange: (src: string) => void;
  onClose: () => void;
}) {
  const [strength, setStrength] = useState(24);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [processedStrength, setProcessedStrength] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const imageData = useRef<ImageData | null>(null);
  const output = useRef<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      try {
        if (image.naturalWidth * image.naturalHeight > 16_000_000) {
          throw new Error("Use an image with up to 16 million pixels.");
        }
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Image editing is unavailable in this browser.");
        context.drawImage(image, 0, 0);
        imageData.current = context.getImageData(0, 0, canvas.width, canvas.height);
        setLoading(false);
      } catch (e) {
        setError(
          e instanceof DOMException
            ? "This image host prevents editing. Upload the photo here first, then try again."
            : e instanceof Error
              ? e.message
              : "Could not open the image."
        );
        setLoading(false);
      }
    };
    image.onerror = () => {
      if (cancelled) return;
      setError(
        "Could not open this image for editing. Upload the photo here first, then try again."
      );
      setLoading(false);
    };
    image.src = src;
    return () => {
      cancelled = true;
      imageData.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (loading || !imageData.current) return;
    let cancelled = false;
    let url: string | null = null;
    output.current = null;
    const timer = window.setTimeout(() => {
      try {
        const original = imageData.current!;
        const pixels = removeWhiteBackground(
          original.data,
          original.width,
          original.height,
          strength
        );
        const canvas = document.createElement("canvas");
        canvas.width = original.width;
        canvas.height = original.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Image editing is unavailable in this browser.");
        context.putImageData(new ImageData(pixels, original.width, original.height), 0, 0);
        canvas.toBlob((blob) => {
          if (cancelled) return;
          if (!blob) {
            setError("Could not create the transparent PNG.");
            return;
          }
          output.current = blob;
          url = URL.createObjectURL(blob);
          setPreview(url);
          setProcessedStrength(strength);
        }, "image/png");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not process the photo.");
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [loading, strength]);

  return (
    <section
      aria-label="Remove white background"
      className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Remove white background</h3>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded border bg-white px-2 py-1 text-xs"
        >
          Close
        </button>
      </div>
      <p className="mb-3 text-xs text-neutral-600">
        Removes white connected to the edges. Increase strength for off-white backgrounds. Check
        pale objects carefully before applying.
      </p>
      <label className="flex flex-col gap-1 text-xs">
        Removal strength: {strength}
        <input
          type="range"
          min={0}
          max={100}
          value={strength}
          disabled={loading || busy}
          onChange={(e) => setStrength(Number(e.target.value))}
        />
      </label>
      {loading && (
        <p role="status" className="mt-3 text-xs">
          Opening image…
        </p>
      )}
      {!loading && !error && processedStrength !== strength && (
        <p role="status" className="mt-3 text-xs">Updating transparency preview…</p>
      )}
      {preview && processedStrength === strength && (
        <div
          className="mt-3 rounded border border-neutral-200 p-2"
          style={{
            backgroundColor: "#fff",
            backgroundImage:
              "conic-gradient(#ddd 25%, transparent 0 50%, #ddd 0 75%, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Transparent background preview"
            className="mx-auto max-h-64 max-w-full object-contain"
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!preview || busy || loading || processedStrength !== strength}
          className="rounded border bg-white px-3 py-2 text-xs disabled:opacity-40"
          onClick={async () => {
            const blob = output.current;
            if (!blob) return;
            setBusy(true);
            setError("");
            try {
              const result = await uploadImage(
                new File([blob], "transparent-photo.png", { type: "image/png" })
              );
              if ("error" in result) setError(result.error);
              else {
                onChange(result.url);
                onClose();
              }
            } catch {
              setError("Could not save the image. Try again or download the PNG.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Apply transparent image"}
        </button>
        <button
          type="button"
          disabled={!preview || busy || processedStrength !== strength}
          className="rounded border bg-white px-3 py-2 text-xs disabled:opacity-40"
          onClick={() => {
            if (!output.current) return;
            const url = URL.createObjectURL(output.current);
            const link = document.createElement("a");
            link.href = url;
            link.download = "transparent-photo.png";
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download PNG
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
