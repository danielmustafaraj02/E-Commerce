import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedName } from "@/lib/product-i18n";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, pieces] = await Promise.all([
    getStoreSettings(),
    // The pieces a "why Murano" row can show: published, visible, with a photo.
    db.product.findMany({
      where: { active: true, unlisted: false, images: { some: {} } },
      select: { id: true, name: true, nameEn: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const home = getDictionary("en").home;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Store settings</h1>
      <SettingsForm
        settings={settings}
        reasonPieces={pieces.map((piece) => ({ id: piece.id, name: localizedName(piece, "en") }))}
        reasonTitles={[home.muranoReason1Title, home.muranoReason2Title, home.muranoReason3Title]}
      />
    </div>
  );
}
