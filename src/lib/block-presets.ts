import { copyLook, parseBuilder, type BlockLookCopy } from "@/lib/section-builder";

/** Saved looks for blocks ("Gold button", "Soft card"): a name and the block's
 *  style, effect and animations. Stored as JSON and re-validated through the
 *  builder's own parser, so a stored preset can only hold what a block can. */
export type BlockPreset = { name: string; look: BlockLookCopy };

export const BLOCK_PRESETS_KEY = "block-presets";
export const MAX_BLOCK_PRESETS = 30;

export function cleanLook(look: unknown): BlockLookCopy | null {
  if (!look || typeof look !== "object") return null;
  const doc = parseBuilder({
    columns: 1,
    cells: [[{ ...(look as object), type: "text", text: "x" }]],
  });
  const block = doc?.cells[0]?.[0];
  if (!block) return null;
  const clean = copyLook(block);
  const empty = Object.values(clean).every((v) => v === undefined);
  return empty ? null : clean;
}

export function parsePresets(value: unknown): BlockPreset[] {
  if (!Array.isArray(value)) return [];
  const out: BlockPreset[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { name, look } = item as Record<string, unknown>;
    if (typeof name !== "string") continue;
    const trimmed = name.trim().slice(0, 40);
    const clean = cleanLook(look);
    if (trimmed && clean && !out.some((p) => p.name === trimmed))
      out.push({ name: trimmed, look: clean });
    if (out.length >= MAX_BLOCK_PRESETS) break;
  }
  return out;
}
