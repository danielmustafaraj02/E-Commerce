"use client";

import { useActionState, useState } from "react";
import { FormAlert } from "@/components/form-alert";
import { HOME_COPY_FIELDS, MAX_COPY_LENGTH, type HomeCopy } from "@/lib/home-copy";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import { savePageCopy, type PageCopyState } from "./actions";

const LANGUAGE: Record<Locale, string> = {
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

const GROUPS = [...new Set(HOME_COPY_FIELDS.map((f) => f.group))];

function Form({
  locale,
  defaults,
  initial,
}: {
  locale: Locale;
  defaults: Record<string, string>;
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState(initial);
  const [state, action, pending] = useActionState<PageCopyState, FormData>(savePageCopy, {});
  const changed = HOME_COPY_FIELDS.filter(
    (f) => (values[f.key] ?? "") !== (initial[f.key] ?? "")
  ).length;
  const customised = HOME_COPY_FIELDS.filter((f) => (values[f.key] ?? "").trim()).length;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="copy" value={JSON.stringify(values)} />
      <p className="text-sm text-neutral-600">
        {customised} customised field{customised === 1 ? "" : "s"} in {LANGUAGE[locale]}
        {changed > 0 && (
          <span className="text-accent-deep ml-2 font-medium">· {changed} unsaved</span>
        )}
      </p>

      {GROUPS.map((group) => (
        <fieldset
          key={group}
          className="border-foreground/10 flex flex-col gap-4 rounded-lg border bg-white p-4"
        >
          <legend className="px-1 text-sm font-semibold">{group}</legend>
          {HOME_COPY_FIELDS.filter((f) => f.group === group).map((f) => {
            const value = values[f.key] ?? "";
            const common = {
              value,
              maxLength: MAX_COPY_LENGTH,
              placeholder: defaults[f.key],
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setValues({ ...values, [f.key]: e.target.value }),
              className: "field",
              dir: locale === "ar" ? ("rtl" as const) : undefined,
            };
            return (
              <label key={f.key} className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-baseline justify-between">
                  <span className="font-medium">{f.label}</span>
                  {value.trim() && (
                    <button
                      type="button"
                      onClick={() => setValues({ ...values, [f.key]: "" })}
                      className="text-xs text-neutral-500 underline underline-offset-2"
                    >
                      Use built-in text
                    </button>
                  )}
                </span>
                {f.multiline ? <textarea rows={3} {...common} /> : <input {...common} />}
              </label>
            );
          })}
        </fieldset>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || changed === 0}
          className="bg-primary rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {pending ? "Saving…" : `Save ${LANGUAGE[locale]} text`}
        </button>
        <a
          href={locale === "en" ? "/" : `/${locale}`}
          target="_blank"
          rel="noreferrer"
          className="text-accent-deep text-sm underline underline-offset-4"
        >
          View live ↗
        </a>
      </div>
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state.ok && !pending && <FormAlert type="success">{state.ok}</FormAlert>}
    </form>
  );
}

export function PageCopyEditor({
  defaults,
  overrides,
}: {
  defaults: Record<string, Record<string, string>>;
  overrides: HomeCopy;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  return (
    <div>
      <div role="tablist" aria-label="Language" className="mb-6 flex flex-wrap gap-1.5">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={locale === l}
            onClick={() => setLocale(l)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              locale === l
                ? "bg-primary border-transparent text-white"
                : "border-foreground/15 hover:bg-neutral-100"
            }`}
          >
            {LANGUAGE[l]}
            {overrides[l] && <span aria-label="customised"> •</span>}
          </button>
        ))}
      </div>
      <Form
        key={locale}
        locale={locale}
        defaults={defaults[locale]}
        initial={overrides[locale] ?? {}}
      />
    </div>
  );
}
