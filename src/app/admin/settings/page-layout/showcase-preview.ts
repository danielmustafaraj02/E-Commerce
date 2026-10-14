import { activeScene, getSceneFrame, railFill } from "@/lib/showcase-timeline";
import {
  showcaseRoot,
  showcaseImageVars,
  showcaseElementVars,
  type ShowcaseSceneKey,
  type ShowcaseSceneOverride,
  type ShowcaseScroll,
} from "@/lib/showcase-options";
import type { BuilderDoc } from "@/lib/section-builder";

/**
 * The collections scroll story in the editor's preview. The preview frame runs
 * no scripts, so the editor itself applies the draft to the real markup the
 * page rendered (texts, links, pictures, sides, colours, what is shown) and,
 * for the scroll preview, writes the same per-scene values the storefront's
 * scroll effect writes, computed with the same timeline functions. Dragging
 * the slider is therefore exactly what a visitor sees at that scroll position.
 */

export type ShowcaseDraft = {
  layout?: "row";
  scenes?: Partial<Record<ShowcaseSceneKey, ShowcaseSceneOverride>>;
  scroll?: ShowcaseScroll;
};

/** The first collections-animation block of a design, if it has one. */
export function findShowcase(doc?: BuilderDoc): ShowcaseDraft | null {
  for (const cell of doc?.cells ?? [])
    for (const block of cell) if (block.type === "showcase") return block;
  return null;
}

/** The pinned stage's height in the preview, in pixels. */
export const PREVIEW_STAGE = 560;

const ROOT_ATTRS = [
  "data-full-screen",
  "data-showcase-style",
  "data-no-rail",
  "data-no-counter",
  "data-no-cta",
  "data-no-text",
  "data-no-hint",
  "data-colors",
];
const ROOT_VARS = ["--sc-bg", "--sc-title", "--sc-text", "--sc-accent", "--sc-accent-text"];
const SCENE_VARS = [
  "--scene-y",
  "--scene-scale",
  "--image-opacity",
  "--copy-opacity",
  "--copy-reveal",
];

/** Remembers an element's original value once, so clearing a field restores it. */
function original(el: HTMLElement, key: string, read: () => string): string {
  const name = `orig${key}`;
  if (el.dataset[name] === undefined) el.dataset[name] = read();
  return el.dataset[name]!;
}

function ctaTextNode(cta: HTMLElement): Text | null {
  for (const node of cta.childNodes)
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return node as Text;
  return null;
}

/** Applies the draft to the preview. Returns false when the page has no
 *  showcase markup to work on. `progress` null shows the scenes stacked. */
export function applyShowcaseDraft(d: Document, draft: ShowcaseDraft, progress: number | null) {
  const root = d.querySelector<HTMLElement>(".showcase");
  if (!root) return false;

  // Options on the root element.
  const { attrs, vars, transition } = showcaseRoot(draft.scroll);
  for (const a of ROOT_ATTRS) root.removeAttribute(a);
  for (const v of ROOT_VARS) root.style.removeProperty(v);
  for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, v);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);

  // Each scene's content.
  const scenes = [...root.querySelectorAll<HTMLElement>("[data-scene]")];
  scenes.forEach((scene) => {
    const key = scene.dataset.placement as ShowcaseSceneKey;
    const o = draft.scenes?.[key] ?? {};
    for (const [name, value] of Object.entries({ ...showcaseImageVars(o), ...showcaseElementVars(o) })) scene.style.setProperty(name, value);
    const title = scene.querySelector<HTMLElement>(".showcase-title");
    if (title) { const text = [...title.childNodes].find((node) => node.nodeType === Node.TEXT_NODE); if (text) text.textContent = o.name ?? original(title, "Text", () => text.textContent ?? ""); }
    const text = scene.querySelector<HTMLElement>(".showcase-description");
    if (text)
      { const node = [...text.childNodes].find((node) => node.nodeType === Node.TEXT_NODE); if (node) node.textContent = o.description ?? original(text, "Text", () => node.textContent ?? ""); }
    const cta = scene.querySelector<HTMLAnchorElement>(".showcase-cta");
    if (cta) {
      const node = ctaTextNode(cta);
      if (node) node.textContent = o.cta ?? original(cta, "Text", () => node.textContent ?? "");
      cta.setAttribute(
        "href",
        o.href ?? original(cta, "Href", () => cta.getAttribute("href") ?? "")
      );
    }
    const img = scene.querySelector<HTMLImageElement>(".showcase-figure img");
    if (img) {
      const src = original(img, "Src", () => img.getAttribute("src") ?? "");
      const srcset = original(img, "Srcset", () => img.getAttribute("srcset") ?? "");
      if (o.image) {
        img.removeAttribute("srcset");
        img.setAttribute("src", o.image);
      } else {
        img.setAttribute("src", src);
        if (srcset) img.setAttribute("srcset", srcset);
      }
    }
    const copy = scene.querySelector<HTMLElement>(".showcase-copy");
    if (copy)
      copy.dataset.side = o.side ?? original(copy, "Side", () => copy.dataset.side ?? "left");
  });

  // The scroll position.
  if (progress === null) {
    root.removeAttribute("data-scene-live");
    root.style.removeProperty("--showcase-stage-h");
    scenes.forEach((s) => SCENE_VARS.forEach((v) => s.style.removeProperty(v)));
    return true;
  }
  root.setAttribute("data-scene-live", "");
  root.style.setProperty("--showcase-sticky-top", "0px");
  root.style.setProperty("--showcase-measured-inset", "12px");
  root.style.setProperty("--showcase-stage-h", `var(--showcase-frame-height, ${PREVIEW_STAGE}px)`);
  const count = scenes.length;
  const stageHeight = root.querySelector<HTMLElement>(".showcase-stage")?.getBoundingClientRect().height || PREVIEW_STAGE;
  const distance = stageHeight * 1.15;
  scenes.forEach((scene, i) => {
    const frame = getSceneFrame(progress, i, count, distance, transition);
    scene.querySelectorAll<HTMLElement>(".showcase-figure,.showcase-title,.showcase-description,.showcase-index,.showcase-cta").forEach((figure) => {
      figure.style.pointerEvents = frame.imageOpacity > 0.1 ? "auto" : "none";
      figure.querySelectorAll<HTMLElement>("[data-scene-resize]").forEach((handle) => {
        handle.style.pointerEvents = frame.imageOpacity > 0.1 ? "auto" : "none";
      });
    });
    scene.style.setProperty("--scene-y", `${frame.y.toFixed(1)}px`);
    if (frame.scale !== undefined) scene.style.setProperty("--scene-scale", frame.scale.toFixed(3));
    else scene.style.removeProperty("--scene-scale");
    scene.style.setProperty("--image-opacity", frame.imageOpacity.toFixed(3));
    scene.style.setProperty("--copy-opacity", frame.copyOpacity.toFixed(3));
    scene.style.setProperty("--copy-reveal", frame.copyOpacity.toFixed(3));
    const rail = scene.querySelector<HTMLElement>(".showcase-rail-scene");
    if (rail) rail.style.opacity = frame.copyOpacity.toFixed(3);
  });
  const current = activeScene(progress, count);
  root
    .querySelectorAll<HTMLElement>(".showcase-rail-fill")
    .forEach((el) => el.style.setProperty("--rail-fill", railFill(progress, count).toFixed(4)));
  root.querySelectorAll<HTMLElement>("[data-rail-item]").forEach((item) => {
    const index = Number(item.dataset.railItem);
    item.dataset.state = index === current ? "active" : index < current ? "passed" : "upcoming";
  });
  return true;
}
