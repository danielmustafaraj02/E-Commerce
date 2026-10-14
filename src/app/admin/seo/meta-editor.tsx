"use client";

import { useActionState, useState } from "react";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import { LOCALE_NAMES } from "@/lib/i18n/locale-names";
import { FormAlert } from "@/components/form-alert";
import { savePageMeta, type MetaState } from "./actions";

export type MetaDraft = {
  title: string;
  description: string;
  ogImageUrl: string;
  noindex: boolean;
};
export type MetaByLocale = Partial<Record<Locale, MetaDraft>>;

const EMPTY: MetaDraft = { title: "", description: "", ogImageUrl: "", noindex: false };

function Counter({ value, ideal }: { value: string; ideal: number }) {
  return (
    <span className={`text-xs ${value.length > ideal ? "text-warning" : "text-foreground/50"}`}>
      {value.length} / {ideal}
    </span>
  );
}

/** Title, description and share image for one page, in every language. Empty
 *  fields keep the page's built-in text. */
export function MetaEditor({
  metaKey,
  initial,
}: {
  metaKey: string;
  initial: MetaByLocale;
}) {
  const [state, action, pending] = useActionState<MetaState, FormData>(
    savePageMeta.bind(null, metaKey),
    undefined
  );
  const [meta, setMeta] = useState<MetaByLocale>(initial);
  const [lang, setLang] = useState<Locale>("en");
  const d = meta[lang] ?? EMPTY;
  const set = (patch: Partial<MetaDraft>) => setMeta({ ...meta, [lang]: { ...d, ...patch } });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="meta" value={JSON.stringify(meta)} />
      <div role="tablist" aria-label="Language" className="border-foreground/10 flex flex-wrap gap-1 border-b">
        {locales.map((l) => {
          const filled = meta[l] && (meta[l]!.title || meta[l]!.description || meta[l]!.ogImageUrl);
          return (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={`-mb-px border-b-2 px-3 py-1.5 text-sm ${
                lang === l
                  ? "border-accent text-accent-deep font-medium"
                  : "text-foreground/70 border-transparent"
              }`}
            >
              {LOCALE_NAMES[l]}
              {filled && <span className="text-accent ml-1">●</span>}
            </button>
          );
        })}
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="flex justify-between font-medium">
          Title in search results <Counter value={d.title} ideal={60} />
        </span>
        <input
          value={d.title}
          maxLength={120}
          dir={lang === "ar" ? "rtl" : undefined}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Leave empty to keep the built-in title"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="flex justify-between font-medium">
          Description <Counter value={d.description} ideal={160} />
        </span>
        <textarea
          rows={3}
          value={d.description}
          maxLength={320}
          dir={lang === "ar" ? "rtl" : undefined}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Leave empty to keep the built-in description"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Share image (optional)</span>
        <input
          value={d.ogImageUrl}
          onChange={(e) => set({ ogImageUrl: e.target.value })}
          placeholder="/path or https://… (1200×630 works best)"
          className="field font-mono text-xs"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={d.noindex}
          onChange={(e) => set({ noindex: e.target.checked })}
          className="field-checkbox"
        />
        Hide this page from search engines ({LOCALE_NAMES[lang]})
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state?.ok && <FormAlert type="success">{state.ok}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Save search appearance"}
      </button>
    </form>
  );
}
