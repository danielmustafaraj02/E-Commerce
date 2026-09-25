"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
    // Persist as a preference for the *next* bare (unprefixed) URL proxy.ts
    // has to redirect — the navigation below is what actually changes this
    // page's language, since locale now lives in the URL itself.
    startTransition(() => {
      setLocale(locale);
    });
    const rest = pathname.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/";
    router.push(`/${locale}${rest === "/" ? "" : rest}`);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-foreground/15 hover:border-primary/40 hover:text-primary flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{FLAGS[current]}</span>
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
          className="border-foreground/10 bg-background animate-pop-in absolute top-full z-50 mt-1.5 min-w-36 overflow-hidden rounded-lg border py-1 text-sm shadow-lg max-sm:start-0 sm:end-0"
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={current === locale}
                onClick={() => change(locale)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  current === locale
                    ? "text-primary bg-primary/5 font-semibold"
                    : "hover:bg-surface text-foreground/80"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{FLAGS[locale]}</span>
                  {LABELS[locale]}
                </span>
                <span className="text-foreground/40 text-xs">{CODES[locale]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
