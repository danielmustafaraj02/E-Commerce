// Text behind the "Copy prompt" button on Admin > Roadmap, for pasting a task
// into a Claude session by hand. Kept free of server imports: the button is a
// client component.

export function roadmapTaskPrompt(task: {
  title: string;
  description: string | null;
  priority: string;
}): string {
  return [
    `Task from the Perla Murano Glass roadmap (Admin > Roadmap), ${task.priority} priority:`,
    `# ${task.title}`,
    task.description?.trim(),
    [
      "Before coding: read CLAUDE.md and AGENTS.md, look at the page or content this is about " +
        "(the live site and the code that renders it), and restate the task as a precise goal.",
      "Write the tests first, then the change; `npm run typecheck`, `npm run lint` and " +
        "`npm test` must pass. Work on a branch and open a PR — never push to main.",
      "At the end, list the main changes and what I should check to see that it works.",
    ].join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}
