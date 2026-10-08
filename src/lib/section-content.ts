import type { LayoutEntry } from "@/lib/page-layout";
import { compileBuilder } from "@/lib/section-builder";

/** What replaces a section's own markup, if anything: its builder design,
 *  a custom section's HTML + CSS, or hand-edited HTML. Null = the built-in
 *  section renders as usual. `wrapped` content gets the centred section frame. */
export function entryContent(
  entry: LayoutEntry,
  opts: { edit?: boolean } = {}
): { html: string; css: string; wrapped: boolean; full?: boolean } | null {
  if (entry.builder)
    return {
      ...compileBuilder(entry.builder, opts),
      wrapped: true,
      full: entry.builder.width === "full",
    };
  if (entry.custom) return { html: entry.custom.html, css: entry.custom.css, wrapped: true };
  if (entry.html !== undefined) return { html: entry.html, css: "", wrapped: false };
  return null;
}

/** The class of the frame around replaced content. */
export const innerClass = (content: { wrapped: boolean; full?: boolean }) =>
  content.wrapped
    ? content.full
      ? "custom-section-inner custom-section-inner--full"
      : "custom-section-inner"
    : undefined;
