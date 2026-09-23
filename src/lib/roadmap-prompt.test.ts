import { describe, expect, it } from "vitest";
import { roadmapTaskPrompt } from "./roadmap-prompt";

describe("roadmapTaskPrompt", () => {
  it("wraps the task in the prompt-engineer instructions, with the task last", () => {
    const prompt = roadmapTaskPrompt({
      title: "Add a size guide",
      description: "  Rings and bracelets, in cm.  ",
      priority: "high",
    });

    expect(prompt).toMatch(/^You are an expert prompt engineer/);
    expect(prompt).toContain("TASK:\n");
    expect(prompt).toContain("QUALITY CHECK:\n");
    expect(prompt).toMatch(
      /## MY ROUGH IDEA \(high priority\)\n\nAdd a size guide\n\nRings and bracelets, in cm\.$/
    );
  });

  it("ends with the title when there are no details", () => {
    const prompt = roadmapTaskPrompt({ title: "Fix footer", description: null, priority: "low" });

    expect(prompt).toMatch(/## MY ROUGH IDEA \(low priority\)\n\nFix footer$/);
  });
});
