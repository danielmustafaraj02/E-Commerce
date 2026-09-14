"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();

  function change(locale: Locale) {
    startTransition(() => {
      setLocale(locale);
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => change("en")}
        disabled={pending}
        className={
          current === "en" ? "text-primary font-semibold" : "text-foreground/60 hover:text-primary"
        }
      >
        EN
      </button>
      <span className="text-foreground/30">/</span>
      <button
        type="button"
        onClick={() => change("it")}
        disabled={pending}
        className={
          current === "it" ? "text-primary font-semibold" : "text-foreground/60 hover:text-primary"
        }
      >
        IT
      </button>
    </div>
  );
}
