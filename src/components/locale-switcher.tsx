"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setLocale } from "@/lib/i18n/actions";
import { locales, type Locale } from "@/lib/i18n/locale-constants";

const LABELS: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
  ru: "Русский",
  es: "Español",
  pt: "Português",
  hi: "हिन्दी",
  ja: "日本語",
};
const CODES: Record<Locale, string> = {
  en: "EN",
  it: "IT",
  fr: "FR",
  de: "DE",
  ar: "AR",
  zh: "ZH",
  ru: "RU",
  es: "ES",
  pt: "PT",
  hi: "HI",
  ja: "JA",
};
// A language switcher, not a country switcher — these are the conventional
// flag-per-language pairing most sites use where the two don't line up 1:1
// (Arabic, Chinese, Hindi have no single "the" country). Portuguese uses
// Portugal, not Brazil, matching this site's pt-PT copy (see dictionaries.ts).
const FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  it: "🇮🇹",
  fr: "🇫🇷",
  de: "🇩🇪",
  ar: "🇸🇦",
  zh: "🇨🇳",
  ru: "🇷🇺",
  es: "🇪🇸",
  pt: "🇵🇹",
  hi: "🇮🇳",
  ja: "🇯🇵",
};

export function LocaleSwitcher({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [switchFrom, setSwitchFrom] = useState<Locale | null>(null);
  const [switchTo, setSwitchTo] = useState<Locale | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function change(locale: Locale) {
    setOpen(false);
    if (locale === current) return;
    setSwitchFrom(current);
    setSwitchTo(locale);
    startTransition(async () => {
      const startedAt = Date.now();
      try {
        await setLocale(locale);
      } finally {
        const remaining = Math.max(0, 1250 - (Date.now() - startedAt));
        window.setTimeout(() => {
          setSwitchFrom(null);
          setSwitchTo(null);
        }, remaining);
      }
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="locale-switcher-trigger border-foreground/15 hover:border-primary/40 hover:text-primary flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <span key={current} className="locale-switcher-current-flag" aria-hidden="true">
          {FLAGS[current]}
        </span>
        {CODES[current]}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="locale-switcher-menu border-foreground/10 bg-background animate-pop-in absolute top-full z-50 mt-1.5 min-w-36 overflow-hidden rounded-lg border py-1 text-sm shadow-lg max-sm:start-0 sm:end-0"
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={current === locale}
                onClick={() => change(locale)}
                className={`locale-switcher-option flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  current === locale
                    ? "text-primary bg-primary/5 font-semibold"
                    : "hover:bg-surface text-foreground/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="locale-switcher-option-flag" aria-hidden="true">
                    {FLAGS[locale]}
                  </span>
                  {LABELS[locale]}
                </span>
                <span className="text-foreground/40 text-xs">{CODES[locale]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {switchFrom && switchTo && typeof document !== "undefined"
        ? createPortal(
            <div className="locale-transition-overlay" role="status" aria-live="polite">
              <div className="locale-transition-content">
                <p className="locale-transition-kicker">LANGUAGE · LINGUA</p>
                <div className="locale-transition-stage" aria-hidden="true">
                  <span className="locale-transition-flag locale-transition-flag--from">
                    {FLAGS[switchFrom]}
                  </span>
                  <span className="locale-transition-arrow">→</span>
                  <span className="locale-transition-flag locale-transition-flag--to">
                    {FLAGS[switchTo]}
                  </span>
                </div>
                <p className="locale-transition-label">
                  {LABELS[switchTo]} <span>{CODES[switchTo]}</span>
                </p>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
