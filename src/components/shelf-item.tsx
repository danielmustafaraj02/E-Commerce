import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { QuickAddButton } from "@/components/quick-add-button";
import { formatMoney } from "@/lib/format";

type ShelfItemData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  stockQty: number;
  images: { url: string; altText: string }[];
};

// One piece on the home page's shelf (styles in app/home.css). Same structure
// as ProductCard — a stretched link on the name with the quick-add button as a
// sibling rather than nested inside the link — but without the box: the photo
// sits directly on the page.
export function ShelfItem({
  product,
  locale,
  outOfStockLabel,
  quickAddLabel,
  addedLabel,
}: {
  product: ShelfItemData;
  locale: string;
  outOfStockLabel: string;
  quickAddLabel: string;
  addedLabel: string;
}) {
  const outOfStock = product.stockQty <= 0;
  const image = product.images[0];

  return (
    <li className="shelf-item group">
      <div className="shelf-item-photo">
        {image && (
          <CatalogImage
            src={image.url}
            alt={image.altText || product.name}
            fill
            sizes="(min-width: 64rem) 15rem, (min-width: 48rem) 25vw, 50vw"
          />
        )}
        {outOfStock && <span className="shelf-badge">{outOfStockLabel}</span>}
        {!outOfStock && (
          <QuickAddButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              currency: product.currency,
              imageUrl: image?.url ?? null,
            }}
            label={quickAddLabel}
            addedLabel={addedLabel}
          />
        )}
      </div>
      <h3 className="shelf-item-name">
        <Link href={`/products/${product.slug}`}>{product.name}</Link>
      </h3>
      <span className="shelf-item-price">
        {formatMoney(product.price, product.currency, locale)}
      </span>
    </li>
  );
}
