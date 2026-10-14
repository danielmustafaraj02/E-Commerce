import { requireAdmin } from "@/lib/require-admin";
import { getBlockTheme } from "@/lib/block-theme-store";
import { BlockStylesForm } from "./block-styles-form";

// Admin > Settings > Block styles: one look per kind of builder block.
export default async function AdminBlockStylesPage() {
  await requireAdmin();
  const theme = await getBlockTheme();
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Block styles</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Set how each kind of block looks everywhere it is used: buttons, headings, lines, quotes,
        counters and the rest. The sample on the right updates as you change a setting. Nothing
        applies to the site until you save, and a block&apos;s own Style tab still overrides
        these.
      </p>
      <BlockStylesForm initial={theme} />
    </div>
  );
}
