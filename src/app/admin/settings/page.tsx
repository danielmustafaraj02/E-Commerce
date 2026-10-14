import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Store settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
