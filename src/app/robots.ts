import type { MetadataRoute } from "next";
import { getStoreSettings } from "@/lib/store-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      // The more specific Allow wins over `Disallow: /api`: Merchant Center
      // fetches the product feed from here.
      allow: ["/", "/api/feeds/google-merchant"],
      // Private/account-scoped and non-content routes — nothing here is
      // meant to be indexed or is useful to a search result. The locale-
      // prefixed ones (everything but /admin and /api, which are never
      // localized) need the leading `/*/` wildcard since Disallow only
      // matches from the start of the path — a bare "/account" no longer
      // matches "/it/account" now that locale lives in the URL.
      disallow: [
        "/admin",
        "/api",
        "/*/account",
        "/*/cart",
        "/*/checkout",
        "/*/order-confirmation",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
