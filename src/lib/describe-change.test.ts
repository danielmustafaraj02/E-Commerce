import { describe, expect, it } from "vitest";
import { describeChange } from "./describe-change";
import { parseBuilder } from "./section-builder";
import type { LayoutEntry } from "./page-layout";

const entry = (cells: unknown[][], extra: Partial<LayoutEntry> = {}): LayoutEntry => ({
  id: "x",
  visible: true,
  builder: parseBuilder({ columns: 1, cells }),
  ...extra,
});

describe("describeChange", () => {
  it("names what changed", () => {
    const a = entry([[{ type: "text", text: "a" }]]);
    expect(describeChange(a, entry([[{ type: "text", text: "b" }]]))).toBe("Text (column 1): text");
    expect(describeChange(a, entry([[{ type: "text", text: "a" }, { type: "divider" }]]))).toBe(
      "Block added"
    );
    expect(describeChange(a, entry([[]]))).toBe("Block removed");
    expect(describeChange(a, entry([[{ type: "text", text: "a", style: { x: 4, y: 1 } }]]))).toBe(
      "Moved or resized a text"
    );
    expect(describeChange(a, { ...a, style: { bg: "#fff" } })).toBe("Section style changed");
  });
});
