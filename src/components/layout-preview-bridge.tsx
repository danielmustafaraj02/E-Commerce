"use client";

import { useEffect } from "react";
import { sanitizeSectionHtml, scopeSectionCss } from "@/lib/custom-section";
import {
  SECTIONS_BY_TARGET,
  resolveLayout,
  type LayoutEntry,
  type PageTarget,
} from "@/lib/page-layout";
import { entryContent, innerClass } from "@/lib/section-content";
import { fromMap, localizeDoc } from "@/lib/builder-i18n";
import type { Locale } from "@/lib/i18n/locale-constants";
import { initBuilderRuntime } from "@/lib/builder-runtime";
import {
  backgroundLayersHtml,
  hasBackgroundLayers,
  optionAttributes,
  sectionInlineStyle,
} from "@/lib/section-style";

/**
 * Admin live preview. Mounted only when the page was opened with
 * ?layoutPreview=1 by an admin (see layout-preview-server.ts), in a tab opened
 * from Admin > Settings > Page layout. That editor posts its unsaved draft
 * here; this applies it to the real page: order, visibility, appearance,
 * scoped CSS and custom sections. Nothing is saved or sent anywhere. Messages
 * are accepted only from this site's own origin and from the opener window,
 * drafts are re-validated with resolveLayout, and custom HTML goes through the
 * same sanitiser as the live site.
 */
export function LayoutPreviewBridge({
  target,
  siteText,
  locale = null,
}: {
  target: PageTarget;
  /** The site's text in this page's language, for designs that use it. */
  siteText?: Record<string, string>;
  locale?: Locale | null;
}) {
  useEffect(() => {
    const sections = SECTIONS_BY_TARGET[target];

    const originals = new WeakMap<HTMLElement, ChildNode[]>();

    const apply = (draft: unknown) => {
      const layout: LayoutEntry[] = resolveLayout(draft, sections);
      const container = document.querySelector("[data-layout-id]")?.parentElement;
      if (!container) return;
      const known = new Set(layout.map((e) => e.id));
      for (const el of container.querySelectorAll<HTMLElement>(":scope > [data-layout-id]")) {
        if (!known.has(el.dataset.layoutId!)) el.remove();
      }
      layout.forEach((entry, i) => {
        let el = [...container.children].find(
          (c): c is HTMLElement => c instanceof HTMLElement && c.dataset.layoutId === entry.id
        );
        if (!el) {
          el = document.createElement("div");
          el.dataset.layoutId = entry.id;
          container.appendChild(el);
        }
        el.removeAttribute("style");
        el.className = "";
        Object.assign(el.style, sectionInlineStyle(entry.style));
        el.style.order = String(i + 1);
        if (!entry.visible) el.style.display = "none";
        if (entry.style?.hideOn) el.classList.add(`layout-hide-${entry.style.hideOn}`);
        if (entry.custom) el.classList.add("custom-section");
        for (const [name, value] of Object.entries(optionAttributes(entry.options))) {
          el.setAttribute(name, value);
        }
        if (hasBackgroundLayers(entry.style)) el.classList.add("lay-has-bg");
        if (entry.style?.parallax && entry.style.bgImage) el.classList.add("lay-parallax");
        let layers = el.querySelector<HTMLElement>(":scope > .lay-bg-layers");
        if (hasBackgroundLayers(entry.style)) {
          if (!layers) {
            layers = document.createElement("div");
            layers.className = "lay-bg-layers";
            layers.setAttribute("aria-hidden", "true");
            el.prepend(layers);
          }
          const html = backgroundLayersHtml(entry.style);
          if (layers.dataset.signature !== html) {
            layers.dataset.signature = html;
            layers.innerHTML = html;
          }
        } else layers?.remove();

        const shown = entry.builder
          ? { ...entry, builder: localizeDoc(entry.builder, locale, fromMap(siteText ?? {})) }
          : entry;
        const content = entryContent(shown);
        const scopeClass = `layout-sec-${entry.id}`;
        const scoped = scopeSectionCss(
          `${content?.css ?? ""}\n${entry.style?.css ?? ""}`,
          scopeClass
        );
        if (scoped) el.classList.add(scopeClass);

        let own = el.querySelector<HTMLStyleElement>(":scope > style[data-preview-style]");
        if (scoped) {
          if (!own) {
            own = document.createElement("style");
            own.dataset.previewStyle = "";
            el.prepend(own);
          }
          if (own.textContent !== scoped) own.textContent = scoped;
        } else own?.remove();

        // What replaces the section's markup. A built-in section's original
        // children are kept aside so removing the replacement restores them.
        const holder = el.querySelector<HTMLElement>(":scope > [data-preview-html]");
        if (content) {
          if (!originals.has(el) && !holder) {
            originals.set(
              el,
              [...el.childNodes].filter((n) => !(n instanceof HTMLStyleElement))
            );
          }
          const html = sanitizeSectionHtml(content.html);
          const signature = `${innerClass(content)}\u0000${html}`;
          if (!holder || holder.dataset.signature !== signature) {
            [...el.childNodes].forEach((n) => {
              if (!(n instanceof HTMLStyleElement)) n.remove();
            });
            const next = document.createElement("div");
            next.dataset.previewHtml = "";
            next.dataset.signature = signature;
            const frame = innerClass(content);
            if (frame) next.className = frame;
            next.innerHTML = html;
            // A design's "original content" block shows the section's own markup.
            const saved = originals.get(el);
            next.querySelectorAll<HTMLElement>('[data-bld-live="original"]').forEach((slot) => {
              saved?.forEach((n) => slot.appendChild(n.cloneNode(true)));
            });
            el.appendChild(next);
          }
        } else if (holder) {
          holder.remove();
          originals.get(el)?.forEach((n) => el.appendChild(n));
          originals.delete(el);
        }
      });
      initBuilderRuntime(container);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.opener) return;
      const data = event.data as { type?: string; layout?: unknown; id?: string } | null;
      if (data?.type === "layout-draft") apply(data.layout);
      if (data?.type === "layout-focus" && typeof data.id === "string") {
        const el = [...document.querySelectorAll<HTMLElement>("[data-layout-id]")].find(
          (e) => e.dataset.layoutId === data.id
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.animate(
            [
              { outline: "3px solid #4f46e5", outlineOffset: "-3px" },
              { outline: "3px solid transparent", outlineOffset: "-3px" },
            ],
            { duration: 1400 }
          );
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.opener?.postMessage({ type: "layout-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [target, siteText, locale]);

  return null;
}
