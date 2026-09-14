import Image from "next/image";
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
}: {
  product: ProductCardData;
  locale: string;
  outOfStockLabel: string;
  quickAddLabel?: string;
}) {
  const outOfStock = product.stockQty <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2 transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-lg transition-shadow duration-300 group-hover:shadow-lg">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
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
          />
        )}
      </div>
      <span className="group-hover:text-primary text-sm font-medium transition-colors">
        {product.name}
      </span>
      <span className="text-foreground/70 text-sm">
        {formatMoney(product.price, product.currency, locale)}
      </span>
    </Link>
  );
}
