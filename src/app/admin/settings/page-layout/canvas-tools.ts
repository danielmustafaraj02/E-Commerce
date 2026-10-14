import {
  copyLook,
  duplicateBlock,
  groupBlocks,
  patchBlock,
  patchBlockStyle,
  pasteLook,
  removeBlock,
  reorderLayer,
  ungroupBlocks,
  type BlockLookCopy,
  type BlockPos,
} from "@/lib/section-builder-editing";
import { type BuilderBlock, type BuilderDoc } from "@/lib/section-builder";

/**
 * The editing tools of the live canvas, attached to the preview frame's own
 * document (no scripts run inside it): selecting several blocks, moving them
 * with snapping and alignment guides, resizing, nudging with the arrow keys,
 * aligning and distributing, a right-click menu, and a play button for the
 * scroll animations. Every change is one update to the builder document.
 */

export type Device = "computer" | "tablet" | "phone";

export type CanvasApi = {
  getDoc: () => BuilderDoc | undefined;
  update: (change: (doc: BuilderDoc) => BuilderDoc) => void;
  /** `additive` toggles the block in the selection instead of replacing it. */
  select: (pos: BlockPos | null, additive?: boolean) => void;
  getSelection: () => BlockPos[];
  getView: () => { device: Device; grid: boolean };
  undo: () => void;
  redo: () => void;
};

export const SNAP = 6;
const FIXED_HEIGHT = ["spacer", "vline"];
const MEDIA = ["image", "video", "map", "shape"];
const ROTATABLE = ["heading", "text", "image", "video", "button", "shape", "quote", "icon", "badge", "story", "eyebrow"];
const NATIVE_TARGETS = ".bld-story-visual,.bld-story-copy,.bld-story-title,.bld-story-text,.bld-story-cta,.journal-opening,.journal-article-head,.journal-hero,.journal-card-meta,.journal-breadcrumb";
const GUI_TARGETS = `${NATIVE_TARGETS},[data-gui-native-element]`;
const NATIVE_EDITABLE_FIELDS = ['[data-gui-native-element="article-title"]','[data-gui-native-element="article-meta"]','[data-gui-native-element="article-breadcrumb"]','.journal-series-kicker','.journal-language-note','.journal-hero','.bld-story-eyebrow','.bld-story-title','.bld-story-text','.bld-story-cta','.bld-story-card-title','.bld-story-card-price','.bld-story-img'];

const posOf = (el: HTMLElement): BlockPos => {
  const [col, idx] = (el.dataset.bi ?? "0:0").split(":").map(Number);
  return { col, idx };
};
const frameOf = (d: Document, pos: BlockPos) =>
  d.querySelector<HTMLElement>(`[data-bi="${pos.col}:${pos.idx}"]`);
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Style keys for the current device: phones have their own position and size. */
const keysFor = (device: Device) =>
  device === "phone"
    ? ({ x: "mx", y: "my", w: "mw", h: "mh" } as const)
    : ({ x: "x", y: "y", w: "w", h: "h" } as const);

const readOffset = (frame: HTMLElement, device: Device) =>
  device === "phone"
    ? {
        x: parseFloat(frame.style.getPropertyValue("--mx")) || 0,
        y: parseFloat(frame.style.getPropertyValue("--my")) || 0,
      }
    : { x: parseFloat(frame.style.left) || 0, y: parseFloat(frame.style.top) || 0 };

/** Shows a position on the frame straight away, before it is saved. */
function setLiveOffset(frame: HTMLElement, device: Device, x: number, y: number) {
  if (device === "phone") {
    frame.classList.add("bld-mx", "bld-my");
    frame.style.setProperty("--mx", `${x}%`);
    frame.style.setProperty("--my", `${y}rem`);
  } else {
    frame.style.left = `${x}%`;
    frame.style.top = `${y}rem`;
  }
}

// ---- Selection highlight and resize handles --------------------------------

export function applySelection(d: Document, selection: BlockPos[]) {
  d.querySelectorAll(".bld-sel,.bld-multi").forEach((el) =>
    el.classList.remove("bld-sel", "bld-multi")
  );
  d.querySelectorAll(".bld-rz:not([data-scene-resize])").forEach((el) => el.remove());
  d.querySelectorAll(".bld-gui-selected").forEach((el) => el.classList.remove("bld-gui-selected"));
  selection.forEach((pos, i) => {
    const el = frameOf(d, pos);
    if (!el) return;
    el.classList.add(i === 0 ? "bld-sel" : "bld-multi");
    if (selection.length !== 1 || el.classList.contains("bld-locked")) return;
    if (el.dataset.bt === "original") {
      attachNativeElementTools(d, el);
      return;
    }
    const blockType = el.dataset.bt ?? "";
    const handles = FIXED_HEIGHT.includes(blockType)
      ? ["m", "r"]
      : ROTATABLE.includes(blockType)
        ? ["m", "r", "b", "c", "t"]
        : ["m", "r", "b", "c"];
    for (const kind of handles) {
      const h = d.createElement("span");
      h.className = `bld-rz bld-rz-${kind}`;
      h.dataset.rz = kind;
      if (kind === "m") h.textContent = "✥";
      h.title =
        kind === "m"
          ? "Drag to move (blocks can overlap) · double-click to put back · hold Alt to turn snapping off"
          : kind === "r"
            ? "Drag to change the width · double-click to reset"
            : kind === "b"
              ? "Drag to change the height · double-click to reset"
              : kind === "t"
                ? "Drag to rotate this element"
                : "Drag to resize";
      h.setAttribute("draggable", "false");
      el.appendChild(h);
    }
  });
}

/** Add the same drag, resize and rotation handles to individual elements inside native section markup. */
function attachNativeElementTools(d: Document, block: HTMLElement) {
  const scope = block;
  const targets = [...scope.querySelectorAll<HTMLElement>(GUI_TARGETS)];
  targets.forEach((element, index) => {
    if (element.querySelector(":scope > .bld-rz")) return;
    element.classList.add("bld-gui-element");
    element.dataset.guiElement = "true";
    const partKey = element.dataset.guiNativeElement || element.className.split(/\\s+/).find((name) => name.startsWith("journal-") || name.startsWith("bld-story-")) || `element-${index}`;
    const editableSelector = NATIVE_EDITABLE_FIELDS.find((selector) => element.matches(selector));
    if (editableSelector) {
      const editableField = editableSelector.includes("title") ? "title" : editableSelector.includes("text") ? "text" : editableSelector.includes("cta") ? "cta" : editableSelector.includes("card-title") ? "cardTitle" : editableSelector.includes("price") ? "cardPrice" : "number";
      const node = element.matches("img") ? element.parentElement : element;
      if (node && !node.dataset.biField) node.dataset.biField = editableField;
    }
    element.dataset.guiElementKey = partKey;
    let blockVars: Record<string, { x?: number; y?: number; w?: number; h?: number; rotate?: number }> = {};
    try { blockVars = JSON.parse(block.dataset.guiElements || "{}") as typeof blockVars; } catch { /* ignore invalid old draft data */ }
    const vars = blockVars[partKey];
    if (vars?.x !== undefined) { element.dataset.guiX = String(vars.x); element.style.setProperty("--gui-x", `${vars.x}%`); }
    if (vars?.y !== undefined) { element.dataset.guiY = String(vars.y); element.style.setProperty("--gui-y", `${vars.y}%`); }
    if (vars?.w !== undefined) { element.dataset.guiW = String(vars.w); element.style.setProperty("--gui-w", String(vars.w / 100)); }
    if (vars?.h !== undefined) { element.dataset.guiH = String(vars.h); element.style.setProperty("--gui-h", String(vars.h / 100)); }
    if (vars?.rotate !== undefined) { element.dataset.guiRotate = String(vars.rotate); element.style.setProperty("--gui-rotate", `${vars.rotate}deg`); }
    for (const kind of ["m", "r", "b", "t"]) {
      const handle = d.createElement("span");
      handle.className = `bld-rz bld-rz-${kind} bld-gui-handle`;
      handle.dataset.rz = kind;
      handle.textContent = kind === "m" ? "✥" : kind === "t" ? "⟳" : "";
      handle.title = kind === "m" ? "Drag to move" : kind === "t" ? "Drag to rotate" : kind === "r" ? "Drag to resize width" : "Drag to resize height";
      handle.setAttribute("aria-label", handle.title);
      handle.setAttribute("draggable", "false");
      element.appendChild(handle);
    }
  });
}

// ---- Snapping and guides ----------------------------------------------------

function snapAxis(edges: number[], targets: number[]): { delta: number; lines: number[] } {
  let best: number | null = null;
  for (const edge of edges)
    for (const target of targets) {
      const diff = target - edge;
      if (Math.abs(diff) <= SNAP && (best === null || Math.abs(diff) < Math.abs(best))) best = diff;
    }
  if (best === null) return { delta: 0, lines: [] };
  const lines = new Set<number>();
  for (const edge of edges)
    for (const target of targets) if (Math.abs(target - (edge + best)) < 0.5) lines.add(target);
  return { delta: best, lines: [...lines] };
}

type Rect = { left: number; right: number; top: number; bottom: number };
const rectOf = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
};
const union = (rects: Rect[]): Rect => ({
  left: Math.min(...rects.map((r) => r.left)),
  right: Math.max(...rects.map((r) => r.right)),
  top: Math.min(...rects.map((r) => r.top)),
  bottom: Math.max(...rects.map((r) => r.bottom)),
});

/** Where a dragged block can line up: the other blocks, the columns, the whole
 *  design and, when shown, the 12-column grid. */
function alignTargets(d: Document, skip: Set<HTMLElement>, grid: boolean) {
  const xs: number[] = [];
  const ys: number[] = [];
  const others: Rect[] = [];
  const add = (r: DOMRect) => {
    xs.push(r.left, r.left + r.width / 2, r.right);
    ys.push(r.top, r.top + r.height / 2, r.bottom);
  };
  d.querySelectorAll<HTMLElement>(".bld-e:not(.bld-ghost)").forEach((el) => {
    if (skip.has(el)) return;
    add(el.getBoundingClientRect());
    others.push(rectOf(el));
  });
  d.querySelectorAll<HTMLElement>("[data-bi-col], .bld").forEach((el) =>
    add(el.getBoundingClientRect())
  );
  if (grid) {
    const area = d.querySelector<HTMLElement>(".bld");
    if (area) {
      const r = area.getBoundingClientRect();
      for (let i = 0; i <= 12; i++) xs.push(r.left + (r.width * i) / 12);
    }
  }
  return { xs, ys, others };
}

/** Targets that make the gap to the nearest block above or below equal to a gap
 *  already used between two other blocks. */
function gapTargets(rect: Rect, others: Rect[]) {
  const overlap = (o: Rect) => o.right > rect.left && o.left < rect.right;
  const column = others.filter(overlap).sort((a, b) => a.top - b.top);
  const gaps: number[] = [];
  for (let i = 1; i < column.length; i++) {
    const g = column[i].top - column[i - 1].bottom;
    if (g > 2 && g < 400) gaps.push(g);
  }
  const above = column.filter((o) => o.bottom <= rect.top + SNAP).pop();
  const below = column.find((o) => o.top >= rect.bottom - SNAP);
  return {
    top: above ? gaps.map((g) => above.bottom + g) : [],
    bottom: below ? gaps.map((g) => below.top - g) : [],
  };
}

function showGuides(d: Document, xs: number[], ys: number[]) {
  clearGuides(d);
  for (const x of xs) {
    const g = d.createElement("div");
    g.className = "bld-guide bld-guide-v";
    g.style.left = `${Math.round(x)}px`;
    d.body.appendChild(g);
  }
  for (const y of ys) {
    const g = d.createElement("div");
    g.className = "bld-guide bld-guide-h";
    g.style.top = `${Math.round(y)}px`;
    d.body.appendChild(g);
  }
}

/** Pixel gaps between the dragged block and the blocks around it. */
function showGaps(d: Document, rect: Rect, others: Rect[]) {
  d.querySelectorAll(".bld-gap").forEach((el) => el.remove());
  const label = (x: number, y: number, px: number) => {
    if (px < 1) return;
    const el = d.createElement("div");
    el.className = "bld-gap";
    el.textContent = `${Math.round(px)}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    d.body.appendChild(el);
  };
  const hOverlap = (o: Rect) => o.right > rect.left && o.left < rect.right;
  const vOverlap = (o: Rect) => o.bottom > rect.top && o.top < rect.bottom;
  const above = others
    .filter((o) => hOverlap(o) && o.bottom <= rect.top)
    .sort((a, b) => b.bottom - a.bottom)[0];
  const below = others
    .filter((o) => hOverlap(o) && o.top >= rect.bottom)
    .sort((a, b) => a.top - b.top)[0];
  const left = others
    .filter((o) => vOverlap(o) && o.right <= rect.left)
    .sort((a, b) => b.right - a.right)[0];
  const right = others
    .filter((o) => vOverlap(o) && o.left >= rect.right)
    .sort((a, b) => a.left - b.left)[0];
  const midX = (rect.left + rect.right) / 2;
  const midY = (rect.top + rect.bottom) / 2;
  if (above) label(midX, (above.bottom + rect.top) / 2, rect.top - above.bottom);
  if (below) label(midX, (rect.bottom + below.top) / 2, below.top - rect.bottom);
  if (left) label((left.right + rect.left) / 2, midY, rect.left - left.right);
  if (right) label((rect.right + right.left) / 2, midY, right.left - rect.right);
}

function clearGuides(d: Document) {
  d.querySelectorAll(".bld-guide,.bld-gap").forEach((el) => el.remove());
}

// ---- 12-column grid ----------------------------------------------------------

export function syncGrid(d: Document, on: boolean) {
  d.querySelectorAll(".bld-grid").forEach((el) => el.remove());
  const area = d.querySelector<HTMLElement>(".bld");
  if (!on || !area) return;
  area.style.position = "relative";
  const grid = d.createElement("div");
  grid.className = "bld-grid";
  grid.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 12; i++) grid.appendChild(d.createElement("i"));
  area.appendChild(grid);
}

// ---- Copied look (one clipboard for the whole page) -----------------------------

let lookClipboard: BlockLookCopy | null = null;
export const hasCopiedLook = () => lookClipboard !== null;
export const getCopiedLook = () => lookClipboard;
export const setCopiedLook = (look: BlockLookCopy) => {
  lookClipboard = look;
};

// ---- Aligning ------------------------------------------------------------------

export type AlignKind =
  | "left"
  | "hcenter"
  | "right"
  | "top"
  | "vmiddle"
  | "bottom"
  | "same-width"
  | "same-height"
  | "distribute-h"
  | "distribute-v";

/** Aligns the selection: one block aligns within its column, several align to
 *  each other. Everything is saved as one change. */
export function alignSelection(d: Document, api: CanvasApi, kind: AlignKind) {
  const { device } = api.getView();
  const keys = keysFor(device);
  const doc = api.getDoc();
  if (!doc) return;
  const items = api
    .getSelection()
    .map((pos) => ({ pos, frame: frameOf(d, pos) }))
    .filter(
      (i): i is { pos: BlockPos; frame: HTMLElement } =>
        !!i.frame && !i.frame.classList.contains("bld-locked")
    );
  if (items.length === 0) return;
  const rem = parseFloat(getComputedStyle(d.documentElement).fontSize) || 16;
  const rects = items.map((i) => rectOf(i.frame));
  const ref =
    items.length === 1
      ? rectOf(items[0].frame.closest<HTMLElement>("[data-bi-col]") ?? items[0].frame)
      : union(rects);
  const colW = (frame: HTMLElement) =>
    frame.closest<HTMLElement>("[data-bi-col]")?.getBoundingClientRect().width ||
    frame.getBoundingClientRect().width;

  const shift = new Map<number, { dx: number; dy: number }>();
  const set = (i: number, dx: number, dy: number) => shift.set(i, { dx, dy });
  let sizes: Map<number, { w?: number; h?: number }> | null = null;

  if (kind === "left") rects.forEach((r, i) => set(i, ref.left - r.left, 0));
  else if (kind === "right") rects.forEach((r, i) => set(i, ref.right - r.right, 0));
  else if (kind === "hcenter")
    rects.forEach((r, i) => set(i, (ref.left + ref.right) / 2 - (r.left + r.right) / 2, 0));
  else if (kind === "top") rects.forEach((r, i) => set(i, 0, ref.top - r.top));
  else if (kind === "bottom") rects.forEach((r, i) => set(i, 0, ref.bottom - r.bottom));
  else if (kind === "vmiddle")
    rects.forEach((r, i) => set(i, 0, (ref.top + ref.bottom) / 2 - (r.top + r.bottom) / 2));
  else if (kind === "same-width" || kind === "same-height") {
    if (items.length < 2) return;
    sizes = new Map();
    items.forEach((it, i) => {
      if (kind === "same-width")
        sizes!.set(i, { w: round1(((rects[0].right - rects[0].left) / colW(it.frame)) * 100) });
      else sizes!.set(i, { h: round1((rects[0].bottom - rects[0].top) / rem) });
    });
  } else if (kind === "distribute-h" || kind === "distribute-v") {
    if (items.length < 3) return;
    const horizontal = kind === "distribute-h";
    const order = rects
      .map((r, i) => ({ r, i }))
      .sort((a, b) => (horizontal ? a.r.left - b.r.left : a.r.top - b.r.top));
    const total = horizontal ? ref.right - ref.left : ref.bottom - ref.top;
    const used = order.reduce(
      (n, o) => n + (horizontal ? o.r.right - o.r.left : o.r.bottom - o.r.top),
      0
    );
    const gap = (total - used) / (order.length - 1);
    let cursor = horizontal ? ref.left : ref.top;
    order.forEach((o) => {
      const delta = cursor - (horizontal ? o.r.left : o.r.top);
      if (horizontal) set(o.i, delta, 0);
      else set(o.i, 0, delta);
      cursor += (horizontal ? o.r.right - o.r.left : o.r.bottom - o.r.top) + gap;
    });
  }

  api.update((current) =>
    items.reduce((next, it, i) => {
      const s = shift.get(i);
      if (s) {
        const now = readOffset(it.frame, device);
        const x = clamp(round1(now.x + (s.dx / colW(it.frame)) * 100), -60, 60);
        const y = clamp(round1(now.y + s.dy / rem), -30, 30);
        return patchBlockStyle(next, it.pos, {
          [keys.x]: Math.abs(x) < 0.05 ? undefined : x,
          [keys.y]: Math.abs(y) < 0.05 ? undefined : y,
        });
      }
      const size = sizes?.get(i);
      return size ? patchBlockStyle(next, it.pos, { [keys.w]: size.w, [keys.h]: size.h }) : next;
    }, current)
  );
}

// ---- Playing the scroll animations in the canvas --------------------------------

/** Replays every scroll animation in the preview: hides the animated blocks,
 *  then brings them in one after another in their order, as visitors see it. */
export function playAnimations(d: Document) {
  const body = d.body;
  const all = [...d.querySelectorAll<HTMLElement>(".bld-an")];
  if (all.length === 0) return 0;
  body.classList.remove("bld-playing");
  all.forEach((el) => el.classList.remove("bld-in"));
  body.classList.add("bld-playing");
  void body.offsetWidth;
  let longest = 0;
  d.querySelectorAll<HTMLElement>(".bld").forEach((group) => {
    const step = Number(group.dataset.bmStagger ?? 150);
    const els = all
      .filter((el) => group.contains(el))
      .sort(
        (a, b) =>
          Number(a.dataset.bmOrder ?? 100) - Number(b.dataset.bmOrder ?? 100) ||
          (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
      );
    els.forEach((el, i) => {
      const delay = Number(el.dataset.bmDelay ?? 0) + i * step;
      el.style.setProperty("--bm-del", `${delay}ms`);
      el.classList.add("bld-in");
      longest = Math.max(longest, delay);
    });
  });
  const total = longest + 2500;
  window.setTimeout(() => body.classList.remove("bld-playing"), total);
  return total;
}

// ---- Right-click menu --------------------------------------------------------------

function openMenu(d: Document, api: CanvasApi, x: number, y: number) {
  d.querySelectorAll(".bld-ctx").forEach((el) => el.remove());
  const selection = api.getSelection();
  const doc = api.getDoc();
  if (!doc || selection.length === 0) return;
  const primary = doc.cells[selection[0].col]?.[selection[0].idx];
  if (!primary) return;
  const many = selection.length > 1;
  const menu = d.createElement("div");
  menu.className = "bld-ctx";
  const close = () => {
    menu.remove();
    d.removeEventListener("click", close, true);
    d.removeEventListener("keydown", onEsc, true);
  };
  const onEsc = (e: KeyboardEvent) => e.key === "Escape" && close();
  const item = (label: string, run: (() => void) | null) => {
    const b = d.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (!run) b.disabled = true;
    else
      b.addEventListener("click", () => {
        close();
        run();
      });
    menu.appendChild(b);
  };
  const rule = () => menu.appendChild(d.createElement("hr"));
  const each = (fn: (doc: BuilderDoc, pos: BlockPos) => BuilderDoc) =>
    api.update((current) => selection.reduce(fn, current));

  item("Duplicate", () => api.update((c) => duplicateBlock(c, selection[0])));
  item("Copy look (style, effects, animation)", () => {
    lookClipboard = copyLook(primary);
  });
  item(
    "Paste look",
    lookClipboard ? () => each((c, p) => pasteLook(c, [p], lookClipboard!)) : null
  );
  rule();
  item("Bring to front", () => each((c, p) => reorderLayer(c, p, "front")));
  item("Send to back", () => each((c, p) => reorderLayer(c, p, "back")));
  rule();
  item(primary.locked ? "Unlock" : "Lock position", () =>
    each((c, p) => patchBlock(c, p, { locked: primary.locked ? undefined : true }))
  );
  item("Hide in this editor", () => each((c, p) => patchBlock(c, p, { ghost: true })));
  if (many) item("Group these blocks", () => api.update((c) => groupBlocks(c, selection)));
  if (selection.some((p) => doc.cells[p.col]?.[p.idx]?.group))
    item("Ungroup", () => api.update((c) => ungroupBlocks(c, selection)));
  item("Reset position and size", () =>
    each((c, p) =>
      patchBlockStyle(c, p, {
        x: undefined,
        y: undefined,
        w: undefined,
        h: undefined,
        mx: undefined,
        my: undefined,
        mw: undefined,
        mh: undefined,
      })
    )
  );
  rule();
  item(many ? `Delete ${selection.length} blocks` : "Delete", () => {
    api.update((c) => removeBlock(c, selection));
    api.select(null);
  });

  d.body.appendChild(menu);
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  menu.style.left = `${Math.max(4, Math.min(x, d.documentElement.clientWidth - w - 4))}px`;
  menu.style.top = `${Math.max(4, Math.min(y, d.documentElement.clientHeight - h - 4))}px`;
  window.setTimeout(() => {
    d.addEventListener("click", close, true);
    d.addEventListener("keydown", onEsc, true);
  });
}

// ---- Pointer tools: move, resize ---------------------------------------------------

function patchPicture(doc: BuilderDoc, pos: BlockPos, patch: Record<string, unknown>) {
  return patchBlock(doc, pos, patch);
}

export function attachTools(d: Document, api: CanvasApi) {
  // Resize the picture itself, rather than the wrapper around an animated section.
  d.querySelectorAll<HTMLElement>(".showcase-figure,.bld-story-visual,.showcase-title,.showcase-description,.showcase-index,.showcase-cta").forEach((figure) => {
    const frame = figure.closest<HTMLElement>("[data-bi]");
    if (!frame) return;
    const part = figure.matches(".showcase-title") ? "title" : figure.matches(".showcase-description") ? "description" : figure.matches(".showcase-index") ? "counter" : figure.matches(".showcase-cta") ? "button" : "image";
    const handles = ["m", "r", "b", "c"].map((kind) => {
      const control = d.createElement("span");
      control.dataset.sceneResize = part;
      control.dataset.sceneHandle = kind;
      control.className = `bld-rz bld-rz-${kind} bld-scene-control`;
      control.textContent = kind === "m" ? "✥" : "";
      control.title = kind === "m" ? "Drag to move · double-click to reset" : "Drag to resize · double-click to reset";
      control.setAttribute("aria-label", kind === "m" ? `Move ${part}` : `Resize ${part}`);
      control.setAttribute("draggable", "false");
      figure.appendChild(control);
      return control;
    });
    figure.classList.add("bld-scene-element");
    if (part !== "image") figure.style.position = "relative";
    const sceneElement = figure.closest<HTMLElement>("[data-scene]");
    const initialOpacity = sceneElement?.style.getPropertyValue("--image-opacity");
    const interactive = !initialOpacity || Number(initialOpacity) > 0.1;
    figure.style.pointerEvents = interactive ? "auto" : "none";
    handles.forEach((control) => { control.style.pointerEvents = interactive ? "auto" : "none"; });
    figure.style.cursor = "move";
    figure.style.touchAction = "none";
    figure.addEventListener("dragstart", (event) => event.preventDefault());
    figure.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || frame.classList.contains("bld-locked")) return;
      event.preventDefault();
      event.stopPropagation();
      const pos = posOf(frame);
      const block = api.getDoc()?.cells[pos.col]?.[pos.idx];
      const scene = figure.closest<HTMLElement>("[data-placement]")?.dataset.placement as "necklace" | "bracelet" | "earrings" | undefined;
      if (!block || (block.type !== "showcase" && block.type !== "story")) return;
      const geometry = block.type === "showcase" ? block.scenes?.[scene ?? "necklace"] : block;
      const values = geometry as Record<string, number | undefined> | undefined;
      const initial = { imageScale: values?.[`${part}Scale`] ?? 100, imageX: values?.[`${part}X`] ?? 0, imageY: values?.[`${part}Y`] ?? 0 };
      const next = { ...initial };
      const rect = figure.getBoundingClientRect();
      const activeControl = (event.target as Element).closest<HTMLElement>("[data-scene-handle]");
      const kind = activeControl?.dataset.sceneHandle;
      const resizing = kind !== undefined && kind !== "m";
      d.querySelectorAll(".bld-scene-selected").forEach((el) => el.classList.remove("bld-scene-selected"));
      figure.classList.add("bld-scene-selected");
      const target = block.type === "showcase" ? figure.closest<HTMLElement>("[data-scene]")! : figure.querySelector<HTMLElement>(".bld-story-media")!;
      const prefix = block.type === "showcase" ? `sc-${part}` : "story";
      figure.setPointerCapture(event.pointerId);
      const move = (e: PointerEvent) => {
        if (resizing) {
          const dx = (e.clientX - event.clientX) / Math.max(rect.width, 1);
          const dy = (e.clientY - event.clientY) / Math.max(rect.height, 1);
          const change = kind === "b" ? dy : kind === "r" ? dx : Math.abs(dx) >= Math.abs(dy) ? dx : dy;
          next.imageScale = Math.round(Math.max(20, Math.min(250, initial.imageScale + 200 * change)));
        }
        else {
          next.imageX = Math.round(Math.max(part === "image" ? -50 : -200, Math.min(part === "image" ? 50 : 200, initial.imageX + 100 * (e.clientX - event.clientX) / Math.max(rect.width, 1))));
          next.imageY = Math.round(Math.max(part === "image" ? -50 : -200, Math.min(part === "image" ? 50 : 200, initial.imageY + 100 * (e.clientY - event.clientY) / Math.max(rect.height, 1))));
        }
        target.style.setProperty(`--${prefix}-scale`, String(next.imageScale / 100));
        target.style.setProperty(`--${prefix}-x`, `${next.imageX}%`);
        target.style.setProperty(`--${prefix}-y`, `${next.imageY}%`);
        if (activeControl) activeControl.title = `Size: ${next.imageScale}%`;
      };
      const up = () => {
        figure.removeEventListener("pointermove", move);
        figure.removeEventListener("pointerup", up);
        figure.removeEventListener("pointercancel", up);
        api.update((doc) => patchPicture(doc, pos, block.type === "showcase"
          ? { scenes: { ...block.scenes, [scene ?? "necklace"]: { ...geometry, [`${part}Scale`]: next.imageScale, [`${part}X`]: next.imageX, [`${part}Y`]: next.imageY } } }
          : { ...next, imageScale: Math.max(25, Math.min(200, next.imageScale)) }));
      };
      figure.addEventListener("pointermove", move);
      figure.addEventListener("pointerup", up);
      figure.addEventListener("pointercancel", up);
    });
    if (part === "title" || part === "description" || part === "button") {
      figure.addEventListener("dblclick", (event) => {
        if ((event.target as Element).closest("[data-scene-handle]")) return;
        event.preventDefault();
        event.stopPropagation();
        const node = [...figure.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
        if (!node) return;
        const editor = d.createElement("span");
        editor.contentEditable = "true";
        editor.textContent = node.textContent;
        node.replaceWith(editor);
        editor.addEventListener("pointerdown", (event) => event.stopPropagation());
        editor.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); editor.blur(); } });
        editor.addEventListener("blur", () => {
          const text = editor.textContent ?? "";
          editor.replaceWith(d.createTextNode(text));
          const pos = posOf(frame);
          const scene = sceneElement?.dataset.placement as "necklace" | "bracelet" | "earrings";
          api.update((doc) => {
            const block = doc.cells[pos.col]?.[pos.idx];
            if (block?.type !== "showcase") return doc;
            const field = part === "title" ? "name" : part === "button" ? "cta" : "description";
            return patchPicture(doc, pos, { scenes: { ...block.scenes, [scene]: { ...block.scenes?.[scene], [field]: text } } });
          });
        }, { once: true });
        editor.focus();
      });
    }
    handles.forEach((control) => control.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      const pos = posOf(frame);
      const block = api.getDoc()?.cells[pos.col]?.[pos.idx];
      const scene = figure.closest<HTMLElement>("[data-placement]")?.dataset.placement as "necklace" | "bracelet" | "earrings" | undefined;
      const reset = { [`${part}Scale`]: undefined, [`${part}X`]: undefined, [`${part}Y`]: undefined };
      if (block?.type === "showcase") api.update((doc) => patchPicture(doc, pos, { scenes: { ...block.scenes, [scene ?? "necklace"]: { ...block.scenes?.[scene ?? "necklace"], ...reset } } }));
      else if (block?.type === "story") api.update((doc) => patchPicture(doc, pos, reset));
    }));
  });

  d.addEventListener("mousedown", (e) => {
    if ((e.target as Element).closest(".bld-rz")) e.preventDefault();
  });

  d.addEventListener("dblclick", (e) => {
    const handle = (e.target as Element).closest<HTMLElement>(".bld-rz");
    if (!handle) return;
    const native = handle.closest<HTMLElement>("[data-gui-element]");
    const block = handle.closest<HTMLElement>("[data-bi]");
    if (native) {
      const property = handle.dataset.rz === "m" ? "--gui-x" : handle.dataset.rz === "t" ? "--gui-rotate" : handle.dataset.rz === "r" ? "--gui-w" : "--gui-h";
      native.style.removeProperty(property);
      native.style.removeProperty(`${property}-base`);
      native.classList.remove("bld-gui-selected");
      return;
    }
    if (!block) return;
    const kind = handle.dataset.rz;
    const keys = keysFor(api.getView().device);
    const pos = posOf(block);
    api.update((doc) =>
      patchBlockStyle(doc, pos, {
        ...(kind === "m" && { [keys.x]: undefined, [keys.y]: undefined }),
        ...((kind === "r" || kind === "c") && { [keys.w]: undefined }),
        ...((kind === "b" || kind === "c") && { [keys.h]: undefined }),
        ...(kind === "t" && { rotate: undefined }),
      })
    );
  });

  d.addEventListener("click", (event) => {
    const target = event.target as Element;
    const element = target.closest<HTMLElement>("[data-gui-element]");
    if (!element || element.closest("[data-bi]")) return;
    d.querySelectorAll(".bld-gui-selected").forEach((item) => item.classList.remove("bld-gui-selected"));
    element.classList.add("bld-gui-selected");
    const native = element.closest<HTMLElement>(".journal-opening");
    const scope = native ?? element;
    const parts = [...scope.querySelectorAll<HTMLElement>("[data-gui-native-element]")];
    parts.forEach((part) => { part.dataset.guiNativeElement ||= part.className.split(/\\s+/).find((name) => name.startsWith("journal-")) ?? "element"; });
    attachNativeElementTools(d, native ?? element);
  });

  d.addEventListener("contextmenu", (e) => {
    const block = (e.target as Element).closest<HTMLElement>("[data-bi]");
    if (!block) return;
    e.preventDefault();
    const pos = posOf(block);
    const inSelection = api.getSelection().some((p) => p.col === pos.col && p.idx === pos.idx);
    if (!inSelection) api.select(pos);
    // Let the selection update land before the menu reads it.
    window.setTimeout(() => openMenu(d, api, e.clientX, e.clientY), 30);
  });

  d.addEventListener("pointerdown", (e) => {
    const handle = (e.target as Element).closest<HTMLElement>(".bld-rz");
    if (!handle || e.button !== 0) return;
    const native = handle.closest<HTMLElement>("[data-gui-element]");
    if (native) {
      e.preventDefault();
      const block = native.closest<HTMLElement>("[data-bi]");
      if (!block) return;
      const pos = posOf(block);
      const kind = handle.dataset.rz!;
      const start = native.getBoundingClientRect();
      const baseX = Number(native.dataset.guiX ?? 0);
      const baseY = Number(native.dataset.guiY ?? 0);
      const baseW = Number(native.dataset.guiW ?? 100);
      const baseH = Number(native.dataset.guiH ?? 100);
      const elementKey = native.dataset.guiElementKey ?? "element";
      const storedGui = api.getDoc()?.cells[pos.col]?.[pos.idx]?.guiElements?.[elementKey];
      const startX = storedGui?.x ?? baseX;
      const startY = storedGui?.y ?? baseY;
      const startW = storedGui?.w ?? baseW;
      const startH = storedGui?.h ?? baseH;
      const startRotate = storedGui?.rotate ?? 0;
      const existingX = storedGui?.x ?? 0;
      const existingY = storedGui?.y ?? 0;
      const existingW = storedGui?.w ?? 100;
      const existingH = storedGui?.h ?? 100;
      const existingRotate = storedGui?.rotate ?? 0;
      const center = { x: start.left + start.width / 2, y: start.top + start.height / 2 };
      const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
      handle.setPointerCapture(e.pointerId);
      const moveNative = (event: PointerEvent) => {
        if (kind === "m") {
          // Snap the element's edges and centre to the other elements, its
          // block and the section, showing the lines it lines up with.
          let dx = event.clientX - e.clientX;
          let dy = event.clientY - e.clientY;
          if (!event.altKey) {
            const xs: number[] = [];
            const ys: number[] = [];
            const add = (r: DOMRect) => {
              xs.push(r.left, r.left + r.width / 2, r.right);
              ys.push(r.top, r.top + r.height / 2, r.bottom);
            };
            d.querySelectorAll<HTMLElement>("[data-gui-element]").forEach((el) => {
              if (el !== native && !native.contains(el) && !el.contains(native)) add(el.getBoundingClientRect());
            });
            add(block.getBoundingClientRect());
            const area = d.querySelector<HTMLElement>(".bld");
            if (area) add(area.getBoundingClientRect());
            const sx = snapAxis([start.left + dx, start.left + dx + start.width / 2, start.right + dx], xs);
            const sy = snapAxis([start.top + dy, start.top + dy + start.height / 2, start.bottom + dy], ys);
            dx += sx.delta;
            dy += sy.delta;
            showGuides(d, sx.lines, sy.lines);
          } else clearGuides(d);
          const x = Math.max(-100, Math.min(100, startX + (100 * dx) / Math.max(start.width, 1)));
          const y = Math.max(-100, Math.min(100, startY + (100 * dy) / Math.max(start.height, 1)));
          native.dataset.guiX = String(x);
          native.dataset.guiY = String(y);
          native.style.setProperty("--gui-x", `${x - existingX}%`);
          native.style.setProperty("--gui-y", `${y - existingY}%`);
          tipText(native, `${Math.round(x)}% · ${Math.round(y)}%`);
        } else if (kind === "t") {
          const angle = Math.atan2(event.clientY - center.y, event.clientX - center.x);
          const rotation = Math.round(Math.max(-180, Math.min(180, startRotate + ((angle - startAngle) * 180) / Math.PI)));
          native.style.setProperty("--gui-rotate", `${rotation - existingRotate}deg`);
          tipText(native, `${rotation}°`);
        } else {
          const factor = kind === "r" ? (event.clientX - e.clientX) / Math.max(start.width, 1) : (event.clientY - e.clientY) / Math.max(start.height, 1);
          const size = Math.max(25, Math.min(200, (kind === "r" ? startW : startH) + factor * 100));
          const prop = kind === "r" ? "--gui-w" : "--gui-h";
          native.style.setProperty(prop, String(size / (kind === "r" ? existingW : existingH)));
          tipText(native, `${Math.round(size)}%`);
        }
      };
      const upNative = () => {
        handle.removeEventListener("pointermove", moveNative);
        handle.removeEventListener("pointerup", upNative);
        handle.removeEventListener("pointercancel", upNative);
        native.querySelector(":scope > .bld-gui-tip")?.remove();
        clearGuides(d);
        api.update((current) => {
          const nativeVars = {
            x: native.style.getPropertyValue("--gui-x") ? Number.parseFloat(native.style.getPropertyValue("--gui-x")) : undefined,
            y: native.style.getPropertyValue("--gui-y") ? Number.parseFloat(native.style.getPropertyValue("--gui-y")) : undefined,
            w: native.style.getPropertyValue("--gui-w") ? Number(native.style.getPropertyValue("--gui-w")) * 100 : undefined,
            h: native.style.getPropertyValue("--gui-h") ? Number(native.style.getPropertyValue("--gui-h")) * 100 : undefined,
            rotate: native.style.getPropertyValue("--gui-rotate") ? existingRotate + Number.parseFloat(native.style.getPropertyValue("--gui-rotate")) : undefined,
          };
          const blockNow = current.cells[pos.col]?.[pos.idx];
          if (!blockNow || blockNow.type !== "original") return current;
          const merged = { ...blockNow.guiElements, [elementKey]: nativeVars };
          return patchBlock(current, pos, { guiElements: merged } as Partial<BuilderBlock>);
        });
      };
      const tipText = (element: HTMLElement, text: string) => {
        let tip = element.querySelector<HTMLElement>(":scope > .bld-gui-tip");
        if (!tip) { tip = d.createElement("span"); tip.className = "bld-gui-tip"; element.appendChild(tip); }
        tip.textContent = text;
      };
      handle.addEventListener("pointermove", moveNative);
      handle.addEventListener("pointerup", upNative);
      handle.addEventListener("pointercancel", upNative);
      return;
    }
    const block = handle.closest<HTMLElement>("[data-bi]");
    if (!block) return;
    e.preventDefault();
    const kind = handle.dataset.rz!;
    const { device, grid } = api.getView();
    const keys = keysFor(device);
    const doc = api.getDoc();
    const pos = posOf(block);
    const selection = api.getSelection();
    const col = block.closest<HTMLElement>("[data-bi-col]");
    const colWidth = col?.getBoundingClientRect().width ?? block.getBoundingClientRect().width;
    const rem = parseFloat(getComputedStyle(d.documentElement).fontSize) || 16;
    const start = block.getBoundingClientRect();
    const media = MEDIA.includes(block.dataset.bt ?? "");
    const inner = block.querySelector<HTMLElement>("img,video,iframe");
    const tip = d.createElement("span");
    tip.className = "bld-rz-tip";
    block.appendChild(tip);
    handle.setPointerCapture(e.pointerId);

    // A move carries every selected block along (a group is selected together).
    const movers = (kind === "m" && selection.length > 1 ? selection : [pos])
      .map((p) => ({ pos: p, frame: frameOf(d, p) }))
      .filter(
        (m): m is { pos: BlockPos; frame: HTMLElement } =>
          !!m.frame && !m.frame.classList.contains("bld-locked")
      )
      .map((m) => ({
        ...m,
        start: readOffset(m.frame, device),
        rect: rectOf(m.frame),
        colW:
          m.frame.closest<HTMLElement>("[data-bi-col]")?.getBoundingClientRect().width ?? colWidth,
      }));
    const moving = new Set(movers.map((m) => m.frame));
    const targets = alignTargets(d, kind === "m" ? moving : new Set([block]), grid);
    const movingBox = union(movers.map((m) => m.rect));
    let result: Map<string, { x: number; y: number }> | null = null;
    let w: number | undefined;
    let h: number | undefined;
    const initialRotate = doc?.cells[pos.col]?.[pos.idx]?.style?.rotate ?? 0;
    let rotate: number | undefined;
    const centre = { x: start.left + start.width / 2, y: start.top + start.height / 2 };
    const startAngle = Math.atan2(e.clientY - centre.y, e.clientX - centre.x);

    const move = (ev: PointerEvent) => {
      if (kind === "m") {
        let dx = ev.clientX - e.clientX;
        let dy = ev.clientY - e.clientY;
        let guideX: number[] = [];
        let guideY: number[] = [];
        if (!ev.altKey) {
          const sx = snapAxis(
            [
              movingBox.left + dx,
              (movingBox.left + movingBox.right) / 2 + dx,
              movingBox.right + dx,
            ],
            targets.xs
          );
          const probe = {
            left: movingBox.left + dx + sx.delta,
            right: movingBox.right + dx + sx.delta,
            top: movingBox.top + dy,
            bottom: movingBox.bottom + dy,
          };
          const sy = snapAxis(
            [probe.top, (probe.top + probe.bottom) / 2, probe.bottom],
            targets.ys
          );
          const gaps = gapTargets(probe, targets.others);
          const gt = snapAxis([probe.top], gaps.top);
          const gb = snapAxis([probe.bottom], gaps.bottom);
          const yBest = [sy, gt, gb]
            .filter((s) => s.delta !== 0)
            .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0];
          dx += sx.delta;
          dy += yBest?.delta ?? 0;
          guideX = sx.lines;
          guideY = yBest === sy ? sy.lines : [];
        }
        const box = {
          left: movingBox.left + dx,
          right: movingBox.right + dx,
          top: movingBox.top + dy,
          bottom: movingBox.bottom + dy,
        };
        showGuides(d, guideX, guideY);
        showGaps(d, box, targets.others);
        result = new Map();
        for (const m of movers) {
          const x = clamp(round1(m.start.x + (dx / m.colW) * 100), -60, 60);
          const y = clamp(round1(m.start.y + dy / rem), -30, 30);
          result.set(`${m.pos.col}:${m.pos.idx}`, { x, y });
          setLiveOffset(m.frame, device, x, y);
          m.frame.style.zIndex = "10";
        }
        const own = result.get(`${pos.col}:${pos.idx}`);
        if (own) tip.textContent = `${own.x}% , ${own.y}rem`;
        return;
      }
      if (kind === "r" || kind === "c") {
        const apply = (px: number) => {
          const clamped = Math.min(colWidth * 2, Math.max(colWidth * 0.1, px));
          w = Math.round((clamped / colWidth) * 1000) / 10;
          if (device === "phone") {
            block.classList.add("bld-mw");
            block.style.setProperty("--mw", `${w}%`);
          } else {
            block.style.width = `${w}%`;
            block.style.marginInline = w < 100 ? "auto" : "";
          }
        };
        apply(start.width + ev.clientX - e.clientX);
        if (!ev.altKey) {
          // Line the right edge up with a neighbour, then re-measure once: a
          // centred block moves its edge by half of any width change.
          const snap = snapAxis([block.getBoundingClientRect().right], targets.xs);
          if (snap.delta) {
            apply(block.getBoundingClientRect().width + snap.delta * (w! < 100 ? 2 : 1));
            showGuides(d, snapAxis([block.getBoundingClientRect().right], targets.xs).lines, []);
          } else clearGuides(d);
        }
      }
      if (kind === "t") {
        const angle = Math.atan2(ev.clientY - centre.y, ev.clientX - centre.x);
        const delta = ((angle - startAngle) * 180) / Math.PI;
        rotate = Math.round(Math.max(-180, Math.min(180, initialRotate + delta)));
        block.style.setProperty("--bld-rotate", `${rotate}deg`);
        tip.textContent = `${rotate}°`;
        return;
      }
      if (kind === "b" || kind === "c") {
        let px = Math.max(2 * rem, start.height + ev.clientY - e.clientY);
        let guideY: number[] = [];
        if (!ev.altKey) {
          const snap = snapAxis([start.top + px], targets.ys);
          px += snap.delta;
          guideY = snap.lines;
        }
        if (kind === "b") showGuides(d, [], guideY);
        h = Math.min(60, Math.round((px / rem) * 10) / 10);
        if (device === "phone") {
          block.classList.add("bld-mh");
          block.style.setProperty("--mh", `${h}rem`);
        } else block.style[media ? "height" : "minHeight"] = `${h}rem`;
        if (block.dataset.bt === "showcase") block.style.setProperty("--showcase-frame-height", `${h}rem`);
        if (media && inner) {
          inner.style.height = "100%";
          inner.style.objectFit = "cover";
        }
      }
      tip.textContent = [w !== undefined && `${w}%`, h !== undefined && `${h}rem`]
        .filter(Boolean)
        .join(" × ");
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      tip.remove();
      clearGuides(d);
      if (result) {
        const final = result;
        api.update((current) =>
          movers.reduce((next, m) => {
            const r = final.get(`${m.pos.col}:${m.pos.idx}`);
            if (!r) return next;
            const z = next.cells[m.pos.col]?.[m.pos.idx]?.style?.z ?? 1;
            return patchBlockStyle(next, m.pos, { [keys.x]: r.x, [keys.y]: r.y, z });
          }, current)
        );
      }
      if (w !== undefined || h !== undefined || rotate !== undefined)
        api.update((current) =>
          patchBlockStyle(current, pos, {
            ...(w !== undefined && { [keys.w]: device !== "phone" && w === 100 ? undefined : w }),
            ...(h !== undefined && { [keys.h]: h }),
            ...(rotate !== undefined && { rotate: rotate === 0 ? undefined : rotate }),
          })
        );
      void doc;
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });

  // ---- Keyboard: nudge, delete, duplicate, undo -----------------------------------
  d.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[contenteditable], input, textarea, select")) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && !e.altKey && key === "z") {
      e.preventDefault();
      if (e.shiftKey) api.redo();
      else api.undo();
      return;
    }
    if (mod && !e.altKey && key === "y") {
      e.preventDefault();
      api.redo();
      return;
    }
    const selection = api.getSelection();
    if (selection.length === 0) return;
    const doc = api.getDoc();
    if (!doc) return;
    const open = (p: BlockPos) => doc.cells[p.col]?.[p.idx];
    const free = selection.filter((p) => !open(p)?.locked);

    if (key === "escape") api.select(null);
    else if (key === "delete" || key === "backspace") {
      e.preventDefault();
      api.update((c) => removeBlock(c, free));
      api.select(null);
    } else if (mod && !e.altKey && key === "d") {
      e.preventDefault();
      api.update((c) => duplicateBlock(c, selection[0]));
    } else if (mod && e.altKey && key === "c") {
      e.preventDefault();
      const b = open(selection[0]);
      if (b) lookClipboard = copyLook(b);
    } else if (mod && e.altKey && key === "v" && lookClipboard) {
      e.preventDefault();
      api.update((c) => pasteLook(c, free, lookClipboard!));
    } else if (key.startsWith("arrow") && free.length) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
      const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
      const { device } = api.getView();
      const keys = keysFor(device);
      api.update((c) =>
        free.reduce((next, p) => {
          const st = next.cells[p.col]?.[p.idx]?.style;
          const curX = (device === "phone" ? st?.mx : st?.x) ?? 0;
          const curY = (device === "phone" ? st?.my : st?.y) ?? 0;
          const x = clamp(round1(curX + dx), -60, 60);
          const y = clamp(round1(curY + dy), -30, 30);
          return patchBlockStyle(next, p, {
            [keys.x]: x === 0 ? undefined : x,
            [keys.y]: y === 0 ? undefined : y,
          });
        }, c)
      );
    }
  });
}
