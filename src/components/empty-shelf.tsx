import Link from "next/link";
import { BeadStrand } from "@/components/bead-strand";

// Empty cart / wishlist: a strand of glass beads, one line in the display
// serif, one sentence, one way forward.
export function EmptyShelf({
  title,
  body,
  cta,
  href = "/products",
}: {
  title: string;
  body: string;
  cta: string;
  href?: string;
}) {
  return (
    <div className="shop-empty-atelier">
      <BeadStrand className="shop-empty-strand" />
      <h2 className="shop-empty-title">{title}</h2>
      <p className="shop-empty-body">{body}</p>
      <Link href={href} className="shelf-button">
        {cta}
        <span aria-hidden="true" className="shelf-button-arrow">
          →
        </span>
      </Link>
      <p className="shop-empty-signature" aria-hidden="true" translate="no">
        Murano · Venezia
      </p>
    </div>
  );
}
