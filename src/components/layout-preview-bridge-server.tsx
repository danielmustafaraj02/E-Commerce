import { getLocale } from "@/lib/i18n/locale";
import { flatSiteText } from "@/lib/builder-i18n-server";
import type { PageTarget } from "@/lib/page-layout";
import { LayoutPreviewBridge } from "./layout-preview-bridge";

/** The admin preview bridge, given this page's language and its site text so
 *  designs that use the site's own wording preview in the right language. */
export async function PreviewBridge({ target }: { target: PageTarget }) {
  const locale = await getLocale();
  return (
    <LayoutPreviewBridge target={target} locale={locale} siteText={await flatSiteText(locale)} />
  );
}
