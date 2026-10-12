import type { Metadata } from "next";
import ProductsPage from "@/app/products/page";
import { getStoreSettings, ogImage } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { NEW_COLLECTION, getNewCollectionCopy } from "@/lib/new-collection";

// The new collection: the shop's own listing, limited to the collection's
// pieces (lib/new-collection.ts). Same grid, sorting and filters as /products.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const copy = getNewCollectionCopy(locale);
  const description = copy.metaDescription(settings.storeName);
  const image = ogImage(settings);
  return {
    title: copy.title,
    description,
    alternates: {
      canonical: localizedCanonical(locale, NEW_COLLECTION.path),
      languages: hreflangAlternates(NEW_COLLECTION.path),
    },
    openGraph: { title: copy.title, description, type: "website", images: image ? [{ url: image }] : undefined },
  };
}

export default async function NewCollectionPage({ searchParams }: PageProps<"/new-collection">) {
  const params: PageProps<"/products">["searchParams"] = searchParams.then((raw) => ({
    ...raw,
    collection: "new",
  }));
  return ProductsPage({ params: Promise.resolve({}), searchParams: params });
}
