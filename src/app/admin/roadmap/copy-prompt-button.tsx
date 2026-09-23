"use client";

import { useState } from "react";
import { roadmapTaskPrompt } from "@/lib/roadmap-prompt";

export function CopyPromptButton({
  task,
}: {
  task: { title: string; description: string | null; priority: string };
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(roadmapTaskPrompt(task));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (insecure context, denied permission) —
      // the details are still on the page to select by hand.
    }
  }

  return (
    <button type="button" onClick={copy} className="text-primary hover:underline">
      {copied ? "Copied!" : "Copy prompt"}
    </button>
  );
}
