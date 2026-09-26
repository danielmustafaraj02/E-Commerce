import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { QuickAddButton } from "@/components/quick-add-button";
import { formatMoney, formatDiscountPercent } from "@/lib/format";

type ShelfItemData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  // Set only for the homepage Special Selection — a real "was" price, never
  // charged, shown crossed out alongside a computed discount badge.
  compareAtPrice?: number | null;
  currency: string;
  stockQty: number;
  images: { url: string; altText: string }[];
};

// One piece on a shelf (styles in app/home.css): the home page and the product
// listings. A stretched link on the name with the quick-add button as a sibling
// rather than nested inside the link, and no box — the photo sits directly on
// the page.
export function ShelfItem({
  product,
  locale,
  outOfStockLabel,
  quickAddLabel,
  addedLabel,
  sizes = "(min-width: 64rem) 15rem, (min-width: 48rem) 25vw, 50vw",
}: {
  product: ShelfItemData;
  locale: string;
  outOfStockLabel: string;
  quickAddLabel: string;
  addedLabel: string;
  sizes?: string;
}) {
  const outOfStock = product.stockQty <= 0;
  const image = product.images[0];
  const hasDiscount =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice !== null &&
    product.compareAtPrice > product.price;

  return (
    <li className="shelf-item group">
      <div className="shelf-item-photo">
        {image && (
          <CatalogImage src={image.url} alt={image.altText || product.name} fill sizes={sizes} />
        )}
        {outOfStock && <span className="shelf-badge">{outOfStockLabel}</span>}
        {!outOfStock && hasDiscount && (
          <span className="shelf-discount-badge">
            {formatDiscountPercent(product.price, product.compareAtPrice as number, locale)}
          </span>
        )}
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
        {hasDiscount && (
          <span className="shelf-item-price-compare">
            {formatMoney(product.compareAtPrice as number, product.currency, locale)}
          </span>
        )}
        {formatMoney(product.price, product.currency, locale)}
      </span>
    </li>
  );
}
