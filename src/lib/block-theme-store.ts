import { cache } from "react";
import { db } from "@/lib/db";
import { blockThemeCss, parseBlockTheme, type BlockTheme } from "@/lib/block-theme";

/** Stored in the PageLayout table under a reserved key, so it needs no migration
 *  of its own. A missing row or an unreachable database simply means no overrides. */
export const BLOCK_THEME_KEY = "block-theme";

export const getBlockTheme = cache(async (): Promise<BlockTheme> => {
  try {
    const row = await db.pageLayout.findUnique({
      where: { target: BLOCK_THEME_KEY },
      select: { layout: true },
    });
    return parseBlockTheme(row?.layout);
  } catch {
    return {};
  }
});

/** The ready-to-print stylesheet (empty when nothing is customised). */
export async function getBlockThemeCss(): Promise<string> {
  return blockThemeCss(await getBlockTheme());
}
