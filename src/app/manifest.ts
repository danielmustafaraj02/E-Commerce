import type { MetadataRoute } from "next";
import { getStoreSettings } from "@/lib/store-settings";

// Lets Android/Chrome offer "Add to Home Screen" and launch the store in
// standalone mode (its own window, no browser chrome) — the biggest single
// lever for a phone visitor to feel like they're in an app rather than a
// browser tab. iOS Safari mostly ignores this file; layout.tsx's
// metadata.appleWebApp covers it instead.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getStoreSettings();
  return {
    name: settings.storeName,
    short_name: settings.storeName,
    description: settings.metaDescription || `Shop at ${settings.storeName}`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
