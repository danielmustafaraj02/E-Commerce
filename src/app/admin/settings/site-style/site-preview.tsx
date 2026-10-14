"use client";

import { useEffect, useRef, useState } from "react";
import { googleFontsHref } from "@/lib/font-pairings";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import { resolveStreaming } from "@/lib/resolve-streaming";
import { siteStyleVars, type SiteStyle } from "@/lib/site-style";

/**
 * A live copy of your real pages for Settings > Site style.
 *
 * The page is fetched once (public HTML, same origin) and drawn in a sandboxed
 * frame with the site's own stylesheets, scripts removed. The draft colours and
 * fonts are then applied to that copy by setting the same custom properties
 * the storefront sets on <html>, so clicking a palette or a font pairing
 * restyles the page at once, with no reload and nothing saved.
 */

export type PreviewPage = { id: string; label: string; path: string };

const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 390;

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function applyDraft(d: Document, draft: SiteStyle) {
  const root = d.documentElement;
  const wanted = siteStyleVars(draft) as Record<string, string>;
  const previous = (root.dataset.draftVars ?? "").split(",").filter(Boolean);
  for (const key of previous) if (!(key in wanted)) root.style.removeProperty(key);
  for (const [key, value] of Object.entries(wanted)) root.style.setProperty(key, value);
  root.dataset.draftVars = Object.keys(wanted).join(",");

  const href = googleFontsHref(draft.fontHeading, draft.fontBody);
  let link = d.getElementById("draft-fonts") as HTMLLinkElement | null;
  if (href) {
    if (!link) {
      link = d.createElement("link");
      link.id = "draft-fonts";
      link.rel = "stylesheet";
      d.head.appendChild(link);
    }
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  } else link?.remove();
}

export function SitePreview({ draft, pages }: { draft: SiteStyle; pages: PreviewPage[] }) {
  const [pageId, setPageId] = useState(pages[0].id);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  // The last finished load. "Loading" is derived: the result is for another page
  // (or an older reload) than the one now asked for.
  const [result, setResult] = useState<{ key: string; srcDoc?: string; error?: string } | null>(
    null
  );
  const [reloads, setReloads] = useState(0);
  const [boxWidth, setBoxWidth] = useState(560);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const draftRef = useRef(draft);
  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  const key = `${page.path}#${reloads}`;
  const loading = result?.key !== key;
  const srcDoc = result?.srcDoc ?? null;
  const error = !loading ? (result?.error ?? null) : null;

  useEffect(() => {
    draftRef.current = draft;
    const d = frame.current?.contentDocument;
    if (d?.documentElement) applyDraft(d, draft);
  }, [draft]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    observer.observe(el);
    setBoxWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let response = await fetch(`/${defaultLocale}${page.path}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        // A cold database can answer 5xx once; try again before giving up.
        for (let i = 0; i < 2 && response.status >= 500; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          response = await fetch(`/${defaultLocale}${page.path}`, { cache: "no-store" });
        }
        if (!response.ok) throw new Error(`The page answered ${response.status}.`);
        const doc = new DOMParser().parseFromString(await response.text(), "text/html");
        resolveStreaming(doc);
        doc.querySelectorAll("script, noscript, template").forEach((el) => el.remove());
        const links = [...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
          .map((l) => l.getAttribute("href") ?? "")
          .filter((href) => href && !href.includes("fonts.googleapis.com"));
        const body = doc.body.innerHTML.replace(/data-reveal="false"/g, 'data-reveal="true"');
        const html = `<!doctype html><html class="${esc(doc.documentElement.className)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank">${links
          .map((href) => `<link rel="stylesheet" href="${esc(href)}">`)
          .join(
            ""
          )}<style>html{scroll-behavior:auto}</style></head><body class="${esc(doc.body.className)}">${body}</body></html>`;
        if (!cancelled) setResult({ key, srcDoc: html });
      } catch (e) {
        if (!cancelled) {
          setResult({
            key,
            srcDoc: undefined,
            error: e instanceof Error ? e.message : "Could not load the page.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const width = device === "desktop" ? DESKTOP_WIDTH : PHONE_WIDTH;
  const scale = device === "desktop" ? Math.min(1, boxWidth / DESKTOP_WIDTH) : 1;
  const height = 780;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <h2 className="mr-1 text-sm font-semibold">Live preview</h2>
        <select
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
          aria-label="Page to preview"
          className="rounded border border-neutral-300 px-2 py-1"
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={device === "desktop" ? "font-semibold" : "underline"}
        >
          Computer
        </button>
        <button
          type="button"
          onClick={() => setDevice("phone")}
          className={device === "phone" ? "font-semibold" : "underline"}
        >
          Phone
        </button>
        <button type="button" onClick={() => setReloads((n) => n + 1)} className="underline">
          Reload page
        </button>
        <a
          href={`/${defaultLocale}${page.path}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto underline"
        >
          Open the real page ↗
        </a>
      </div>
      <div
        ref={box}
        className="relative overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100"
        style={{ height: device === "desktop" ? height * scale + 2 : height }}
      >
        {error ? (
          <p className="p-4 text-sm text-red-700">
            Preview unavailable: {error}{" "}
            <button type="button" onClick={() => setReloads((n) => n + 1)} className="underline">
              Retry
            </button>
          </p>
        ) : (
          <>
            {loading && !srcDoc && <p className="p-4 text-sm text-neutral-500">Loading preview…</p>}
            {srcDoc && (
              <iframe
                ref={frame}
                title={`Preview of ${page.label}`}
                // No scripts can run in the copy; same-origin so its CSS and fonts load.
                sandbox="allow-same-origin"
                srcDoc={srcDoc}
                onLoad={() => {
                  const d = frame.current?.contentDocument;
                  if (d?.documentElement) applyDraft(d, draftRef.current);
                }}
                className="bg-white"
                style={{
                  width,
                  height: device === "desktop" ? height / scale : height,
                  border: 0,
                  transform: scale === 1 ? undefined : `scale(${scale})`,
                  transformOrigin: "top left",
                  marginInline: device === "phone" ? "auto" : undefined,
                  display: "block",
                  opacity: loading ? 0.5 : 1,
                }}
              />
            )}
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Your real {page.label.toLowerCase()} with your changes applied. Nothing is saved until
        you press Save.
      </p>
    </div>
  );
}
