import { CatalogImage } from "@/components/catalog-image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { QuickAddButton } from "@/components/quick-add-button";

type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  stockQty: number;
  images: { url: string; altText: string }[];
};

export function ProductCard({
  product,
  locale,
  outOfStockLabel,
  quickAddLabel,
  addedLabel,
}: {
  product: ProductCardData;
  locale: string;
  outOfStockLabel: string;
  quickAddLabel?: string;
  addedLabel?: string;
}) {
  const outOfStock = product.stockQty <= 0;

  // The card is a <div> with a stretched link (the name's ::after fills the
  // card) rather than one big <Link>: the quick-add <button> can then be a
  // sibling of the link instead of interactive content nested inside an <a>.
  return (
    <div className="group relative flex flex-col gap-2 transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white transition-shadow duration-300 group-hover:shadow-lg">
        {product.images[0] && (
          <CatalogImage
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        {outOfStock && (
          <span className="bg-foreground text-background absolute top-2 left-2 rounded px-2 py-0.5 text-xs">
            {outOfStockLabel}
          </span>
        )}
        {!outOfStock && quickAddLabel && (
          <QuickAddButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              currency: product.currency,
              imageUrl: product.images[0]?.url ?? null,
            }}
            label={quickAddLabel}
            addedLabel={addedLabel}
          />
        )}
      </div>
      <Link
        href={`/products/${product.slug}`}
        className="group-hover:text-primary text-sm font-medium break-words transition-colors after:absolute after:inset-0"
      >
        {product.name}
      </Link>
      <span className="text-foreground/70 text-sm tabular-nums">
        {formatMoney(product.price, product.currency, locale)}
      </span>
    </div>
  );
}
