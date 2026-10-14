"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  LockOpen,
  PanelsTopLeft,
  Trash2,
  X,
} from "lucide-react";
import { IconButton } from "./workspace-ui";
import {
  applyBlockDrop,
  duplicateBlock,
  insertBlock,
  freshBlock,
  type BlockPos,
} from "@/lib/section-builder-editing";
import {
  MAX_BLOCKS_PER_COLUMN,
  overlayMediaColumn,
  type BuilderBlock,
  type BuilderDoc,
} from "@/lib/section-builder";
import styles from "./builder-editor.module.css";
import { ColorField } from "@/components/color-field";
import { BlockLanguages } from "./builder-extras";
import { BLOCK_ICON, BLOCK_LABEL, ELEMENT_GROUPS, blockSummary } from "./block-catalog";
import { BlockFields } from "./block-fields";
import { BlockLook } from "./block-look";

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

export type BuilderSlots = {
  elements: HTMLElement | null;
  layers: HTMLElement | null;
  inspector: HTMLElement | null;
};

export function BuilderEditor({
  doc,
  onChange,
  selected = null,
  onSelect,
  slots,
}: {
  doc: BuilderDoc;
  onChange: (doc: BuilderDoc) => void;
  /** The block highlighted in the preview canvas. */
  selected?: BlockPos | null;
  onSelect?: (pos: BlockPos | null) => void;
  /** Draw into the workspace's panels instead of as one column. */
  slots?: BuilderSlots;
}) {
  // Drag and drop of blocks between and within columns.
  const [copiedBlock, setCopiedBlock] = useState<BuilderBlock | null>(null);
  const [notice, setNotice] = useState("");
  const activeBlock = selected ? doc.cells[selected.col]?.[selected.idx] : undefined;
  const destination =
    selected && activeBlock
      ? { col: selected.col, idx: selected.idx + 1 }
      : { col: 0, idx: doc.cells[0].length };
  const addBlock = (type: BuilderBlock["type"]) => {
    const result = applyBlockDrop(doc, `new:${type}`, destination);
    if (result.doc === doc) {
      setNotice("This column is full. Choose another column first.");
      return;
    }
    onChange(result.doc);
    onSelect?.(result.selected);
    setNotice(`${BLOCK_LABEL[type]} added. Click it to customize.`);
  };
  const [over, setOver] = useState<BlockPos | null>(null);
  const dropAt = (e: React.DragEvent, to: BlockPos) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData("text/plain");
    const result = applyBlockDrop(doc, data, to);
    if (result.doc !== doc) {
      onChange(result.doc);
      onSelect?.(result.selected);
    }
    setOver(null);
  };
  const setCell = (col: number, blocks: BuilderBlock[]) =>
    onChange({ ...doc, cells: doc.cells.map((c, i) => (i === col ? blocks : c)) });
  const setMobile = (patch: NonNullable<BuilderDoc["mobile"]>) => {
    const next = { ...doc.mobile, ...patch };
    onChange({
      ...doc,
      mobile: Object.values(next).some((v) => v !== undefined) ? next : undefined,
    });
  };
  const setColumns = (columns: 1 | 2 | 3 | 4) =>
    onChange({
      ...doc,
      columns,
      widths: undefined,
      mobile: doc.mobile && { ...doc.mobile, hide: doc.mobile.hide?.filter((i) => i < columns) },
      // Extra columns' blocks are folded into the last one so nothing is lost.
      cells:
        columns >= doc.cells.length
          ? [...doc.cells, ...Array.from({ length: columns - doc.cells.length }, () => [])]
          : [...doc.cells.slice(0, columns - 1), doc.cells.slice(columns - 1).flat()],
    });

  // The section's own settings: below the blocks on a page, and the inspector's
  // content in the workspace while no block is selected.
  const layoutFields = (
    <div className="grid gap-3 sm:grid-cols-4">
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Columns
        <select
          value={doc.columns}
          onChange={(e) => setColumns(Number(e.target.value) as 1 | 2 | 3 | 4)}
          className="field"
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Space between (rem)
        <input
          type="number"
          min={0}
          max={6}
          step={0.5}
          value={doc.gap}
          onChange={(e) =>
            onChange({ ...doc, gap: Math.min(6, Math.max(0, Number(e.target.value))) })
          }
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Line between columns
        <select
          value={doc.divider}
          onChange={(e) =>
            onChange({ ...doc, divider: e.target.value as BuilderDoc["divider"] })
          }
          className="field"
        >
          <option value="none">None</option>
          <option value="thin">Thin</option>
          <option value="thick">Thick</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </label>
      <div className="flex flex-col gap-1 text-xs text-neutral-600">
        Line colour
        <ColorField
          value={doc.dividerColor}
          label="Line colour"
          fallback="#999999"
          clearLabel="Auto"
          onChange={(v) => onChange({ ...doc, dividerColor: v })}
        />
      </div>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Align columns
        <select
          value={doc.valign}
          onChange={(e) => onChange({ ...doc, valign: e.target.value as "top" | "center" })}
          className="field"
        >
          <option value="top">Top</option>
          <option value="center">Middle</option>
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-xs text-neutral-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={doc.drawLines ?? false}
          disabled={doc.divider === "none" || doc.columns < 2}
          onChange={(e) => onChange({ ...doc, drawLines: e.target.checked || undefined })}
        />
        Draw the lines between columns when the section scrolls into view
      </label>
      <label className="flex items-center gap-1.5 text-xs text-neutral-600 sm:col-span-2">
        <input
          type="checkbox"
          checked={doc.width === "full"}
          onChange={(e) => onChange({ ...doc, width: e.target.checked ? "full" : undefined })}
        />
        Full width: the design runs edge to edge (for sections with their own content inside)
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-2">
        Pause between animation steps (ms)
        <input
          type="number"
          min={0}
          max={1000}
          step={50}
          value={doc.stagger ?? ""}
          onChange={(e) =>
            onChange({
              ...doc,
              stagger: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
          className="field"
          placeholder="150"
        />
      </label>
    </div>
  );
  const phoneFields = (
    <fieldset className="border-foreground/15 rounded-lg border bg-white p-3">
      <legend className="px-1 text-xs font-semibold text-neutral-700">On phones</legend>
      {doc.columns === 2 && (
        <div className="mb-3 grid gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1 text-xs text-neutral-600 sm:col-span-4">
            <span>Phone layout</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Phone layout">
              {(
                [
                  [undefined, "Stack the columns", "Image above, text below, one after the other."],
                  ["overlay", "Image as background, text on top", "The image or video fills the screen; the text sits over it on the side it has on computers."],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={doc.mobile?.layout === value}
                  title={hint}
                  className={`rounded border px-3 py-1.5 text-left ${doc.mobile?.layout === value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`}
                  onClick={() => setMobile({ layout: value })}
                >
                  <strong className="block">{label}</strong>
                  <span className="opacity-75">{hint}</span>
                </button>
              ))}
            </div>
            {doc.mobile?.layout === "overlay" && overlayMediaColumn(doc) < 0 && (
              <span className="text-amber-700">Add an image or video to one column: it becomes the phone background.</span>
            )}
          </div>
          {doc.mobile?.layout === "overlay" && (
            <>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Text position
                <select
                  className="field"
                  value={doc.mobile.overlayAlign ?? "bottom"}
                  onChange={(e) =>
                    setMobile({
                      overlayAlign:
                        e.target.value === "bottom" ? undefined : (e.target.value as "top" | "center"),
                    })
                  }
                >
                  <option value="top">Top</option>
                  <option value="center">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Darken image: {doc.mobile.overlayShade ?? 45}%
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={doc.mobile.overlayShade ?? 45}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMobile({ overlayShade: v === 45 ? undefined : v });
                  }}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                Height: {doc.mobile.overlayHeight ?? 80}% of the screen
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={doc.mobile.overlayHeight ?? 80}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMobile({ overlayHeight: v === 80 ? undefined : v });
                  }}
                />
              </label>
            </>
          )}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-1.5 text-xs text-neutral-600 sm:col-span-2">
          <input
            type="checkbox"
            checked={doc.mobile?.reverse ?? false}
            disabled={doc.columns < 2 || doc.mobile?.layout === "overlay"}
            onChange={(e) => setMobile({ reverse: e.target.checked || undefined })}
          />
          Show the columns in reverse order
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Space between stacked columns (rem)
          <input
            type="number"
            min={0}
            max={6}
            step={0.5}
            value={doc.mobile?.gap ?? ""}
            onChange={(e) =>
              setMobile({ gap: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            placeholder={String(doc.gap)}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Text size: {doc.mobile?.fontScale ?? 100}%
          <input
            type="range"
            min={60}
            max={140}
            step={5}
            value={doc.mobile?.fontScale ?? 100}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMobile({ fontScale: v === 100 ? undefined : v });
            }}
          />
        </label>
        {doc.columns > 1 && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 sm:col-span-4">
            <span>Hide on phones:</span>
            {doc.cells.map((_, col) => (
              <label key={col} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={doc.mobile?.hide?.includes(col) ?? false}
                  onChange={(e) => {
                    const hide = new Set(doc.mobile?.hide ?? []);
                    if (e.target.checked) hide.add(col);
                    else hide.delete(col);
                    setMobile({ hide: hide.size ? [...hide].sort() : undefined });
                  }}
                />
                Column {col + 1}
              </label>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Check the result in the Phone preview.
      </p>
    </fieldset>
  );

  if (slots) {
    const cellOf = (pos: BlockPos) => doc.cells[pos.col] ?? [];
    const patchAt = (pos: BlockPos, patch: Partial<BuilderBlock>) =>
      setCell(
        pos.col,
        cellOf(pos).map((b, j) => (j === pos.idx ? ({ ...b, ...patch } as BuilderBlock) : b))
      );
    const pasteInto = (pos: BlockPos) => {
      if (!copiedBlock) return;
      const copy = structuredClone(copiedBlock);
      delete copy.group;
      delete copy.locked;
      delete copy.ghost;
      onChange(insertBlock(doc, pos, copy));
      onSelect?.(pos);
      setNotice("Block pasted. Its content and appearance can be edited on their own.");
    };
    const sel = selected && activeBlock ? selected : null;
    const moveSelected = (by: -1 | 1) => {
      if (!sel) return;
      const cell = cellOf(sel);
      const to = sel.idx + by;
      if (to < 0 || to >= cell.length) return;
      setCell(sel.col, move(cell, sel.idx, to));
      onSelect?.({ col: sel.col, idx: to });
    };
    const listed = new Set(ELEMENT_GROUPS.flatMap(([, types]) => types));
    const unlisted = (Object.keys(BLOCK_LABEL) as BuilderBlock["type"][]).filter(
      (type) => !listed.has(type)
    );
    const groups: [string, BuilderBlock["type"][]][] = unlisted.length
      ? [...ELEMENT_GROUPS, ["More", unlisted]]
      : ELEMENT_GROUPS;

    const elements = (
      <div className={styles.ws}>
        {groups.map(([group, types]) => (
          <section key={group} className={styles.wsGroup} aria-label={group}>
            <h3>{group}</h3>
            <div className={styles.tiles}>
              {types.map((type) => {
                const Icon = BLOCK_ICON[type];
                return (
                  <button
                    key={type}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", `new:${type}`);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => addBlock(type)}
                    title={`Add after the selected block, or drag it onto the canvas`}
                  >
                    <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
                    <span>{BLOCK_LABEL[type]}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {copiedBlock && (
          <button
            type="button"
            className={styles.wsPaste}
            disabled={doc.cells[destination.col].length >= MAX_BLOCKS_PER_COLUMN}
            onClick={() => pasteInto(destination)}
          >
            <ClipboardPaste aria-hidden="true" size={16} strokeWidth={1.75} />
            Paste the copied {BLOCK_LABEL[copiedBlock.type].toLowerCase()}
          </button>
        )}
        <p role="status" aria-live="polite" className={styles.wsNotice}>
          {notice || "New blocks go after the selected one, or at the end of the first column."}
        </p>
      </div>
    );

    const layers = (
      <div className={styles.ws}>
        {doc.cells.map((cell, col) => (
          <section
            key={col}
            className={styles.layerColumn}
            aria-label={doc.columns > 1 ? `Column ${col + 1}` : "Blocks"}
            onDragOver={(e) => {
              e.preventDefault();
              setOver({ col, idx: cell.length });
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
            }}
            onDrop={(e) => dropAt(e, { col, idx: cell.length })}
          >
            {doc.columns > 1 && <h3>Column {col + 1}</h3>}
            <ol>
              {cell.map((block, i) => {
                const Icon = BLOCK_ICON[block.type];
                const isSelected = selected?.col === col && selected.idx === i;
                const name = BLOCK_LABEL[block.type];
                const summary = blockSummary(block);
                return (
                  <li
                    key={i}
                    id={`bld-card-${col}-${i}`}
                    className={`${styles.layer} ${over?.col === col && over.idx === i ? styles.dropBefore : ""} ${over?.col === col && over.idx === i + 1 && i === cell.length - 1 ? styles.dropAfter : ""}`}
                    data-selected={isSelected ? "" : undefined}
                    data-ghost={block.ghost ? "" : undefined}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      setOver({ col, idx: e.clientY < r.top + r.height / 2 ? i : i + 1 });
                    }}
                    onDrop={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      dropAt(e, { col, idx: e.clientY < r.top + r.height / 2 ? i : i + 1 });
                    }}
                  >
                    <span
                      draggable={!block.locked}
                      role="img"
                      aria-label={`Drag ${name}`}
                      title={block.locked ? "Locked" : "Drag to move"}
                      className={styles.grip}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `move:${col}:${i}`);
                        e.dataTransfer.effectAllowed = "move";
                        const row = e.currentTarget.closest("li");
                        if (row) e.dataTransfer.setDragImage(row, 12, 12);
                      }}
                      onDragEnd={() => setOver(null)}
                    >
                      <GripVertical aria-hidden="true" size={14} strokeWidth={1.75} />
                    </span>
                    <button
                      type="button"
                      className={styles.layerName}
                      aria-pressed={isSelected}
                      onClick={() => onSelect?.(isSelected ? null : { col, idx: i })}
                    >
                      <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
                      <span>
                        <strong>{name}</strong>
                        {summary && <small>{summary}</small>}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.layerToggle}
                      aria-pressed={!!block.locked}
                      aria-label={block.locked ? `Unlock ${name}` : `Lock ${name}`}
                      title={
                        block.locked
                          ? "Locked: it can't be moved or resized on the canvas. Click to unlock."
                          : "Lock it so it can't be moved or resized by accident"
                      }
                      onClick={() =>
                        patchAt({ col, idx: i }, { locked: block.locked ? undefined : true })
                      }
                    >
                      {block.locked ? (
                        <Lock aria-hidden="true" size={14} strokeWidth={1.75} />
                      ) : (
                        <LockOpen aria-hidden="true" size={14} strokeWidth={1.75} />
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.layerToggle}
                      aria-pressed={!!block.ghost}
                      aria-label={block.ghost ? `Show ${name} in the editor` : `Hide ${name} in the editor`}
                      title={
                        block.ghost
                          ? "Hidden in this editor only (it is still on the site). Click to show."
                          : "Hide it in this editor to get it out of the way (it stays on the site)"
                      }
                      onClick={() =>
                        patchAt({ col, idx: i }, { ghost: block.ghost ? undefined : true })
                      }
                    >
                      {block.ghost ? (
                        <EyeOff aria-hidden="true" size={14} strokeWidth={1.75} />
                      ) : (
                        <Eye aria-hidden="true" size={14} strokeWidth={1.75} />
                      )}
                    </button>
                  </li>
                );
              })}
              {cell.length === 0 && (
                <li className={styles.layerEmpty}>Empty. Drag a block here.</li>
              )}
            </ol>
            {copiedBlock && cell.length < MAX_BLOCKS_PER_COLUMN && (
              <button
                type="button"
                className={styles.wsPaste}
                onClick={() => pasteInto({ col, idx: cell.length })}
              >
                <ClipboardPaste aria-hidden="true" size={16} strokeWidth={1.75} />
                Paste at the end of {doc.columns > 1 ? `column ${col + 1}` : "the section"}
              </button>
            )}
          </section>
        ))}
      </div>
    );

    const SelectedIcon = activeBlock ? BLOCK_ICON[activeBlock.type] : PanelsTopLeft;
    const inspector =
      sel && activeBlock ? (
        <div className={styles.ws}>
          <header className={styles.inspectorHead}>
            <span className={styles.inspectorTitle}>
              <SelectedIcon aria-hidden="true" size={18} strokeWidth={1.75} />
              <h2>{BLOCK_LABEL[activeBlock.type]}</h2>
            </span>
            <IconButton icon={X} label="Deselect" onClick={() => onSelect?.(null)} />
          </header>
          <div className={styles.inspectorTools} role="toolbar" aria-label="Block actions">
            <IconButton
              icon={ArrowUp}
              label="Move up"
              disabled={sel.idx === 0}
              onClick={() => moveSelected(-1)}
            />
            <IconButton
              icon={ArrowDown}
              label="Move down"
              disabled={sel.idx === cellOf(sel).length - 1}
              onClick={() => moveSelected(1)}
            />
            <IconButton
              icon={CopyPlus}
              label="Duplicate"
              disabled={cellOf(sel).length >= MAX_BLOCKS_PER_COLUMN}
              onClick={() => {
                onChange(duplicateBlock(doc, sel));
                onSelect?.({ col: sel.col, idx: sel.idx + 1 });
              }}
            />
            <IconButton
              icon={Copy}
              label="Copy block"
              onClick={() => {
                setCopiedBlock(structuredClone(activeBlock));
                setNotice("Block copied. Paste it from Elements or Layers.");
              }}
            />
            <IconButton
              icon={activeBlock.locked ? Lock : LockOpen}
              label={activeBlock.locked ? "Unlock" : "Lock"}
              pressed={!!activeBlock.locked}
              onClick={() => patchAt(sel, { locked: activeBlock.locked ? undefined : true })}
            />
            <IconButton
              icon={activeBlock.ghost ? EyeOff : Eye}
              label={activeBlock.ghost ? "Show in the editor" : "Hide in the editor"}
              pressed={!!activeBlock.ghost}
              onClick={() => patchAt(sel, { ghost: activeBlock.ghost ? undefined : true })}
            />
            <IconButton
              icon={Trash2}
              label="Delete block"
              tone="danger"
              onClick={() => {
                setCell(
                  sel.col,
                  cellOf(sel).filter((_, j) => j !== sel.idx)
                );
                onSelect?.(null);
                setNotice(`${BLOCK_LABEL[activeBlock.type]} deleted. Ctrl+Z brings it back.`);
              }}
            />
          </div>
          {doc.columns > 1 && (
            <label className={styles.inspectorField}>
              Column
              <select
                className="field"
                value={sel.col}
                disabled={!!activeBlock.locked}
                onChange={(e) => {
                  const col = Number(e.target.value);
                  const result = applyBlockDrop(doc, `move:${sel.col}:${sel.idx}`, {
                    col,
                    idx: doc.cells[col].length,
                  });
                  if (result.doc !== doc) {
                    onChange(result.doc);
                    onSelect?.(result.selected);
                  } else setNotice("Could not move the block. The destination may be full.");
                }}
              >
                {doc.cells.map((_, col) => (
                  <option key={col} value={col}>
                    Column {col + 1}
                  </option>
                ))}
              </select>
            </label>
          )}
          <BlockFields block={activeBlock} onChange={(patch) => patchAt(sel, patch)} />
          <BlockLanguages
            block={activeBlock}
            onChange={(tr) => patchAt(sel, { tr } as Partial<BuilderBlock>)}
          />
          <BlockLook block={activeBlock} onChange={(patch) => patchAt(sel, patch)} />
        </div>
      ) : (
        <div className={styles.ws}>
          <header className={styles.inspectorHead}>
            <span className={styles.inspectorTitle}>
              <PanelsTopLeft aria-hidden="true" size={18} strokeWidth={1.75} />
              <h2>Section</h2>
            </span>
          </header>
          <p className={styles.wsHint}>
            Click a block on the canvas, or in Layers, to edit it. These settings shape the
            whole section.
          </p>
          <section className={styles.wsGroup}>
            <h3>Layout</h3>
            {layoutFields}
          </section>
          {phoneFields}
        </div>
      );

    return (
      <>
        {slots.elements && createPortal(elements, slots.elements)}
        {slots.layers && createPortal(layers, slots.layers)}
        {slots.inspector && createPortal(inspector, slots.inspector)}
      </>
    );
  }
  return (
    <div className={styles.editor}>
      <header className={styles.intro}>
        <h2>Content & layout</h2>
        <p>Select a block to edit it. Drag its handle to reorder, or use the arrow buttons.</p>
      </header>
      <section className={styles.quickTools} aria-label="Visual editing tools">
        <p>
          Click the preview to select. Double-click text to type. Drag a block or its resize handles
          to adjust it.
        </p>
        <div className={styles.toolRow}>
          <strong>
            {activeBlock
              ? `Selected: ${BLOCK_LABEL[activeBlock.type]}`
              : "Select a block in the preview"}
          </strong>
          <button
            type="button"
            disabled={!activeBlock}
            onClick={() => {
              if (!activeBlock) return;
              setCopiedBlock(structuredClone(activeBlock));
              setNotice(
                "Block copied. Select a destination and paste after it, or paste into a column below."
              );
            }}
          >
            Copy block
          </button>
          <button
            type="button"
            disabled={!copiedBlock || doc.cells[destination.col].length >= MAX_BLOCKS_PER_COLUMN}
            onClick={() => {
              if (!copiedBlock) return;
              const copy = structuredClone(copiedBlock);
              delete copy.group;
              delete copy.locked;
              delete copy.ghost;
              onChange(insertBlock(doc, destination, copy));
              onSelect?.(destination);
              setNotice(
                "Block pasted. Its content and appearance can now be edited independently."
              );
            }}
          >
            Paste block
          </button>
          <button
            type="button"
            disabled={
              !activeBlock || !selected || doc.cells[selected.col].length >= MAX_BLOCKS_PER_COLUMN
            }
            onClick={() => {
              if (!selected) return;
              onChange(duplicateBlock(doc, selected));
              onSelect?.({ col: selected.col, idx: selected.idx + 1 });
            }}
          >
            Duplicate
          </button>
          {selected && activeBlock && doc.columns > 1 && (
            <label>
              Move to column
              <select
                className="field"
                value={selected.col}
                disabled={!!activeBlock.locked}
                onChange={(e) => {
                  const col = Number(e.target.value);
                  const result = applyBlockDrop(doc, `move:${selected.col}:${selected.idx}`, {
                    col,
                    idx: doc.cells[col].length,
                  });
                  if (result.doc !== doc) {
                    onChange(result.doc);
                    onSelect?.(result.selected);
                  } else setNotice("Could not move the block. The destination may be full.");
                }}
              >
                {doc.cells.map((_, col) => (
                  <option key={col} value={col}>
                    Column {col + 1}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className={styles.palette} aria-label="Add or drag a block">
          {(Object.keys(BLOCK_LABEL) as BuilderBlock["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", `new:${type}`);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => addBlock(type)}
              title={`Click to add ${BLOCK_LABEL[type]} after the selection, or drag into the preview`}
            >
              <span aria-hidden="true">⠿ + </span>
              {BLOCK_LABEL[type]}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite">
          {notice || "Click a block type to add it, or drag it into the preview."}
        </p>
      </section>
      <details className={styles.settings}>
        <summary>Section layout</summary>
        {layoutFields}
      </details>
      {phoneFields}

      <div className={`grid gap-4 ${doc.columns > 1 ? "lg:grid-cols-2" : ""}`}>
        {doc.cells.map((cell, col) => (
          <section
            key={col}
            className={styles.column}
            onDragOver={(e) => {
              e.preventDefault();
              setOver({ col, idx: cell.length });
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
            }}
            onDrop={(e) => dropAt(e, { col, idx: cell.length })}
          >
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              {doc.columns > 1 ? `Column ${col + 1}` : "Content"}
            </h3>
            {copiedBlock && (
              <button
                type="button"
                className="mb-3 rounded border bg-white px-3 py-2 text-xs"
                disabled={cell.length >= MAX_BLOCKS_PER_COLUMN}
                onClick={() => {
                  const copy = structuredClone(copiedBlock);
                  delete copy.group;
                  delete copy.locked;
                  delete copy.ghost;
                  onChange(insertBlock(doc, { col, idx: cell.length }, copy));
                  onSelect?.({ col, idx: cell.length });
                  setNotice(`Block pasted into column ${col + 1}.`);
                }}
              >
                Paste into {doc.columns > 1 ? `column ${col + 1}` : "content"}
              </button>
            )}
            <ul className="flex flex-col gap-2">
              {cell.map((block, i) => (
                <li
                  key={i}
                  id={`bld-card-${col}-${i}`}
                  onClick={() => onSelect?.({ col, idx: i })}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const r = e.currentTarget.getBoundingClientRect();
                    setOver({ col, idx: e.clientY < r.top + r.height / 2 ? i : i + 1 });
                  }}
                  onDrop={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    dropAt(e, { col, idx: e.clientY < r.top + r.height / 2 ? i : i + 1 });
                  }}
                  className={`${styles.card} ${selected?.col === col && selected.idx === i ? styles.selected : ""} ${over?.col === col && over.idx === i ? styles.dropBefore : ""} ${over?.col === col && over.idx === i + 1 && i === cell.length - 1 ? styles.dropAfter : ""}`}
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-1">
                    <span
                      draggable={!block.locked}
                      role="img"
                      aria-label={`Drag ${BLOCK_LABEL[block.type]} block`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `move:${col}:${i}`);
                        e.dataTransfer.effectAllowed = "move";
                        const card = e.currentTarget.closest("li");
                        if (card) e.dataTransfer.setDragImage(card, 12, 12);
                      }}
                      onDragEnd={() => setOver(null)}
                      title="Drag to move this block"
                      className="cursor-grab px-1 text-sm leading-none text-neutral-400 select-none"
                    >
                      ⠿
                    </span>
                    <span className="text-xs font-semibold text-neutral-600">
                      {BLOCK_LABEL[block.type]}
                    </span>
                    <button
                      type="button"
                      className="rounded border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100"
                      aria-label={`Open dedicated editor for ${BLOCK_LABEL[block.type]}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect?.({ col, idx: i });
                        setNotice(`${BLOCK_LABEL[block.type]} selected. Use the dedicated editor below and drag handles in the preview for position, size and rotation.`);
                      }}
                    >
                      Edit block ↗
                    </button>
                    {block.group && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700">
                        group {block.group}
                      </span>
                    )}
                    <span className="ml-auto flex gap-1">
                      <button
                        type="button"
                        aria-label={block.locked ? "Unlock this block" : "Lock this block"}
                        aria-pressed={!!block.locked}
                        title={
                          block.locked
                            ? "Locked: it can't be moved or resized in the preview. Click to unlock."
                            : "Lock it so it can't be moved or resized by accident"
                        }
                        onClick={() =>
                          setCell(
                            col,
                            cell.map((b, j) =>
                              j === i ? { ...b, locked: b.locked ? undefined : true } : b
                            )
                          )
                        }
                        className={`h-6 w-6 rounded border text-xs ${block.locked ? "border-indigo-500 bg-indigo-50" : "bg-white"}`}
                      >
                        {block.locked ? "🔒" : "🔓"}
                      </button>
                      <button
                        type="button"
                        aria-label={
                          block.ghost
                            ? "Show this block in the preview"
                            : "Hide this block in the preview"
                        }
                        aria-pressed={!!block.ghost}
                        title={
                          block.ghost
                            ? "Hidden in this editor only (it is still on the site). Click to show."
                            : "Hide it in this editor to get it out of the way (it stays on the site)"
                        }
                        onClick={() =>
                          setCell(
                            col,
                            cell.map((b, j) =>
                              j === i ? { ...b, ghost: b.ghost ? undefined : true } : b
                            )
                          )
                        }
                        className={`h-6 w-6 rounded border text-xs ${block.ghost ? "border-indigo-500 bg-indigo-50" : "bg-white"}`}
                      >
                        {block.ghost ? "🙈" : "👁"}
                      </button>
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => setCell(col, move(cell, i, i - 1))}
                        className="h-6 w-6 rounded border bg-white text-xs disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={i === cell.length - 1}
                        onClick={() => setCell(col, move(cell, i, i + 1))}
                        className="h-6 w-6 rounded border bg-white text-xs disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={cell.length >= MAX_BLOCKS_PER_COLUMN}
                        onClick={(event) => {
                          event.stopPropagation();
                          onChange(duplicateBlock(doc, { col, idx: i }));
                          onSelect?.({ col, idx: i + 1 });
                        }}
                        className="h-6 rounded border bg-white px-1.5 text-xs"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() =>
                          setCell(
                            col,
                            cell.filter((_, j) => j !== i)
                          )
                        }
                        className="h-6 rounded border border-red-200 bg-white px-1.5 text-xs text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <details
                    className={styles.fields}
                    open={selected?.col === col && selected.idx === i}
                  >
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelect?.(
                          selected?.col === col && selected.idx === i ? null : { col, idx: i }
                        );
                      }}
                    >
                      Edit content & appearance
                    </summary>
                    <BlockFields
                      block={block}
                      onChange={(patch) =>
                        setCell(
                          col,
                          cell.map((b, j) => (j === i ? ({ ...b, ...patch } as BuilderBlock) : b))
                        )
                      }
                    />
                    <BlockLanguages
                      block={block}
                      onChange={(tr) =>
                        setCell(
                          col,
                          cell.map((b, j) => (j === i ? ({ ...b, tr } as BuilderBlock) : b))
                        )
                      }
                    />
                    <BlockLook
                      block={block}
                      onChange={(patch) =>
                        setCell(
                          col,
                          cell.map((b, j) => (j === i ? ({ ...b, ...patch } as BuilderBlock) : b))
                        )
                      }
                    />
                  </details>
                </li>
              ))}
            </ul>
            {cell.length < MAX_BLOCKS_PER_COLUMN && (
              <div className={styles.palette}>
                {(Object.keys(BLOCK_LABEL) as BuilderBlock["type"][]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", `new:${type}`);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    title="Click to add at the end, or drag into the preview or a column"
                    onClick={() => setCell(col, [...cell, freshBlock(type)])}
                    className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs hover:bg-neutral-100"
                  >
                    + {BLOCK_LABEL[type]}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
