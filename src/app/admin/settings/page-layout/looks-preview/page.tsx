import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/require-admin";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLookPageCopy, getLookEditorialDescription } from "@/lib/i18n/look-page-copy";
import { getAllLooks } from "@/lib/look-data";
import { getStoreSettings } from "@/lib/store-settings";
import { noIndexMetadata } from "@/lib/seo";
import { ShelfMain } from "@/components/shelf-main";
import { LookStylePreview } from "./look-style-preview";
import { LookRow } from "@/components/look-editorial";
import { EDITORIAL_TEMPLATE_IDS, EDITORIAL_TEMPLATE_META } from "@/lib/look-templates";
import "./look-style-preview.css";

// home.css / shop.css come in with <ShelfMain>, which is the shelf-design page
// shell — the same one /looks uses, so the templates preview in their real
// typographic and colour context.

export const metadata: Metadata = noIndexMetadata;

/**
 * Admin > Settings > Page layout > Looks > Options > "Compare all styles".
 *
 * A private side-by-side of the editorial Look templates over the store's
 * own real looks, so the choice is made from the actual catalogue rather than a
 * mock. Staff-only and noindexed: it is a workbench, not a page of the site.
 *
 * The catalogue and storefront templates render on the server. The client
 * workbench receives those rendered panels and owns only selection and width.
 */
export default async function LookStylePreviewPage() {
  await requireStaff();
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const looks = await getAllLooks(locale, 3);
  if (looks.length === 0) {
    return (
      <div className="look-preview-message">
        <h1>No looks to preview yet</h1>
        <p>Create an active look with three active products to compare editorial styles.</p>
        <Link href="/admin/looks">Manage looks</Link>
      </div>
    );
  }

  const dict = getDictionary(locale);
  const copy = getLookPageCopy(locale);
  const labels = {
    view: dict.looks.viewLook,
    save: dict.look.save,
    pieces: dict.looks.pieces,
    included: copy.editorialIncluded,
                    viewPiece: copy.viewPiece,
    price: copy.editorialPrice,
    kinds: dict.giftFinder.preference,
  };

  // One look per template where the catalogue allows, so the compositions
  // are not all showing the same set.
  const templates = [
    { id: "editorial" as const, name: "Editorial", note: "A quiet balance of imagery and copy" },
    ...EDITORIAL_TEMPLATE_IDS.map((id) => ({ id, ...EDITORIAL_TEMPLATE_META[id] })),
  ];
  // Render the actual storefront components on the server. Only the workbench
  // controls need client JavaScript; the catalogue and template markup do not.
  const previews = templates.map((template, index) => {
    const look = looks[index % looks.length];
    return {
      ...template,
      lookName: look.name,
      content: (
        <LookRow
          style={template.id}
          index={index}
          heading="h3"
          look={look}
          locale={settings.defaultLocale}
          labels={{ ...labels, description: getLookEditorialDescription(look.name, locale) }}
        />
      ),
    };
  });

  return (
    <ShelfMain as="div">
      <LookStylePreview previews={previews} />
    </ShelfMain>
  );
}
