"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import { CompleteTheLook } from "@/components/complete-the-look";
import { GIFT_FINDER_ATTRIBUTION_KEY } from "@/components/gift-finder-purchase-tracker";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { trackGiftFinderEvent } from "@/lib/gift-finder-analytics";
import type { LookView } from "@/lib/look-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  GIFT_BUDGETS,
  GIFT_OCCASIONS,
  GIFT_RECIPIENTS,
  GIFT_STYLES,
  PRODUCT_TYPES,
  buildWhyItMatches,
  scoreGiftCandidates,
  type FinderPreference,
  type GiftBudget,
  type GiftCandidateProduct,
  type GiftFinderAnswers,
  type GiftFinderMatch,
  type GiftOccasion,
  type GiftRecipient,
  type GiftStyle,
} from "@/lib/gift-finder";
import { OptionIcon, type OptionIconName } from "./option-icon";

export type GiftFinderCandidate = GiftCandidateProduct & { imageAlt: string };

type AnswerState = {
  recipient: GiftRecipient | null;
  occasion: GiftOccasion | null;
  style: GiftStyle | null;
  budget: GiftBudget | null;
  preference: FinderPreference | null;
};

const EMPTY_ANSWERS: AnswerState = {
  recipient: null,
  occasion: null,
  style: null,
  budget: null,
  preference: null,
};

const TOTAL_STEPS = 5;

type Option<V extends string> = { value: V; icon: OptionIconName };

const WHO_ICONS: Record<GiftRecipient, OptionIconName> = {
  partner: "heart",
  mother: "sparkle",
  friend: "star",
  daughter: "ring",
  myself: "diamond",
};
const OCCASION_ICONS: Record<GiftOccasion, OptionIconName> = {
  birthday: "sparkle",
  anniversary: "ring",
  christmas: "asterisk",
  valentines: "heart",
  thankyou: "star",
  justbecause: "diamond",
};
const STYLE_ICONS: Record<GiftStyle, OptionIconName> = {
  elegant: "diamond",
  colorful: "sparkle",
  minimal: "ring",
  romantic: "heart",
  bold: "bolt",
};
const PREFERENCE_ICONS: Record<FinderPreference, OptionIconName> = {
  necklace: "ring",
  bracelet: "band",
  earrings: "drop",
  notSure: "question",
  completeSet: "layers",
};

function useSteps(dict: Dictionary["giftFinder"]) {
  const who: Option<GiftRecipient>[] = GIFT_RECIPIENTS.map((value) => ({
    value,
    icon: WHO_ICONS[value],
  }));
  const occasion: Option<GiftOccasion>[] = GIFT_OCCASIONS.map((value) => ({
    value,
    icon: OCCASION_ICONS[value],
  }));
  const style: Option<GiftStyle>[] = GIFT_STYLES.map((value) => ({ value, icon: STYLE_ICONS[value] }));
  const budget: Option<GiftBudget>[] = GIFT_BUDGETS.map((value) => ({ value, icon: "tag" }));
  const preferenceValues: FinderPreference[] = [...PRODUCT_TYPES, "notSure", "completeSet"];
  const preference: Option<FinderPreference>[] = preferenceValues.map((value) => ({
    value,
    icon: PREFERENCE_ICONS[value],
  }));

  return [
    { key: "recipient" as const, title: dict.who.title, options: who, labels: dict.who },
    { key: "occasion" as const, title: dict.occasion.title, options: occasion, labels: dict.occasion },
    { key: "style" as const, title: dict.style.title, options: style, labels: dict.style },
    { key: "budget" as const, title: dict.budget.title, options: budget, labels: dict.budget },
    {
      key: "preference" as const,
      title: dict.preference.title,
      options: preference,
      labels: dict.preference,
    },
  ];
}

export function GiftFinderFlow({
  candidates,
  looks,
  dict,
  lookDict,
  locale,
  outOfStockLabel,
}: {
  candidates: GiftFinderCandidate[];
  looks: LookView[];
  dict: Dictionary["giftFinder"];
  lookDict: Dictionary["look"];
  locale: string;
  outOfStockLabel: string;
}) {
  const steps = useSteps(dict);
  const addItem = useCartStore((state) => state.addItem);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<AnswerState>(EMPTY_ANSWERS);
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [results, setResults] = useState<GiftFinderMatch<GiftFinderCandidate>[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [emailValue, setEmailValue] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const startedRef = useRef(false);
  const openedRef = useRef(false);
  const bundleClickedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    trackGiftFinderEvent("finder_opened", {});
  }, []);

  const currentStep = steps[step - 1];
  const currentAnswer = answers[currentStep.key];

  const markAttribution = () => {
    try {
      sessionStorage.setItem(GIFT_FINDER_ATTRIBUTION_KEY, "1");
    } catch {
      // storage blocked — the purchase just won't be attributed
    }
  };

  const selectOption = (value: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackGiftFinderEvent("finder_started", { step });
    }
    setAnswers((prev) => ({ ...prev, [currentStep.key]: value }));
  };

  const goNext = () => {
    if (!currentAnswer) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    const finalAnswers: GiftFinderAnswers = {
      recipient: answers.recipient,
      occasion: answers.occasion as GiftOccasion,
      style: answers.style as GiftStyle,
      budget: answers.budget as GiftBudget,
      preference: answers.preference as FinderPreference,
    };
    const matches = scoreGiftCandidates(candidates, finalAnswers);
    setResults(matches);
    setPhase("results");
    trackGiftFinderEvent("finder_completed", { resultCount: matches.length });
  };

  const goBack = () => {
    if (phase === "results") {
      setPhase("quiz");
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const startOver = () => {
    setStep(1);
    setAnswers(EMPTY_ANSWERS);
    setPhase("quiz");
    setResults([]);
    setAddedIds(new Set());
    setEmailStatus("idle");
    setEmailValue("");
    startedRef.current = false;
    bundleClickedRef.current = false;
  };

  const quickAdd = (product: GiftFinderCandidate, position: number) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    trackGiftFinderEvent("added_to_cart", { productId: product.id, source: "result", position });
    markAttribution();
    setAddedIds((prev) => new Set(prev).add(product.id));
  };

  const shopClick = (productId: string, position: number) => {
    trackGiftFinderEvent("result_clicked", { productId, position });
  };

  const submitEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailStatus("sending");
    try {
      const response = await fetch("/api/gift-finder/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          productIds: results.map((r) => r.product.id),
        }),
      });
      setEmailStatus(response.ok ? "success" : "error");
    } catch {
      setEmailStatus("error");
    }
  };

  const progressPercent = phase === "results" ? 100 : Math.round(((step - 1) / TOTAL_STEPS) * 100);

  const topResult = results[0];
  const topLook = topResult
    ? looks.find((look) => look.pieces.some((piece) => piece.productId === topResult.product.id))
    : undefined;

  const onBundleInteract = () => {
    if (bundleClickedRef.current || !topLook) return;
    bundleClickedRef.current = true;
    trackGiftFinderEvent("bundle_clicked", { lookId: topLook.id });
  };

  return (
    <section className="giftfinder">
      <div className="shelf-wrap giftfinder-wrap">
        <div className="giftfinder-progress" role="progressbar" aria-valuenow={progressPercent}>
          <div className="giftfinder-progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>

        {phase === "quiz" && (
          <div className="giftfinder-step">
            <p className="giftfinder-counter">
              {applyTemplate(dict.stepCounter, { current: step, total: TOTAL_STEPS })}
            </p>
            <h1 className="shelf-heading giftfinder-title">{currentStep.title}</h1>

            <div className="giftfinder-options" role="radiogroup" aria-label={currentStep.title}>
              {currentStep.options.map((option) => {
                const label = (currentStep.labels as Record<string, string>)[option.value];
                const selected = currentAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`giftfinder-option${selected ? " giftfinder-option--selected" : ""}`}
                    onClick={() => selectOption(option.value)}
                  >
                    <OptionIcon name={option.icon} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="giftfinder-nav">
              <button
                type="button"
                className="giftfinder-back"
                onClick={goBack}
                disabled={step === 1}
              >
                {dict.back}
              </button>
              <button
                type="button"
                className="btn-primary shop-cta-teal giftfinder-next"
                onClick={goNext}
                disabled={!currentAnswer}
              >
                {step === TOTAL_STEPS ? dict.seeMatches : dict.next}
              </button>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="giftfinder-results">
            <button type="button" className="giftfinder-back" onClick={goBack}>
              {dict.back}
            </button>

            {results.length === 0 ? (
              <div className="giftfinder-empty">
                <h1 className="shelf-heading giftfinder-title">{dict.emptyTitle}</h1>
                <p className="giftfinder-subtitle">{dict.emptyBody}</p>
                <Link href="/products" className="btn-primary shop-cta-teal">
                  {dict.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <h1 className="shelf-heading giftfinder-title">{dict.resultsTitle}</h1>
                <p className="giftfinder-subtitle">{dict.resultsSubtitle}</p>

                <ul className="giftfinder-cards">
                  {results.map((match, position) => {
                    const product = match.product;
                    const reason = buildWhyItMatches(
                      match.matched,
                      {
                        style: dict.reasonStyle,
                        occasion: dict.reasonOccasion,
                        budget: dict.reasonBudget,
                        type: dict.reasonType,
                      },
                      dict.reasonFallback
                    );
                    const added = addedIds.has(product.id);
                    return (
                      <li key={product.id} className="giftfinder-card">
                        <div className="giftfinder-card-photo">
                          {product.imageUrl && (
                            <CatalogImage
                              src={product.imageUrl}
                              alt={product.imageAlt}
                              fill
                              sizes="(min-width: 48rem) 22rem, 90vw"
                            />
                          )}
                        </div>
                        <div className="giftfinder-card-body">
                          <p className="giftfinder-card-reason">{reason}</p>
                          <h2 className="giftfinder-card-name">{product.name}</h2>
                          <p className="giftfinder-card-price">
                            {formatMoney(product.price, product.currency, locale)}
                          </p>
                          <div className="giftfinder-card-actions">
                            <Link
                              href={`/products/${product.slug}`}
                              className="btn-primary shop-cta-teal"
                              onClick={() => shopClick(product.id, position)}
                            >
                              {dict.shopThisGift}
                            </Link>
                            <button
                              type="button"
                              className="giftfinder-quickadd"
                              onClick={() => quickAdd(product, position)}
                            >
                              {added ? `✓ ${dict.added}` : dict.addToCart}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {topLook && topLook.available && (
                  <div className="giftfinder-bundle" onClickCapture={onBundleInteract}>
                    <p className="giftfinder-bundle-intro">{dict.bundleIntro}</p>
                    <CompleteTheLook
                      look={topLook}
                      currentProductId={topResult!.product.id}
                      locale={locale}
                      dict={lookDict}
                      outOfStockLabel={outOfStockLabel}
                      onAdded={(ids) => {
                        trackGiftFinderEvent("added_to_cart", {
                          source: "bundle",
                          lookId: topLook.id,
                          count: ids.length,
                        });
                        markAttribution();
                      }}
                    />
                  </div>
                )}

                <form className="giftfinder-email" onSubmit={submitEmail}>
                  <label className="giftfinder-email-label" htmlFor="giftfinder-email-input">
                    {dict.emailTitle}
                  </label>
                  <div className="giftfinder-email-row">
                    <input
                      id="giftfinder-email-input"
                      type="email"
                      required
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      placeholder={dict.emailPlaceholder}
                      className="field"
                    />
                    <button
                      type="submit"
                      className="btn-primary shop-cta-teal"
                      disabled={emailStatus === "sending"}
                    >
                      {emailStatus === "sending" ? dict.emailSending : dict.emailSubmit}
                    </button>
                  </div>
                  {emailStatus === "success" && (
                    <p className="giftfinder-email-status giftfinder-email-status--ok">
                      {dict.emailSuccess}
                    </p>
                  )}
                  {emailStatus === "error" && (
                    <p className="giftfinder-email-status giftfinder-email-status--error">
                      {dict.emailError}
                    </p>
                  )}
                </form>
              </>
            )}

            <button type="button" className="giftfinder-startover" onClick={startOver}>
              {dict.startOver}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
