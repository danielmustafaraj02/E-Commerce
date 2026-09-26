import { describe, expect, it } from "vitest";
import { firstParagraph, paragraphs, truncateAtWord } from "./text";

describe("truncateAtWord", () => {
  it("leaves short text alone", () => {
    expect(truncateAtWord("short text", 50)).toBe("short text");
  });

  it("backs off to the last full word and adds an ellipsis", () => {
    expect(truncateAtWord("alpha beta gamma delta", 12)).toBe("alpha beta…");
  });
});

describe("paragraphs / firstParagraph", () => {
  const copy = "First one\nstill first.\n\n  Second.  \n\n\n\nThird.";

  it("splits on blank lines and trims", () => {
    expect(paragraphs(copy)).toEqual(["First one\nstill first.", "Second.", "Third."]);
  });

  it("returns the first paragraph", () => {
    expect(firstParagraph(copy)).toBe("First one\nstill first.");
  });

  it("copes with empty input", () => {
    expect(paragraphs(" \n\n ")).toEqual([]);
    expect(firstParagraph("")).toBe("");
  });
});
