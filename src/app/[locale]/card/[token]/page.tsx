import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { giftCardFontClasses } from "@/lib/gift-card-fonts";
import { giftCardLines } from "@/lib/gift-card-lines";
import { GIFT_CARD_FONTS, parseGiftCardBack, parseGiftCardStickers, type GiftCardFont } from "@/lib/gift-card";
import { ShelfMain } from "@/components/shelf-main";
import { GiftCard3D } from "@/components/gift-card-3d";
import "@/components/gift-card.css";
import "./card-page.css";

// Rendered per request, never cached: this page handles a visitor's own data
// or a payment, so it keeps the strict per-request CSP nonce (see proxy.ts,
// STRICT_CSP_PATH), which a cached page could not carry.
export const dynamic = "force-dynamic";

// A personal page: never indexed, never shared through search.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The digital gift card as its recipient opens it, from the link in their
// email. The token is the only key; the card exists once its order is paid.
export default async function GiftCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[\w-]{20,40}$/.test(token)) notFound();

  const [order, settings, locale] = await Promise.all([
    db.order.findUnique({
      where: { giftCardToken: token },
      select: {
        status: true,
        giftCardMessage: true,
        giftCardRecipient: true,
        giftCardSender: true,
        giftCardFont: true,
        giftCardStickers: true,
        giftCardBack: true,
      },
    }),
    getStoreSettings(),
    getLocale(),
  ]);
  if (!order?.giftCardMessage || !["paid", "processing", "shipped", "delivered"].includes(order.status)) {
    notFound();
  }

  const dict = getDictionary(locale).giftCard;
  const font: GiftCardFont = (GIFT_CARD_FONTS as readonly string[]).includes(order.giftCardFont ?? "")
    ? (order.giftCardFont as GiftCardFont)
    : "serif";
  const lines = giftCardLines(
    {
      message: order.giftCardMessage,
      recipient: order.giftCardRecipient ?? undefined,
      sender: order.giftCardSender ?? undefined,
    },
    dict
  );
  const sender = order.giftCardSender?.trim();

  return (
    <ShelfMain>
      <div className={`card-page ${giftCardFontClasses}`}>
        <p className="card-page-kicker">{settings.storeName} · Murano</p>
        <h1 className="card-page-title">
          {sender ? dict.cardPageTitle.replace("{sender}", sender) : dict.cardPageTitleAnon}
        </h1>
        <div className="card-page-card">
          <GiftCard3D
            lines={lines}
            font={font}
            brand={settings.storeName}
            stickers={parseGiftCardStickers(order.giftCardStickers)}
            back={parseGiftCardBack(order.giftCardBack)}
            labels={{ seeBack: dict.seeBack, seeFront: dict.seeFront }}
          />
        </div>
        <p className="card-page-note">{dict.cardPageNote}</p>
        <Link href="/products" className="shelf-button card-page-cta">
          {dict.cardPageCta}
          <span aria-hidden="true" className="shelf-button-arrow">
            →
          </span>
        </Link>
      </div>
    </ShelfMain>
  );
}
