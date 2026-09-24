"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { GiftCardPreview } from "@/components/gift-card-preview";
import { useCartStore } from "@/lib/cart-store";
import {
  GIFT_CARD_FONTS,
  GIFT_CARD_MESSAGE_MAX,
  GIFT_CARD_NAME_MAX,
  giftCardLines,
  type GiftCardFont,
} from "@/lib/gift-card";
import { GIFT_CARD_FONT_FAMILY } from "@/lib/gift-card-fonts";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { GiftCard } from "@/lib/gift-card";
import "./gift-card.css";

type DesignerProps = { dict: Dictionary["giftCard"]; price: string; brand: string };

const noopSubscribe = () => () => {};

// The personalised card designer. The saved card (for "Edit" from the cart)
// lives only in the browser, so the first render matches the server's empty
// form and the form is remounted with the saved card once running client-side.
export function GiftCardDesigner(props: DesignerProps) {
  const inBrowser = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const saved = useCartStore((state) => state.giftCard);
  const initial = inBrowser ? saved : null;
  return <DesignerForm key={initial ? "saved" : "new"} initial={initial} {...props} />;
}

// Every field redraws the preview as it changes; "Add" stores the card with
// the cart (checkout charges it).
function DesignerForm({ dict, price, brand, initial }: DesignerProps & { initial: GiftCard | null }) {
  const router = useRouter();
  const setGiftCard = useCartStore((state) => state.setGiftCard);
  const saved = initial;

  const [messageType, setMessageType] = useState<"preset" | "custom">(
    initial?.messageType ?? "preset"
  );
  const [preset, setPreset] = useState(
    initial?.messageType === "preset" ? initial.message : dict.presets[0]
  );
  const [custom, setCustom] = useState(initial?.messageType === "custom" ? initial.message : "");
  const [recipient, setRecipient] = useState(initial?.recipient ?? "");
  const [sender, setSender] = useState(initial?.sender ?? "");
  const [font, setFont] = useState<GiftCardFont>(initial?.font ?? "serif");
  const [error, setError] = useState(false);


  const message = messageType === "preset" ? preset : custom;
  const lines = giftCardLines(
    { message: message || " ", recipient, sender },
    { forLine: dict.forLine, fromLine: dict.fromLine }
  );

  const add = () => {
    if (!message.trim()) {
      setError(true);
      return;
    }
    setGiftCard({
      messageType,
      message: message.trim(),
      recipient: recipient.trim() || undefined,
      sender: sender.trim() || undefined,
      font,
    });
    router.push("/cart");
  };

  return (
    <div className="gc-designer">
      <div className="gc-stage">
        <p className="gc-step-kicker">{dict.previewTitle}</p>
        <GiftCardPreview lines={lines} font={font} brand={brand} />
      </div>

      <div className="gc-form">
        <section className="gc-step">
          <h2 className="gc-step-title">
            <span className="gc-step-number" aria-hidden="true">
              I
            </span>
            {dict.intro}
          </h2>
          <div className="gc-names">
            <label className="gc-field">
              <span>{dict.recipientLabel}</span>
              <input
                type="text"
                value={recipient}
                maxLength={GIFT_CARD_NAME_MAX}
                placeholder={dict.recipientPlaceholder}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </label>
            <label className="gc-field">
              <span>{dict.senderLabel}</span>
              <input
                type="text"
                value={sender}
                maxLength={GIFT_CARD_NAME_MAX}
                placeholder={dict.senderPlaceholder}
                onChange={(e) => setSender(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="gc-step">
          <h2 className="gc-step-title">
            <span className="gc-step-number" aria-hidden="true">
              II
            </span>
            {dict.messageTitle}
          </h2>
          <div className="gc-tabs" role="tablist">
            {(["preset", "custom"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={messageType === type}
                className="gc-tab"
                onClick={() => {
                  setMessageType(type);
                  setError(false);
                }}
              >
                {type === "preset" ? dict.presetTab : dict.customTab}
              </button>
            ))}
          </div>

          {messageType === "preset" ? (
            <div className="gc-presets" role="radiogroup" aria-label={dict.presetTab}>
              {dict.presets.map((text) => (
                <label key={text} className="gc-preset">
                  <input
                    type="radio"
                    name="gc-preset"
                    checked={preset === text}
                    onChange={() => setPreset(text)}
                  />
                  <span>{text}</span>
                </label>
              ))}
            </div>
          ) : (
            <label className="gc-field gc-custom">
              <span className="sr-only">{dict.customTab}</span>
              <textarea
                value={custom}
                maxLength={GIFT_CARD_MESSAGE_MAX}
                rows={4}
                placeholder={dict.customPlaceholder}
                aria-invalid={error && !custom.trim()}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setError(false);
                }}
              />
              <span className="gc-counter" aria-live="polite">
                {custom.length}/{GIFT_CARD_MESSAGE_MAX}
              </span>
            </label>
          )}
        </section>

        <section className="gc-step">
          <h2 className="gc-step-title">
            <span className="gc-step-number" aria-hidden="true">
              III
            </span>
            {dict.fontTitle}
          </h2>
          <div className="gc-fonts" role="radiogroup" aria-label={dict.fontTitle}>
            {GIFT_CARD_FONTS.map((key) => (
              <label key={key} className="gc-font">
                <input
                  type="radio"
                  name="gc-font"
                  checked={font === key}
                  onChange={() => setFont(key)}
                />
                <span className="gc-font-sample" style={{ fontFamily: GIFT_CARD_FONT_FAMILY[key] }}>
                  Aa
                </span>
                <span className="gc-font-name">{dict.fonts[key]}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Phones: the card again, as it now stands, right above the button. */}
        <div className="gc-final-preview" aria-hidden="true">
          <GiftCardPreview lines={lines} font={font} brand={brand} size="small" />
        </div>

        <div className="gc-add">
          {error && (
            <p className="gc-error" role="alert">
              {dict.emptyError}
            </p>
          )}
          <button type="button" className="btn-primary gc-add-button" onClick={add}>
            {saved ? dict.update : applyTemplate(dict.add, { price })}
          </button>
          <p className="gc-note">{dict.printedNote}</p>
        </div>
      </div>
    </div>
  );
}
