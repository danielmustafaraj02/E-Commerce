import {
  applyBlockDrop,
  getRawField,
  isSingleLineField,
  setColumnWidths,
  setRawField,
  type BlockPos,
} from "@/lib/section-builder-editing";
import { type BuilderBlock } from "@/lib/section-builder";
import { SNAP, attachTools, type CanvasApi } from "./canvas-tools";

/**
 * Makes the section preview a live canvas. The preview is a sandboxed frame in
 * which no scripts can run, so the editor page attaches these handlers to the
 * frame's document itself: drag a block (or a new block from the palette) to
 * move it between columns, and click text to edit it in place. Every change
 * goes back to the editor as an update to the builder document.
 */

export type { CanvasApi, Device } from "./canvas-tools";
export {
  applySelection,
  alignSelection,
  playAnimations,
  syncGrid,
  hasCopiedLook,
  getCopiedLook,
  setCopiedLook,
} from "./canvas-tools";

const posOf = (el: HTMLElement): BlockPos => {
  const [col, idx] = (el.dataset.bi ?? "0:0").split(":").map(Number);
  return { col, idx };
};

/** Draggable column edges: the two neighbouring columns trade width live, and
 *  one change is committed on release. Double-click an edge for equal columns. */
function attachColumnEdges(d: Document, api: CanvasApi) {
  const cols = [...d.querySelectorAll<HTMLElement>("[data-bi-col]")];
  cols.forEach((col, i) => {
    if (i === 0) return;
    const edge = d.createElement("span");
    edge.className = "bld-cz";
    edge.title = "Drag to change the column widths · double-click for equal columns";
    col.appendChild(edge);
    edge.addEventListener("dblclick", () => api.update((doc) => setColumnWidths(doc, undefined)));
    edge.addEventListener("mousedown", (e) => e.preventDefault());
    edge.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const grid = col.parentElement as HTMLElement;
      const px = cols.map((c) => c.getBoundingClientRect().width);
      const total = px.reduce((a, b) => a + b, 0);
      const pair = px[i - 1] + px[i];
      const tip = d.createElement("span");
      tip.className = "bld-cz-tip";
      col.appendChild(tip);
      edge.classList.add("bld-cz-on");
      edge.setPointerCapture(e.pointerId);
      let widths: number[] | undefined;
      const move = (ev: PointerEvent) => {
        let left = Math.min(pair * 0.85, Math.max(pair * 0.15, px[i - 1] + ev.clientX - e.clientX));
        // Snap to the usual splits (a quarter, a third, a half…) of the two columns.
        if (!ev.altKey)
          for (const f of [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4])
            if (Math.abs(left - pair * f) <= SNAP + 2) {
              left = pair * f;
              break;
            }
        const next = px.map((w, k) => (k === i - 1 ? left : k === i ? pair - left : w));
        widths = next.map((w) => Math.round((w / total) * cols.length * 100) / 100);
        grid.style.gridTemplateColumns = widths.map((w) => `minmax(0,${w}fr)`).join(" ");
        tip.textContent = next.map((w) => `${Math.round((w / total) * 100)}%`).join(" · ");
      };
      const up = () => {
        edge.removeEventListener("pointermove", move);
        edge.removeEventListener("pointerup", up);
        edge.removeEventListener("pointercancel", up);
        edge.classList.remove("bld-cz-on");
        tip.remove();
        if (widths) {
          const final = widths;
          api.update((doc) => setColumnWidths(doc, final));
        }
      };
      edge.addEventListener("pointermove", move);
      edge.addEventListener("pointerup", up);
      edge.addEventListener("pointercancel", up);
    });
  });
}

export function attachCanvas(d: Document, api: CanvasApi) {
  let editing: HTMLElement | null = null;
  attachTools(d, api);
  attachColumnEdges(d, api);

  const clearMarks = () => {
    d.querySelectorAll(".bld-drop-before,.bld-drop-after,.bld-drop-end").forEach((el) =>
      el.classList.remove("bld-drop-before", "bld-drop-after", "bld-drop-end")
    );
  };

  const dropTarget = (e: DragEvent) => {
    const cols = [...d.querySelectorAll<HTMLElement>("[data-bi-col]")];
    if (cols.length === 0) return null;
    const x = e.clientX;
    const y = e.clientY;
    let col = cols.find((c) => {
      const r = c.getBoundingClientRect();
      return x >= r.left && x <= r.right;
    });
    if (!col) {
      col = cols.reduce((best, c) => {
        const r = c.getBoundingClientRect();
        const bestR = best.getBoundingClientRect();
        return Math.abs(r.left + r.width / 2 - x) < Math.abs(bestR.left + bestR.width / 2 - x)
          ? c
          : best;
      });
    }
    const blocks = [...col.querySelectorAll<HTMLElement>(":scope > [data-bi]")];
    let idx = blocks.length;
    for (let k = 0; k < blocks.length; k++) {
      const r = blocks[k].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        idx = k;
        break;
      }
    }
    return { col: Number(col.dataset.biCol), idx, colEl: col, blocks };
  };

  const startEdit = (field: HTMLElement, block: HTMLElement) => {
    const pos = posOf(block);
    const name = field.dataset.biField!;
    const model: BuilderBlock | undefined = api.getDoc()?.cells[pos.col]?.[pos.idx];
    if (!model) return;
    const raw = getRawField(model, name);
    if (raw === undefined) return;
    const single = isSingleLineField(model.type, name);
    const original = field.innerHTML;
    let cancelled = false;

    editing = field;
    block.removeAttribute("draggable");
    field.textContent = raw;
    field.contentEditable = "plaintext-only";
    if (field.contentEditable !== "plaintext-only") field.contentEditable = "true";
    field.focus();
    const selection = d.getSelection();
    const range = d.createRange();
    range.selectNodeContents(field);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelled = true;
        field.blur();
      } else if (e.key === "Enter" && single) {
        e.preventDefault();
        field.blur();
      }
    };
    const finish = () => {
      field.removeEventListener("blur", finish);
      field.removeEventListener("keydown", onKey);
      editing = null;
      field.removeAttribute("contenteditable");
      block.setAttribute("draggable", "true");
      let value = field.innerText.replace(/ /g, " ");
      value = single
        ? value.replace(/\s*\n+\s*/g, " ").trim()
        : value.replace(/\n{3,}/g, "\n\n").trim();
      if (cancelled || value === raw) {
        field.innerHTML = original;
        return;
      }
      api.update((doc) => setRawField(doc, pos, name, value));
    };
    field.addEventListener("blur", finish);
    field.addEventListener("keydown", onKey);
  };

  d.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (editing?.contains(target) || target.closest(".bld-cz, .bld-rz")) return;
    if (target.closest("a")) e.preventDefault();
    const block = target.closest<HTMLElement>("[data-bi]");
    if (!block) {
      api.select(null);
      return;
    }
    api.select(posOf(block), e.shiftKey || e.ctrlKey || e.metaKey);
    const field = target.closest<HTMLElement>("[data-bi-field]");
    if (e.shiftKey || e.ctrlKey || e.metaKey) return;
    if (
      field &&
      block.contains(field) &&
      field !== editing &&
      !block.classList.contains("bld-locked")
    )
      startEdit(field, block);
  });

  d.addEventListener("dragstart", (e) => {
    const block = (e.target as Element).closest<HTMLElement>("[data-bi]");
    if (
      !block ||
      block.classList.contains("bld-locked") ||
      editing ||
      !e.dataTransfer ||
      (e.target as Element).closest(".bld-rz")
    ) {
      e.preventDefault();
      return;
    }
    const { col, idx } = posOf(block);
    e.dataTransfer.setData("text/plain", `move:${col}:${idx}`);
    e.dataTransfer.effectAllowed = "move";
    block.classList.add("bld-dragging");
  });

  d.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const t = dropTarget(e);
    clearMarks();
    if (!t) return;
    if (t.idx < t.blocks.length) t.blocks[t.idx].classList.add("bld-drop-before");
    else if (t.blocks.length) t.blocks[t.blocks.length - 1].classList.add("bld-drop-after");
    else t.colEl.classList.add("bld-drop-end");
  });

  d.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = e.dataTransfer?.getData("text/plain") ?? "";
    const t = dropTarget(e);
    clearMarks();
    d.querySelectorAll(".bld-dragging").forEach((el) => el.classList.remove("bld-dragging"));
    if (!t) return;
    const to = { col: t.col, idx: t.idx };
    const doc = api.getDoc();
    if (!doc) return;
    const result = applyBlockDrop(doc, data, to);
    if (result.doc !== doc) {
      api.update((current) => applyBlockDrop(current, data, to).doc);
      requestAnimationFrame(() => api.select(result.selected));
    }
  });

  d.addEventListener("dragend", () => {
    clearMarks();
    d.querySelectorAll(".bld-dragging").forEach((el) => el.classList.remove("bld-dragging"));
  });
}
