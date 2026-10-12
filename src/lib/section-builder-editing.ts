// Editing helpers for the visual canvas and the block list in Admin > Page
// layout: new blocks, moving, grouping, copying looks and the canvas's own CSS.
// Editor-only; the storefront uses section-builder.ts.
import {
  BLOCK_NAMES,
  type BlockStyle,
  type BuilderBlock,
  type BuilderDoc,
  MAX_BLOCKS_PER_COLUMN,
} from "@/lib/section-builder";

/** A new block of the given type with sensible starter content. */
export function freshBlock(type: BuilderBlock["type"]): BuilderBlock {
  switch (type) {
    case "heading":
      return { type, text: "Heading", size: "l" };
    case "text":
      return { type, text: "Write something here." };
    case "image":
      return { type, src: "", alt: "" };
    case "button":
      return { type, text: "Button", href: "/products", look: "solid" };
    case "divider":
      return { type };
    case "vline":
      return { type, height: 6 };
    case "shape":
      return { type, kind: "rectangle", fill: "#154230", style: { w: 50, h: 8 } };
    case "spacer":
      return { type, height: 2 };
    case "list":
      return { type, items: ["First", "Second"] };
    case "quote":
      return { type, text: "A memorable quote." };
    case "video":
      return { type, url: "" };
    case "counter":
      return {
        type,
        value: 2400,
        suffix: "+",
        label: "happy customers",
        size: "xl",
        align: "center",
      };
    case "icon":
      return {
        type,
        icon: "gem",
        title: "Handmade",
        text: "Made by hand on Murano.",
        align: "center",
      };
    case "stars":
      return { type, rating: 4.8, label: "from 1,200 reviews", align: "center" };
    case "countdown":
      return {
        type,
        until: `${new Date().getFullYear() + 1}-01-01T00:00`,
        label: "Sale ends in",
        doneText: "The sale has ended",
        align: "center",
      };
    case "badge":
      return { type, text: "New", look: "solid" };
    case "map":
      return { type, query: "Murano, Venice, Italy", height: 20 };
    case "carousel":
      return { type, source: "popular", count: 10 };
    case "eyebrow":
      return { type, number: "02", text: "The pieces in this look", line: "after" };
    case "shelf":
      return { type, source: "bestSellers", count: 4 };
    case "looks":
      return { type, count: 3 };
    case "reviews":
      return { type, count: 3 };
    case "newsletter":
      return { type };
    case "journal":
      return { type };
    case "siteFaq":
      return { type };
    case "showcase":
      return { type };
    case "original":
      return { type };
    case "story":
      return {
        type,
        eyebrow: "01",
        title: "A title for this story",
        text: "Two or three lines about the piece, the island or the people who make it.",
        cta: "See the piece",
        href: "/products",
        src: "",
        alt: "",
        side: "right",
        cardTitle: "Piece name",
        cardCta: "See the piece",
      };
    case "faq":
      return {
        type,
        items: [
          { q: "How long does delivery take?", a: "Orders ship within two working days." },
          { q: "Can I return a piece?", a: "Yes, within 30 days, unworn and in its box." },
        ],
      };
  }
}

export type BlockPos = { col: number; idx: number };

/** Moves a block to a new place (`to.idx` is the index it should end up
 *  before, counted in the column as it is before the move). */
export function moveBlock(doc: BuilderDoc, from: BlockPos, to: BlockPos): BuilderDoc {
  const block = doc.cells[from.col]?.[from.idx];
  if (!block || to.col < 0 || to.col >= doc.cells.length) return doc;
  const cells = doc.cells.map((cell) => cell.slice());
  cells[from.col].splice(from.idx, 1);
  let at = to.idx;
  if (from.col === to.col && from.idx < to.idx) at -= 1;
  at = Math.max(0, Math.min(cells[to.col].length, at));
  if (cells[to.col].length >= MAX_BLOCKS_PER_COLUMN && from.col !== to.col) return doc;
  cells[to.col].splice(at, 0, block);
  return { ...doc, cells };
}

/** Validate editor drag payloads, keep locked blocks in place and select the result. */
export function applyBlockDrop(
  doc: BuilderDoc,
  payload: string,
  to: BlockPos
): { doc: BuilderDoc; selected: BlockPos | null } {
  if (!Number.isInteger(to.col) || !Number.isInteger(to.idx) || to.idx < 0 || !doc.cells[to.col])
    return { doc, selected: null };
  const moved = /^move:(\d+):(\d+)$/.exec(payload);
  if (moved) {
    const from = { col: Number(moved[1]), idx: Number(moved[2]) };
    const block = doc.cells[from.col]?.[from.idx];
    if (!block || block.locked) return { doc, selected: null };
    const next = moveBlock(doc, from, to);
    return {
      doc: next,
      selected: next === doc ? null : { col: to.col, idx: next.cells[to.col].indexOf(block) },
    };
  }
  const added = /^new:([a-zA-Z]+)$/.exec(payload);
  if (!added || !Object.hasOwn(BLOCK_NAMES, added[1])) return { doc, selected: null };
  const block = freshBlock(added[1] as BuilderBlock["type"]);
  const next = insertBlock(doc, to, block);
  return {
    doc: next,
    selected: next === doc ? null : { col: to.col, idx: next.cells[to.col].indexOf(block) },
  };
}

/** Inserts a new block before `to.idx` in column `to.col`. */
export function insertBlock(doc: BuilderDoc, to: BlockPos, block: BuilderBlock): BuilderDoc {
  if (to.col < 0 || to.col >= doc.cells.length) return doc;
  if (doc.cells[to.col].length >= MAX_BLOCKS_PER_COLUMN) return doc;
  const cells = doc.cells.map((cell) => cell.slice());
  cells[to.col].splice(Math.max(0, Math.min(cells[to.col].length, to.idx)), 0, block);
  return { ...doc, cells };
}

const mapBlock = (
  doc: BuilderDoc,
  pos: BlockPos,
  change: (block: BuilderBlock) => BuilderBlock
): BuilderDoc => {
  if (!doc.cells[pos.col]?.[pos.idx]) return doc;
  return {
    ...doc,
    cells: doc.cells.map((cell, c) =>
      c === pos.col ? cell.map((b, i) => (i === pos.idx ? change(b) : b)) : cell
    ),
  };
};

/** Sets or clears (undefined) top-level fields of one block. */
export function patchBlock(
  doc: BuilderDoc,
  pos: BlockPos,
  patch: Partial<Record<keyof BuilderBlock, unknown>>
): BuilderDoc {
  return mapBlock(doc, pos, (block) => {
    const next: Record<string, unknown> = { ...block, ...patch };
    for (const key of Object.keys(next)) if (next[key] === undefined) delete next[key];
    return next as BuilderBlock;
  });
}

export function removeBlock(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  const drop = new Set(positions.map((p) => `${p.col}:${p.idx}`));
  return {
    ...doc,
    cells: doc.cells.map((cell, c) => cell.filter((_, i) => !drop.has(`${c}:${i}`))),
  };
}

export function duplicateBlock(doc: BuilderDoc, pos: BlockPos): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block || doc.cells[pos.col].length >= MAX_BLOCKS_PER_COLUMN) return doc;
  const copy = structuredClone(block);
  delete copy.locked;
  delete copy.group;
  if (copy.style && (copy.style.x !== undefined || copy.style.y !== undefined)) {
    copy.style = {
      ...copy.style,
      x: Math.min(60, (copy.style.x ?? 0) + 3),
      y: Math.min(30, (copy.style.y ?? 0) + 1),
    };
  }
  return insertBlock(doc, { col: pos.col, idx: pos.idx + 1 }, copy);
}

/** Every block that shares a group name with the block at `pos` (or just it). */
export function groupMembers(doc: BuilderDoc, pos: BlockPos): BlockPos[] {
  const group = doc.cells[pos.col]?.[pos.idx]?.group;
  if (!group) return [pos];
  return doc.cells.flatMap((cell, col) =>
    cell.flatMap((b, idx) => (b.group === group ? [{ col, idx }] : []))
  );
}

/** Gives the blocks one shared group name (they then select and move together). */
export function groupBlocks(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  const taken = new Set(doc.cells.flatMap((cell) => cell.map((b) => b.group)));
  let n = 1;
  while (taken.has(`g${n}`)) n++;
  return positions.reduce((d, p) => patchBlock(d, p, { group: `g${n}` }), doc);
}

export function ungroupBlocks(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  return positions.reduce((d, p) => patchBlock(d, p, { group: undefined }), doc);
}

/** The look of a block that can be copied to others: style, hover effect,
 *  animation, looping animation, parallax, sticky and phone visibility. */
export type BlockLookCopy = Pick<
  BuilderBlock,
  "style" | "effect" | "hide" | "motion" | "idle" | "parallax" | "sticky"
>;
export function copyLook(block: BuilderBlock): BlockLookCopy {
  const { style, effect, hide, motion, idle, parallax, sticky } = block;
  return structuredClone({ style, effect, hide, motion, idle, parallax, sticky });
}
export function pasteLook(doc: BuilderDoc, positions: BlockPos[], look: BlockLookCopy): BuilderDoc {
  return positions.reduce(
    (d, p) =>
      patchBlock(d, p, {
        style: look.style ? structuredClone(look.style) : undefined,
        effect: look.effect,
        hide: look.hide,
        motion: look.motion ? structuredClone(look.motion) : undefined,
        idle: look.idle,
        parallax: look.parallax,
        sticky: look.sticky,
      }),
    doc
  );
}

/** Brings a block to the front (or sends it to the back) among the overlapping ones. */
export function reorderLayer(doc: BuilderDoc, pos: BlockPos, where: "front" | "back"): BuilderDoc {
  const zs = doc.cells.flatMap((cell) => cell.map((b) => b.style?.z ?? 0));
  const z =
    where === "front" ? Math.min(20, Math.max(...zs, 0) + 1) : Math.max(-5, Math.min(...zs, 0) - 1);
  return patchBlockStyle(doc, pos, { z });
}

/** Text fields that are one line (Enter finishes the edit instead of adding a line). */
const SINGLE_LINE = new Set([
  "heading.text",
  "button.text",
  "badge.text",
  "icon.title",
  "counter.label",
  "stars.label",
  "eyebrow.text",
  "eyebrow.number",
  "countdown.label",
  "quote.text",
  "story.eyebrow",
  "story.title",
  "story.cta",
  "story.cardTitle",
  "story.cardPrice",
]);
export const isSingleLineField = (type: string, field: string) =>
  SINGLE_LINE.has(`${type}.${field}`);

/** The raw (markup-syntax) text of a block's editable field. */
export function getRawField(block: BuilderBlock, field: string): string | undefined {
  if (block.type === "story" && field === "cardTitle") return block.cardTitle;
  if (block.type === "story" && field === "cardPrice") return block.cardPrice;
  const value = (block as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}

export function setRawField(
  doc: BuilderDoc,
  pos: BlockPos,
  field: string,
  value: string
): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block || getRawField(block, field) === undefined) return doc;
  const cells = doc.cells.map((cell, c) =>
    c === pos.col
      ? cell.map((b, i) => {
          if (i !== pos.idx) return b;
          if (b.type === "story" && field === "cardTitle") return { ...b, cardTitle: value };
          if (b.type === "story" && field === "cardPrice") return { ...b, cardPrice: value };
          return { ...b, [field]: value } as BuilderBlock;
        })
      : cell
  );
  return { ...doc, cells };
}

/** Sets the relative column widths (equal widths clear them). */
export function setColumnWidths(doc: BuilderDoc, widths: number[] | undefined): BuilderDoc {
  const next = { ...doc, widths };
  if (!widths || widths.length !== doc.columns || widths.every((w) => w === widths[0]))
    delete next.widths;
  return next;
}

/** Merges a size change into one block's style; undefined removes a key. */
export function patchBlockStyle(
  doc: BuilderDoc,
  pos: BlockPos,
  patch: Partial<BlockStyle>
): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block) return doc;
  const merged: Record<string, unknown> = { ...block.style, ...patch };
  for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];
  const next = { ...block, style: Object.keys(merged).length ? merged : undefined } as BuilderBlock;
  if (!next.style) delete next.style;
  return {
    ...doc,
    cells: doc.cells.map((cell, c) =>
      c === pos.col ? cell.map((b, i) => (i === pos.idx ? next : b)) : cell
    ),
  };
}

/** CSS for the canvas only: outlines, drop markers, the text being edited. */
export const CANVAS_CSS = `
.bld-b[style*="--bld-rotate"]{transform:rotate(var(--bld-rotate))}
.bld-e{position:relative;min-width:0;box-sizing:border-box;cursor:grab;outline:1px dashed transparent;outline-offset:3px;transition:outline-color .15s}
.bld-e:hover{outline-color:rgba(21,66,48,.55)}
.bld-e.bld-sel{outline:2px solid #154230}
.bld-e.bld-dragging{opacity:.4}
.bld-rz{position:absolute;z-index:5;background:#154230;border:2px solid #fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.bld-rz-r{top:50%;right:-8px;width:12px;height:32px;margin-top:-16px;cursor:ew-resize}
.bld-rz-b{left:50%;bottom:-8px;height:12px;width:32px;margin-left:-16px;cursor:ns-resize}
.bld-scene-element{outline:1px dashed transparent;outline-offset:3px}
.bld-scene-element:hover{outline-color:rgba(21,66,48,.55)}
.bld-scene-element.bld-scene-selected{outline:2px solid #154230}
.bld-scene-control{display:none;z-index:50;touch-action:none}
.bld-scene-element:hover>.bld-scene-control,.bld-scene-selected>.bld-scene-control{display:block}
.bld-scene-element:hover>.bld-rz-m,.bld-scene-selected>.bld-rz-m{display:flex}
.showcase-figure>.bld-rz-r,.bld-story-visual>.bld-rz-r{right:4px}
.showcase-figure>.bld-rz-b,.bld-story-visual>.bld-rz-b{bottom:4px}
.showcase-figure>.bld-rz-c,.bld-story-visual>.bld-rz-c{right:4px;bottom:4px}
.showcase-figure>.bld-rz-m,.bld-story-visual>.bld-rz-m{top:4px;left:4px}
.bld-col{position:relative}
.bld-an{--bm-p:1}
body.bld-playing .bld-an{--bm-p:0;transition:--bm-p var(--bm-dur,.8s) var(--bm-ease,cubic-bezier(.2,.7,.2,1)) var(--bm-del,0s)}
body.bld-playing .bld-an.bld-in{--bm-p:1}
body:not(.bld-playing) .bld-idle>*{animation:none!important}
.bld-locked{cursor:not-allowed!important}.bld-locked.bld-sel{outline-style:dashed!important}
.bld-ghost{display:none!important}
.bld-grid{position:absolute;inset:0;pointer-events:none;z-index:8;display:grid;grid-template-columns:repeat(12,1fr);gap:0}
.bld-grid i{border-inline:1px solid rgba(21,66,48,.18);background:rgba(21,66,48,.04)}
.bld-ctx{position:fixed;z-index:30;min-width:11rem;background:#fff;color:#111;border:1px solid #ccc;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.2);font:13px system-ui,sans-serif;padding:4px}
.bld-ctx button{display:block;width:100%;text-align:left;padding:6px 10px;border:0;background:none;cursor:pointer;border-radius:4px;font:inherit;color:inherit}
.bld-ctx button:hover{background:#eef}.bld-ctx button:disabled{opacity:.4;cursor:default}
.bld-ctx hr{border:0;border-top:1px solid #ddd;margin:3px 0}
.bld-gap{position:fixed;z-index:9;pointer-events:none;background:rgba(255,45,135,.9);color:#fff;font:10px/1 system-ui,sans-serif;padding:2px 4px;border-radius:3px;transform:translate(-50%,-50%)}
.bld-multi{outline:2px solid #154230!important;outline-offset:3px}
.bld-guide{position:fixed;z-index:9;pointer-events:none}
.bld-guide-v{top:0;bottom:0;width:0;border-left:1px dashed #e11d48;margin-left:-.5px}
.bld-guide-h{left:0;right:0;height:0;border-top:1px dashed #e11d48;margin-top:-.5px}
.bld-cz{position:absolute;z-index:4;top:0;bottom:0;left:-9px;width:18px;cursor:col-resize;display:none}
.bld-cz::after{content:"";position:absolute;top:0;bottom:0;left:8px;width:2px;background:#154230;opacity:0;transition:opacity .15s}
.bld-cz:hover::after,.bld-cz.bld-cz-on::after{opacity:1}
.bld-cz-tip{position:absolute;z-index:6;top:4px;left:12px;padding:2px 6px;border-radius:4px;background:#111;color:#fff;font:11px system-ui,sans-serif;pointer-events:none;white-space:nowrap}
@media (min-width:48rem){.bld-cz{display:block}}
.bld-rz-m{top:-8px;left:-8px;width:22px;height:22px;cursor:move;display:flex;align-items:center;justify-content:center;color:#fff;font:14px/1 system-ui,sans-serif}
.bld-rz-c{right:-8px;bottom:-8px;width:16px;height:16px;cursor:nwse-resize}
.bld-rz-t{top:-26px;left:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;transform:translateX(-50%);cursor:alias;color:#fff;font:15px/1 system-ui,sans-serif}
.bld-gui-element{position:relative;outline:1px dashed transparent;outline-offset:3px;cursor:move;touch-action:none}
.bld-gui-element:hover,.bld-gui-selected{outline:2px solid #154230!important;outline-offset:3px}
.bld-gui-element>.bld-gui-handle{z-index:50;display:none;touch-action:none}
.bld-gui-element:hover>.bld-gui-handle,.bld-gui-selected>.bld-gui-handle{display:flex}
.bld-gui-tip{position:absolute;z-index:99;right:2px;top:2px;padding:2px 6px;border-radius:4px;background:#111;color:white;font:11px system-ui,sans-serif;pointer-events:none}
.bld-rz-tip{position:absolute;z-index:6;right:4px;top:4px;padding:2px 6px;border-radius:4px;background:#111;color:#fff;font:11px system-ui,sans-serif;pointer-events:none}
.bld-e [data-bi-field]{cursor:text}
.bld-e a{cursor:text}
.bld-live:empty::before{content:attr(data-bld-label);display:flex;align-items:center;justify-content:center;min-height:12rem;border:1px dashed rgba(127,127,127,.6);font:13px system-ui,sans-serif;color:#666;text-align:center;padding:1rem}
.bld-empty{padding:.75rem;border:1px dashed rgba(127,127,127,.6);font:12px system-ui,sans-serif;color:#666;text-align:center}
.bld-col{min-height:3.5rem;outline:1px dashed rgba(127,127,127,.3);outline-offset:4px}
.bld-drop-before{box-shadow:0 -4px 0 #154230}
.bld-drop-after{box-shadow:0 4px 0 #154230}
.bld-col.bld-drop-end{box-shadow:inset 0 0 0 3px #154230}
[data-bi-field][contenteditable]{outline:2px solid #154230;outline-offset:3px;white-space:pre-wrap;cursor:text;min-width:2ch}
`;
