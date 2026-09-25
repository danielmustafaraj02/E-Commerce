import { Link } from "@/components/localized-link";
import { applyTemplate } from "@/lib/i18n/format";
import { COMPOSED_LOOK_DISCOUNT_PERCENT } from "@/lib/looks";

// The invitation to /looks/compose, on the home page and the looks page.
export function ComposePromo({
  labels,
}: {
  labels: { kicker: string; title: string; subtitle: string; cta: string };
}) {
  return (
    <aside className="compose-promo">
      <p className="compose-promo-figure" aria-hidden="true">
        −{COMPOSED_LOOK_DISCOUNT_PERCENT}%
      </p>
      <div className="compose-promo-text">
        <p className="compose-promo-kicker">{labels.kicker}</p>
        <h3 className="compose-promo-title">{labels.title}</h3>
        <p className="compose-promo-body">
          {applyTemplate(labels.subtitle, { percent: COMPOSED_LOOK_DISCOUNT_PERCENT })}
        </p>
      </div>
      <Link href="/looks/compose" className="shelf-button compose-promo-cta">
        {labels.cta}
        <span aria-hidden="true" className="shelf-button-arrow">
          →
        </span>
      </Link>
    </aside>
  );
}
