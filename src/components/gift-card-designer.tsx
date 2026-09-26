"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { useLocalizedRouter } from "@/components/localized-link";
import { GiftCardBackFace, GiftCardPreview, StickerArt } from "@/components/gift-card-preview";
import { GiftCardFlip } from "@/components/gift-card-3d";
import { useCartStore } from "@/lib/cart-store";
import {
  GIFT_CARD_BACKS,
  GIFT_CARD_FONTS,
  GIFT_CARD_MESSAGE_MAX,
  GIFT_CARD_NAME_MAX,
  GIFT_CARD_STICKERS,
  GIFT_CARD_STICKER_MAX,
  giftCardLines,
  type GiftCardBack,
  type GiftCardFont,
  type GiftCardSticker,
} from "@/lib/gift-card";
import { GIFT_CARD_FONT_FAMILY } from "@/lib/gift-card-fonts";
import { BACK_ART } from "@/lib/gift-card-art";
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

// Where a new motif lands: the first free corner, clear of the message.
const STICKER_SPOTS: [number, number][] = [
  [82, 16],
  [18, 16],
  [82, 86],
  [18, 86],
  [50, 88],
];
// Keeps a motif wholly on the card (it's 12% of the width, ~10% of the height).
const clampX = (x: number) => Math.min(94, Math.max(6, x));
const clampY = (y: number) => Math.min(95, Math.max(5, y));
const round = (n: number) => Math.round(n * 10) / 10;

function nextSpot(stickers: GiftCardSticker[]): [number, number] {
  return (
    STICKER_SPOTS.find(([x, y]) => stickers.every((s) => Math.hypot(s.x - x, s.y - y) > 8)) ??
    [50, 50]
  );
}

// Every field redraws the preview as it changes; "Add" stores the card with
// the cart (checkout charges it).
function DesignerForm({ dict, price, brand, initial }: DesignerProps & { initial: GiftCard | null }) {
  const router = useLocalizedRouter();
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
  const [stickers, setStickers] = useState<GiftCardSticker[]>(initial?.stickers ?? []);
  const [back, setBack] = useState<GiftCardBack>(initial?.back ?? "ivory");
  const [showBack, setShowBack] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const message = messageType === "preset" ? preset : custom;
  const lines = giftCardLines(
    { message: message || " ", recipient, sender },
    { forLine: dict.forLine, fromLine: dict.fromLine }
  );
  const showFront = () => setShowBack(false);

  const addSticker = (icon: GiftCardSticker["icon"]) => {
    if (stickers.length >= GIFT_CARD_STICKER_MAX) return;
    const [x, y] = nextSpot(stickers);
    setStickers([...stickers, { icon, x, y }]);
    setSelected(stickers.length);
    showFront();
  };
  const moveSticker = (index: number, x: number, y: number) =>
    setStickers((current) =>
      current.map((s, i) => (i === index ? { ...s, x: round(clampX(x)), y: round(clampY(y)) } : s))
    );
  const removeSticker = (index: number) => {
    setStickers((current) => current.filter((_, i) => i !== index));
    setSelected(null);
  };

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
      stickers,
      back,
    });
    router.push("/cart");
  };

  const front = (
    <GiftCardPreview
      lines={lines}
      font={font}
      brand={brand}
      overlay={
        <StickerLayer
          stickers={stickers}
          selected={selected}
          dict={dict}
          onSelect={setSelected}
          onMove={moveSticker}
          onRemove={removeSticker}
        />
      }
    />
  );

  return (
    <div className="gc-designer" id="design">
      <div className="gc-stage">
        <p className="gc-step-kicker">{dict.previewTitle}</p>
        <div className="gc-side-switch" role="group" aria-label={dict.previewTitle}>
          <button type="button" aria-pressed={!showBack} onClick={showFront}>
            {dict.sideFront}
          </button>
          <button type="button" aria-pressed={showBack} onClick={() => setShowBack(true)}>
            {dict.sideBack}
          </button>
        </div>
        <GiftCardFlip
          showBack={showBack}
          front={front}
          back={<GiftCardBackFace back={back} />}
        />
        {stickers.length > 0 && !showBack && <p className="gc-stage-hint">{dict.dragHint}</p>}
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
                onFocus={showFront}
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
                onFocus={showFront}
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
                  showFront();
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
                    onChange={() => {
                      setPreset(text);
                      showFront();
                    }}
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
                onFocus={showFront}
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
                  onChange={() => {
                    setFont(key);
                    showFront();
                  }}
                />
                <span className="gc-font-sample" style={{ fontFamily: GIFT_CARD_FONT_FAMILY[key] }}>
                  Aa
                </span>
                <span className="gc-font-name">{dict.fonts[key]}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="gc-step">
          <h2 className="gc-step-title">
            <span className="gc-step-number" aria-hidden="true">
              IV
            </span>
            {dict.stickersTitle}
          </h2>
          <p className="gc-step-help">
            {dict.stickersHelp}{" "}
            <span className="gc-step-count">
              {applyTemplate(dict.stickersCount, {
                count: stickers.length,
                max: GIFT_CARD_STICKER_MAX,
              })}
            </span>
          </p>
          <div className="gc-sticker-palette">
            {GIFT_CARD_STICKERS.map((icon) => (
              <button
                key={icon}
                type="button"
                className="gc-sticker-pick"
                disabled={stickers.length >= GIFT_CARD_STICKER_MAX}
                aria-label={applyTemplate(dict.addSticker, { name: dict.stickers[icon] })}
                title={dict.stickers[icon]}
                onClick={() => addSticker(icon)}
              >
                <StickerArt icon={icon} />
              </button>
            ))}
          </div>
          {stickers.length > 0 && (
            <ul className="gc-sticker-chips">
              {stickers.map((sticker, index) => (
                <li key={index}>
                  <span className="gc-sticker-chip-art">
                    <StickerArt icon={sticker.icon} />
                  </span>
                  {dict.stickers[sticker.icon]}
                  <button
                    type="button"
                    className="gc-sticker-remove"
                    aria-label={applyTemplate(dict.removeSticker, { name: dict.stickers[sticker.icon] })}
                    onClick={() => removeSticker(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="gc-step">
          <h2 className="gc-step-title">
            <span className="gc-step-number" aria-hidden="true">
              V
            </span>
            {dict.backTitle}
          </h2>
          <p className="gc-step-help">{dict.backHelp}</p>
          <div className="gc-backs" role="radiogroup" aria-label={dict.backTitle}>
            {GIFT_CARD_BACKS.map((key) => (
              <label key={key} className="gc-back-option">
                <input
                  type="radio"
                  name="gc-back"
                  checked={back === key}
                  onChange={() => {
                    setBack(key);
                    setShowBack(true);
                  }}
                />
                <span
                  className="gc-back-swatch"
                  style={{ background: BACK_ART[key].stock, color: BACK_ART[key].ink }}
                  aria-hidden="true"
                >
                  P
                </span>
                <span className="gc-font-name">{dict.backs[key]}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Phones: the card again, both sides as they now stand, right above the button. */}
        <div className="gc-final-preview" aria-hidden="true">
          <GiftCardPreview lines={lines} font={font} brand={brand} stickers={stickers} size="small" />
          <GiftCardBackFace back={back} size="small" />
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

// The motifs on the live preview: drag them (mouse or touch), or focus one
// and use the arrow keys; Delete removes it.
function StickerLayer({
  stickers,
  selected,
  dict,
  onSelect,
  onMove,
  onRemove,
}: {
  stickers: GiftCardSticker[];
  selected: number | null;
  dict: Dictionary["giftCard"];
  onSelect: (index: number | null) => void;
  onMove: (index: number, x: number, y: number) => void;
  onRemove: (index: number) => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  // Where on the motif it was grabbed, so it doesn't jump under the pointer.
  const grab = useRef<{ index: number; dx: number; dy: number } | null>(null);

  const toPercent = (event: PointerEvent) => {
    const rect = layerRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onPointerDown = (index: number) => (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toPercent(event);
    grab.current = { index, dx: point.x - stickers[index].x, dy: point.y - stickers[index].y };
    onSelect(index);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!grab.current) return;
    const point = toPercent(event);
    onMove(grab.current.index, point.x - grab.current.dx, point.y - grab.current.dy);
  };
  const onPointerUp = () => {
    grab.current = null;
  };
  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 8 : 2;
    const { x, y } = stickers[index];
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [x - step, y],
      ArrowRight: [x + step, y],
      ArrowUp: [x, y - step],
      ArrowDown: [x, y + step],
    };
    if (moves[event.key]) {
      event.preventDefault();
      onMove(index, ...moves[event.key]);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onRemove(index);
    }
  };

  return (
    <div ref={layerRef} className="gc-sticker-layer">
      {stickers.map((sticker, index) => (
        <button
          key={index}
          type="button"
          className="gc-sticker gc-sticker--live"
          data-selected={selected === index}
          style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
          aria-label={applyTemplate(dict.moveSticker, { name: dict.stickers[sticker.icon] })}
          onPointerDown={onPointerDown(index)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown(index)}
          onFocus={() => onSelect(index)}
          onBlur={() => onSelect(null)}
        >
          <StickerArt icon={sticker.icon} />
        </button>
      ))}
    </div>
  );
}
