import { describe, expect, it } from "vitest";
import { cleanLook, parsePresets } from "./block-presets";

describe("block presets", () => {
  it("keeps only what a block can hold", () => {
    const look = cleanLook({
      style: { color: "#ff0000", pad: 99, evil: "x" },
      effect: "lift",
      motion: { type: "rise", mode: "nope" },
      type: "image",
      text: "ignored",
    });
    expect(look).toEqual({
      style: { color: "#ff0000", pad: 4 },
      effect: "lift",
      motion: { type: "rise" },
    });
  });

  it("rejects empty and non-objects", () => {
    expect(cleanLook({})).toBeNull();
    expect(cleanLook("x")).toBeNull();
  });

  it("dedupes names, trims and drops bad entries", () => {
    const presets = parsePresets([
      { name: " Gold ", look: { effect: "glow" } },
      { name: "Gold", look: { effect: "lift" } },
      { name: "", look: { effect: "lift" } },
      { name: "Bad", look: {} },
      "junk",
    ]);
    expect(presets).toEqual([{ name: "Gold", look: { effect: "glow" } }]);
  });
});
