import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates } from "@/lib/hreflang";
import { getLookById } from "@/lib/look-data";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead } from "@/components/shelf-page";
import { CompleteTheLook } from "@/components/complete-the-look";

export async function generateMetadata({ params }: PageProps<"/looks/[id]">): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  const look = await getLookById(id, locale);
  if (!look) return {};
  const dict = getDictionary(locale).looks;
  const image = look.imageUrl ?? look.pieces.find((p) => p.imageUrl)?.imageUrl;
  const description = `${look.pieces.map((p) => p.name).join(", ")}. ${dict.metaDescription}`;
  const canonical = `/looks/${look.id}`;
  return {
    title: look.name,
    description,
    alternates: { canonical, languages: hreflangAlternates(canonical) },
    openGraph: {
      title: look.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function LookPage({ params }: PageProps<"/looks/[id]">) {
  const [{ id }, settings, locale] = await Promise.all([params, getStoreSettings(), getLocale()]);
  const look = await getLookById(id, locale);
  if (!look) notFound();
  const dict = getDictionary(locale);

  return (
    <ShelfMain>
      <ShelfHead title={look.name} width="full">
        <p className="shop-lede">{dict.looks.subtitle}</p>
        <Link href="/looks" className="look-back">
          <span aria-hidden="true">←</span> {dict.looks.backToLooks}
        </Link>
      </ShelfHead>
      {/* No piece is "this piece" here: the look itself is the page. */}
      <CompleteTheLook
        look={look}
        currentProductId=""
        locale={settings.defaultLocale}
        dict={dict.look}
        outOfStockLabel={dict.product.outOfStock}
      />
    </ShelfMain>
  );
}
