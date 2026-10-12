import { describe, expect, it } from "vitest";
import { DRAFT_KEY_PREFIX, draftKey, draftedSectionIds, parseDraft } from "./section-drafts";

describe("section drafts", () => {
  it("keeps drafts under keys no page uses", () => {
    expect(draftKey("home", "hero")).toBe("sec-draft:home:hero");
    expect(draftKey("home", "hero").startsWith(DRAFT_KEY_PREFIX)).toBe(true);
  });

  it("lists the drafted sections of one page only", () => {
    expect(
      draftedSectionIds(
        [
          "sec-draft:home:hero",
          "sec-draft:about:intro",
          "sec-hist:home:hero",
          "home",
          "sec-draft:home:faq",
        ],
        "home"
      )
    ).toEqual(["hero", "faq"]);
  });

  it("reads back a valid draft", () => {
    const draft = parseDraft(
      { at: "2026-10-11T08:00:00.000Z", entry: { id: "hero", visible: true } },
      "home",
      "hero"
    );
    expect(draft).toEqual({
      at: "2026-10-11T08:00:00.000Z",
      entry: expect.objectContaining({ id: "hero" }),
    });
  });

  it.each([
    ["nothing", null],
    ["no date", { entry: { id: "hero" } }],
    ["a bad date", { at: "yesterday", entry: { id: "hero" } }],
    ["no entry", { at: "2026-10-11T08:00:00.000Z" }],
  ])("ignores %s", (_, value) => {
    expect(parseDraft(value, "home", "hero")).toBeNull();
  });

  it("files the entry under the section it was saved for", () => {
    const draft = parseDraft(
      { at: "2026-10-11T08:00:00.000Z", entry: { id: "something-else", visible: true } },
      "home",
      "hero"
    );
    expect(draft?.entry.id).toBe("hero");
  });
});
