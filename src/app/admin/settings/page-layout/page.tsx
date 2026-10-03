import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { HOME_SECTIONS, PRODUCT_SECTIONS, resolveLayout } from "@/lib/page-layout";
import { PageLayoutEditor } from "./page-layout-editor";

// Admin > Settings > Page layout: order and visibility of the sections on the
// home page and on every product page.
export default async function AdminPageLayoutPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Page layout</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Choose which sections appear and in what order. The top of each page
        (hero, product photos and buy box) is fixed. To hide or add text on a
        single product, use its Page content panel in Products.
      </p>
      <PageLayoutEditor
        home={resolveLayout(settings.homeLayout, HOME_SECTIONS)}
        product={resolveLayout(settings.productPageLayout, PRODUCT_SECTIONS)}
      />
    </div>
  );
}
