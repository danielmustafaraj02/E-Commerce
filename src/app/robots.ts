import type { MetadataRoute } from "next";
import { getStoreSettings } from "@/lib/store-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/account-scoped and non-content routes — nothing here is
      // meant to be indexed or is useful to a search result.
      disallow: ["/admin", "/account", "/cart", "/checkout", "/api", "/order-confirmation"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
