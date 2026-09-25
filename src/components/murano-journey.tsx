"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { Reveal } from "@/components/reveal";
import { useRecentlyViewedProducts } from "@/lib/use-recently-viewed";
import { formatMoney } from "@/lib/format";
import type { JourneyEntry } from "@/lib/journey";
import type { JourneyCard } from "@/app/api/journey/route";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import "./murano-journey.css";

type Props = {
  dict: Dictionary["journey"];
  // Locale prices are formatted in (the store's, like the shelf cards).
  locale: string;
  // The piece on this page, left out of its own journey.
  excludeId?: string;
  // Also suggest pieces that go with the journey (not on product pages,
  // which have their own recommendations).
  related?: boolean;
  // With nothing viewed yet, invite the visitor in instead of hiding.
  emptyState?: boolean;
};

const noopSubscribe = () => () => {};
const SIZES = "(min-width: 64rem) 15rem, (min-width: 48rem) 30vw, 62vw";

// "Your Murano Journey": the pieces recently looked at in this browser
// (lib/use-recently-viewed.ts), shown as a quiet continuation of the page.
// Nothing renders on the server or while hydrating; the stored pieces show at
// once and are then refreshed (current price and name, removed pieces
// forgotten) with a single request to /api/journey.
export function MuranoJourney({ dict, locale, excludeId, related = false, emptyState = false }: Props) {
  const inBrowser = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { entries, returning, forget } = useRecentlyViewedProducts();
  const shown = entries.filter((entry) => entry.id !== excludeId);
  const idsKey = shown.map((entry) => entry.id).join(",");
  const headingId = useId();

  const [fresh, setFresh] = useState<{
    key: string;
    products: Map<string, JourneyCard>;
    related: JourneyCard[];
  } | null>(null);

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    fetch(`/api/journey?ids=${encodeURIComponent(idsKey)}${related ? "&related=1" : ""}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { products: JourneyCard[]; related: JourneyCard[] } | null) => {
        if (!data) return;
        const products = new Map(data.products.map((card) => [card.id, card]));
        forget(idsKey.split(",").filter((id) => !products.has(id)));
        setFresh({ key: idsKey, products, related: data.related });
      })
      .catch(() => {
        // Offline or aborted: the stored snapshot stays on show.
      });
    return () => controller.abort();
  }, [idsKey, related, forget]);

  if (!inBrowser) return null;

  if (shown.length === 0) {
    if (!emptyState || entries.length > 0) return null;
    return (
      <section className="shelf-section journey journey--empty" aria-labelledby={headingId}>
        <Reveal className="shelf-wrap journey-reveal">
          <h2 id={headingId} className="shelf-heading">
            {dict.emptyTitle}
          </h2>
          <p className="journey-sub">{dict.emptyBody}</p>
          <JourneyCta href="/products" label={dict.emptyCta} />
        </Reveal>
      </section>
    );
  }

  const cards = shown.map((entry) =>
    fresh?.key === idsKey && fresh.products.get(entry.id)
      ? fresh.products.get(entry.id)!
      : fromEntry(entry, locale)
  );
  const relatedCards = related && fresh?.key === idsKey ? fresh.related : [];
  const title = returning ? dict.welcomeBack : dict.title;
  const sub = returning ? dict.welcomeBackSub : shown.length === 1 ? dict.subOne : dict.subMany;

  return (
    <section className="shelf-section journey" aria-labelledby={headingId}>
      <Reveal className="shelf-wrap journey-reveal">
        <header className="journey-head">
          <h2 id={headingId} className="shelf-heading">
            {title}
          </h2>
          <p className="journey-sub">{sub}</p>
        </header>

        <ul className="journey-row" data-count={cards.length}>
          {cards.map((card) => (
            <JourneyItem key={card.id} card={card} seenLabel={dict.seenLabel} />
          ))}
        </ul>

        <JourneyCta href="/products" label={dict.cta} />

        {relatedCards.length > 0 && (
          <div className="journey-related">
            <h3 className="journey-related-title">{dict.relatedTitle}</h3>
            <ul className="journey-row" data-count={relatedCards.length}>
              {relatedCards.map((card) => (
                <JourneyItem key={card.id} card={card} />
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function fromEntry(entry: JourneyEntry, locale: string): JourneyCard {
  return {
    id: entry.id,
    slug: entry.slug,
    name: entry.name,
    priceLabel: formatMoney(entry.price, entry.currency, locale),
    image: entry.image,
    imageAlt: entry.name,
  };
}

// A piece: the photo leads, name and price underneath; the whole card is the
// link. A viewed piece carries a small gold mark in the photo's corner, like a
// bookmark, named for screen readers. Each card eases in once as it mounts:
// the first ones while the section is still hidden (before its reveal), so
// only a piece joining later is seen arriving.
function JourneyItem({ card, seenLabel }: { card: JourneyCard; seenLabel?: string }) {
  return (
    <li className="journey-card">
      <div className="shelf-item-photo journey-photo">
        {card.image && <CatalogImage src={card.image} alt={card.imageAlt} fill sizes={SIZES} />}
        {seenLabel && <span className="journey-mark" aria-hidden="true" />}
      </div>
      <h3 className="shelf-item-name journey-name">
        <Link href={`/products/${card.slug}`} prefetch={false}>
          {card.name}
          {seenLabel && <span className="sr-only"> ({seenLabel})</span>}
        </Link>
      </h3>
      <span className="shelf-item-price">{card.priceLabel}</span>
    </li>
  );
}

function JourneyCta({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="journey-cta">
      <span className="journey-cta-label">{label}</span>
      <span className="journey-cta-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
