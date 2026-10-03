import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { HOME_COPY_FIELDS, parseHomeCopy } from "@/lib/home-copy";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales } from "@/lib/i18n/locale-constants";
import { PageCopyEditor } from "./page-copy-editor";

// Admin > Settings > Page text: override the home page's headings and copy per
// language. Anything left empty keeps the built-in text.
export default async function AdminPageCopyPage() {
  await requireAdmin();
  const settings = await getStoreSettings();
  const overrides = parseHomeCopy(settings.homeCopy);

  // Built-in text per language, shown as the placeholder so staff see what an
  // empty field currently displays.
  const defaults = Object.fromEntries(
    locales.map((locale) => {
      const dict = getDictionary(locale) as unknown as Record<string, Record<string, string>>;
      return [
        locale,
        Object.fromEntries(
          HOME_COPY_FIELDS.map((f) => {
            const [group, name] = f.key.split(".");
            return [f.key, dict[group]?.[name] ?? ""];
          })
        ),
      ];
    })
  );

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Page text</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Edit the headings and copy on the home page, one language at a time. Leave a field empty to
        keep the built-in text.
      </p>
      <PageCopyEditor defaults={defaults} overrides={overrides} />
    </div>
  );
}
