import { Link } from "@/components/localized-link";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShelfMain } from "@/components/shelf-main";

export default async function NotFound() {
  const dict = getDictionary(await getLocale());

  return (
    <ShelfMain>
      <div className="shelf-wrap shop-w-sm shop-center">
        <p className="shop-eyebrow">404</p>
        <h1 className="shop-title">{dict.notFound.title}</h1>
        <p className="shop-lede">{dict.notFound.body}</p>
        <div className="shop-actions">
          <Link href="/" className="btn-primary text-sm">
            {dict.notFound.backHome}
          </Link>
          <Link href="/products" className="btn-secondary text-sm">
            {dict.notFound.browseProducts}
          </Link>
        </div>
      </div>
    </ShelfMain>
  );
}
