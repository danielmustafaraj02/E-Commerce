import type { LayoutEntry } from "@/lib/page-layout";

/** A short plain-words description of what changed between two versions of a
 *  section, for the undo history list. */
export function describeChange(before: LayoutEntry, after: LayoutEntry): string {
  const a = before.builder;
  const b = after.builder;
  if (a && b) {
    if (a.columns !== b.columns) return `Columns: ${a.columns} → ${b.columns}`;
    for (const key of [
      "gap",
      "divider",
      "dividerColor",
      "valign",
      "drawLines",
      "widths",
      "stagger",
      "mobile",
    ] as const) {
      if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
        return key === "widths" ? "Column widths changed" : `Design setting changed: ${key}`;
      }
    }
    const countA = a.cells.reduce((n, c) => n + c.length, 0);
    const countB = b.cells.reduce((n, c) => n + c.length, 0);
    if (countA !== countB) return countB > countA ? "Block added" : "Block removed";
    for (let col = 0; col < b.cells.length; col++) {
      for (let idx = 0; idx < b.cells[col].length; idx++) {
        const x = a.cells[col]?.[idx];
        const y = b.cells[col][idx];
        if (!x) continue;
        if (x.type !== y.type) return "Blocks moved";
        if (JSON.stringify(x) !== JSON.stringify(y)) {
          const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
          const changed = [...keys].filter(
            (k) =>
              JSON.stringify((x as Record<string, unknown>)[k]) !==
              JSON.stringify((y as Record<string, unknown>)[k])
          );
          const style = (y as { style?: object }).style;
          const positional =
            changed.length === 1 &&
            changed[0] === "style" &&
            style &&
            JSON.stringify(Object.keys(style).sort()).includes("x");
          return positional
            ? `Moved or resized a ${y.type}`
            : `${y.type[0].toUpperCase()}${y.type.slice(1)} (column ${col + 1}): ${changed.join(", ")}`;
        }
      }
    }
    if (JSON.stringify(a.cells) !== JSON.stringify(b.cells)) return "Blocks moved";
  }
  if (!!a !== !!b) return b ? "Switched to the visual editor" : "Switched to HTML";
  if (JSON.stringify(before.style) !== JSON.stringify(after.style)) return "Section style changed";
  if (JSON.stringify(before.options) !== JSON.stringify(after.options)) return "Options changed";
  if (before.html !== after.html) return "HTML edited";
  if (JSON.stringify(before.custom) !== JSON.stringify(after.custom))
    return "Custom content edited";
  return "Changed";
}
