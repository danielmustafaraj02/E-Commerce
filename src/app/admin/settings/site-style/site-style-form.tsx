"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { FormAlert } from "@/components/form-alert";
import {
  saveSiteStyle,
  resetSiteStyle,
  saveCustomPalette,
  deleteCustomPalette,
  type SiteStyleState,
} from "./actions";
import { FONT_PAIRINGS, BUNDLED_PAIRING, findPairing } from "@/lib/font-pairings";
import {
  COLOR_PALETTES,
  THEME_PALETTE,
  findPalette,
  type CustomPalette,
} from "@/lib/color-palettes";
import {
  COLOR_ROLES,
  CSS_VAR,
  DEFAULT_COLORS,
  contrastReport,
  resolveColors,
  type ColorRole,
  type SiteStyle,
} from "@/lib/site-style";

const LABELS: Record<ColorRole, string> = {
  colorBackground: "Background",
  colorSurface: "Surface",
  colorText: "Text",
  colorTextMuted: "Secondary text",
  colorPrimary: "Primary",
  colorOnPrimary: "Text on primary",
  colorAccent: "Accent",
  colorBorder: "Borders",
};

const HINTS: Record<ColorRole, string> = {
  colorBackground: "The page itself.",
  colorSurface: "Panels, cards and tinted bands that sit on the page.",
  colorText: "Headings and body copy.",
  colorTextMuted: "Supporting lines, captions, placeholders.",
  colorPrimary: "Primary buttons and active states.",
  colorOnPrimary: "The label printed on a primary button.",
  colorAccent: "Links, arrows, underlines, focus marks.",
  colorBorder: "Hairlines, dividers, input outlines.",
};

type Draft = Record<ColorRole, string> & { fontHeading: string; fontBody: string };

function toDraft(style: SiteStyle): Draft {
  const draft = {} as Draft;
  for (const role of COLOR_ROLES) draft[role] = style[role] ?? "";
  draft.fontHeading = style.fontHeading ?? "";
  draft.fontBody = style.fontBody ?? "";
  return draft;
}

/**
 * Admin > Settings > Site style.
 *
 * Everything is edited as a DRAFT in component state: nothing reaches the
 * database until Save, and "Discard changes" puts the form back to the values
 * the page was loaded with. "Restore defaults" is a separate, explicit action
 * that clears the overrides so every role follows the theme again.
 *
 * The preview is the real thing, not a picture of it: the sample heading,
 * paragraph, button and input are ordinary elements inside a box that carries
 * the draft's own custom properties, so they are painted by exactly the
 * variables the storefront reads.
 */
export function SiteStyleForm({
  style,
  customPalettes,
}: {
  style: SiteStyle;
  customPalettes: CustomPalette[];
}) {
  const saved = useMemo(() => toDraft(style), [style]);
  const [draft, setDraft] = useState<Draft>(saved);
  const [state, formAction, pending] = useActionState<SiteStyleState, FormData>(saveSiteStyle, {});
  const [resetState, setResetState] = useState<SiteStyleState>({});
  const [resetting, startReset] = useTransition();
  const [paletteName, setPaletteName] = useState("");
  const [paletteState, savePaletteAction, savingPalette] = useActionState<
    SiteStyleState,
    FormData
  >(saveCustomPalette, {});
  const [deleting, startDelete] = useTransition();

  const set = (key: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const dirty = (Object.keys(saved) as (keyof Draft)[]).some((k) => saved[k] !== draft[k]);

  /* What the page will actually look like: the draft where it is set, the
     theme default everywhere else — the same resolution the storefront does. */
  const effective = resolveColors(draft);
  const report = contrastReport(effective);
  const failures = report.filter((r) => !r.passes);

  /* The preview's own variables: the eight resolved colours, plus the two
     type roles resolved the same way the storefront resolves them — the named
     family first, then the bundled face. */
  /* Which catalogue pairing the draft currently is, if any. "Custom" is the
     state where a family was typed by hand and matches no pairing — it is
     offered in the list only while it is actually in use, so the dropdown
     never shows an option that does nothing. */
  const pairing = findPairing(draft.fontHeading, draft.fontBody);
  const custom = !pairing && Boolean(draft.fontHeading.trim() || draft.fontBody.trim());

  /* Which named palette the eight roles currently spell, if any. Nothing set
     at all is the site's own palette; anything else that matches no entry is
     "Custom", which is simply what hand-editing a role produces. */
  const anyColorSet = COLOR_ROLES.some((r) => draft[r].trim().length > 0);
  const palette = findPalette(draft, customPalettes);
  const customPalette = anyColorSet && !palette;
  /* A bundled palette carries a note; one the admin saved does not. */
  const paletteNote: string = palette
    ? ((palette as { note?: string }).note ?? "Your own palette")
    : customPalette
      ? "Your own combination — name it below to reuse it"
      : THEME_PALETTE.note;

  const previewVars = {
    ...Object.fromEntries(COLOR_ROLES.map((role) => [CSS_VAR[role], effective[role]])),
    "--preview-heading": draft.fontHeading.trim()
      ? `"${draft.fontHeading.trim()}", var(--font-heading), Georgia, serif`
      : "var(--font-heading), Georgia, serif",
    "--preview-body": draft.fontBody.trim()
      ? `"${draft.fontBody.trim()}", var(--font-body), system-ui, sans-serif`
      : "var(--font-body), system-ui, sans-serif",
  } as React.CSSProperties;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      <form action={formAction} className="flex flex-col gap-6">
        {state.error && <FormAlert type="error">{state.error}</FormAlert>}
        {state.ok && !dirty && <FormAlert type="success">{state.ok}</FormAlert>}
        {resetState.ok && <FormAlert type="success">{resetState.ok}</FormAlert>}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Colours</h2>
          <p className="text-xs text-neutral-500">
            Start from a palette, then adjust any role by hand. Leave a role
            empty to follow the theme. Errors, success and warning colours, and
            external brand marks, are deliberately not editable.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Palette</span>
            <select
              value={palette?.id ?? (customPalette ? "custom" : THEME_PALETTE.id)}
              onChange={(e) => {
                const id = e.target.value;
                const chosen =
                  customPalettes.find((p) => p.id === id) ??
                  COLOR_PALETTES.find((p) => p.id === id);
                setDraft((d) => ({
                  ...d,
                  ...Object.fromEntries(
                    COLOR_ROLES.map((r) => [r, chosen ? chosen.colors[r] : ""])
                  ),
                }));
              }}
              className="rounded border border-neutral-300 px-2 py-2 text-sm"
            >
              <option value={THEME_PALETTE.id}>{THEME_PALETTE.name}</option>
              {customPalette && <option value="custom">Custom — edited by hand</option>}
              {customPalettes.length > 0 && (
                <optgroup label="Your palettes">
                  {customPalettes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="From coolors.co (elegant)">
                {COLOR_PALETTES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              {/* The eight roles as a strip, so a palette can be recognised
                  before it is applied. */}
              <span className="inline-flex overflow-hidden rounded border border-neutral-300">
                {COLOR_ROLES.map((r) => (
                  <span
                    key={r}
                    title={LABELS[r]}
                    style={{ background: effective[r] }}
                    className="h-4 w-4"
                  />
                ))}
              </span>
              {paletteNote}
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_ROLES.map((role) => (
              <div key={role} className="flex flex-col gap-1">
                <label htmlFor={role} className="text-sm font-medium">
                  {LABELS[role]}
                </label>
                <div className="flex items-center gap-2">
                  {/* The colour well and the hex field edit the same draft
                      value; the well cannot express "unset", which is why the
                      text input stays the one that can be emptied. */}
                  <input
                    type="color"
                    aria-label={`${LABELS[role]} colour picker`}
                    value={effective[role]}
                    onChange={(e) => set(role, e.target.value)}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-1"
                  />
                  <input
                    id={role}
                    name={role}
                    value={draft[role]}
                    onChange={(e) => set(role, e.target.value)}
                    placeholder={DEFAULT_COLORS[role]}
                    spellCheck={false}
                    className="w-full rounded border border-neutral-300 px-2 py-1.5 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => set(role, "")}
                    className="shrink-0 rounded border border-neutral-300 px-2 py-1.5 text-xs"
                    title="Follow the theme default"
                  >
                    Default
                  </button>
                </div>
                <span className="text-xs text-neutral-500">{HINTS[role]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Keep the eight colours under a name of your own. The hidden inputs
            carry the RESOLVED colours, not the draft, so a palette saved while
            some roles are still on the theme stores what you can actually see
            rather than a row of blanks. It is a separate form, because saving
            a palette is not the same act as applying the style. */}
        <div className="rounded border border-neutral-200 p-3">
          {paletteState.error && <FormAlert type="error">{paletteState.error}</FormAlert>}
          {paletteState.ok && <FormAlert type="success">{paletteState.ok}</FormAlert>}
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Save these colours as…</span>
              <input
                form="save-palette"
                name="name"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="e.g. Autumn window"
                maxLength={40}
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
            <button
              form="save-palette"
              type="submit"
              disabled={savingPalette || paletteName.trim().length === 0}
              className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              {savingPalette ? "Saving…" : "Save palette"}
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Saving under a name you already used replaces it. Saved palettes
            are not contrast-checked for you — the warnings above still apply.
          </p>

          {customPalettes.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {customPalettes.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="inline-flex overflow-hidden rounded border border-neutral-300">
                    {COLOR_ROLES.map((r) => (
                      <span key={r} style={{ background: p.colors[r] }} className="h-3.5 w-3.5" />
                    ))}
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() =>
                      startDelete(async () => {
                        const result = await deleteCustomPalette(p.id);
                        setResetState(result);
                      })
                    }
                    className="rounded px-2 py-1 text-xs text-red-700 underline disabled:opacity-40"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Type</h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Font pairing</span>
            <select
              value={pairing?.id ?? (custom ? "custom" : BUNDLED_PAIRING.id)}
              onChange={(e) => {
                const chosen = FONT_PAIRINGS.find((p) => p.id === e.target.value);
                setDraft((d) => ({
                  ...d,
                  fontHeading: chosen ? chosen.heading : "",
                  fontBody: chosen ? chosen.body : "",
                }));
              }}
              className="rounded border border-neutral-300 px-2 py-2 text-sm"
            >
              <option value={BUNDLED_PAIRING.id}>
                Site default — NewYork + DM Sans (bundled)
              </option>
              {custom && <option value="custom">Custom — {draft.fontHeading || "—"} + {draft.fontBody || "—"}</option>}
              {FONT_PAIRINGS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.heading} + {p.body}
                </option>
              ))}
            </select>
            <span className="text-xs text-neutral-500">
              {pairing
                ? `${pairing.style} — ${pairing.bestFor}`
                : custom
                  ? "Families typed by hand are used as-is and are not downloaded."
                  : `${BUNDLED_PAIRING.style} — ${BUNDLED_PAIRING.bestFor}`}
            </span>
          </label>
          <p className="text-xs text-neutral-500">
            Three roles, at most one family each; headings and body are the two
            in use. Leave empty to keep the bundled faces — NewYork for
            headings, DM&nbsp;Sans for text and controls. A family named here
            must already be available to the browser; it is not downloaded.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Headings</span>
              <input
                name="fontHeading"
                value={draft.fontHeading}
                onChange={(e) => set("fontHeading", e.target.value)}
                placeholder="NewYork (bundled)"
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Text and UI</span>
              <input
                name="fontBody"
                value={draft.fontBody}
                onChange={(e) => set("fontBody", e.target.value)}
                placeholder="DM Sans (bundled)"
                className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {failures.length > 0 && (
          <FormAlert type="error">
            <strong>Contrast below the WCAG AA minimum:</strong>
            <ul className="mt-1 list-disc ps-5">
              {failures.map((f) => (
                <li key={f.label}>
                  {f.label}: {f.ratio}:1 (needs {f.min}:1)
                </li>
              ))}
            </ul>
          </FormAlert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setDraft(saved)}
            disabled={!dirty || pending}
            className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Discard changes
          </button>
          <button
            type="button"
            disabled={resetting || pending}
            onClick={() =>
              startReset(async () => {
                const result = await resetSiteStyle();
                setResetState(result);
                if (result.ok) setDraft(toDraft({}));
              })
            }
            className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            {resetting ? "Restoring…" : "Restore defaults"}
          </button>
          {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
        </div>
      </form>

      {/* Its own form element, so the Save-palette button cannot submit the
          style form. Rendered as a sibling and linked by id, because a form
          may not be nested inside another. */}
      <form action={savePaletteAction} id="save-palette" className="hidden">
        {COLOR_ROLES.map((r) => (
          <input key={r} type="hidden" name={r} value={effective[r]} />
        ))}
      </form>

      {/* The preview. Real elements, painted by the draft's own variables —
          and the chosen pairing is loaded here too, otherwise the preview
          would show a family the admin's browser does not have and quietly
          render the fallback instead. */}
      <aside className="lg:sticky lg:top-6">
        {pairing && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(pairing.heading).replace(/%20/g, "+")}:wght@400;500;600&family=${encodeURIComponent(pairing.body).replace(/%20/g, "+")}:wght@400;500;600&display=swap`}
          />
        )}
        <h2 className="mb-2 text-sm font-semibold">Preview</h2>
        <div
          style={previewVars}
          className="rounded-lg border p-5"
          data-site-style-preview
        >
          <div
            style={{
              background: "var(--site-bg)",
              color: "var(--site-text)",
              borderColor: "var(--site-border)",
              fontFamily: "var(--preview-body)",
            }}
            className="flex flex-col gap-4 rounded-md border p-5"
          >
            {/* Body copy, the link, the button label and the field all take
                the body role; only the heading takes the heading role. */}
            <h3
              style={{ fontFamily: "var(--preview-heading)", color: "var(--site-text)" }}
              className="text-2xl leading-tight"
            >
              Perla Murano Glass
            </h3>
            <p style={{ color: "var(--site-text-muted)" }} className="text-sm leading-relaxed">
              Authentic Venetian glass, lampworked by hand in Murano — one bead
              at a time. Accents: àèéìòù and €49,00.
            </p>
            <a
              href="#preview"
              onClick={(e) => e.preventDefault()}
              style={{ color: "var(--site-accent)" }}
              className="text-sm underline underline-offset-4"
            >
              An accent link
            </a>
            <button
              type="button"
              style={{
                background: "var(--site-primary)",
                color: "var(--site-on-primary)",
              }}
              className="rounded px-4 py-2.5 text-xs font-medium tracking-widest uppercase"
            >
              Discover the jewellery
            </button>
            <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--site-text-muted)" }}>
              Email
              <input
                readOnly
                value="you@example.com"
                style={{
                  background: "var(--site-surface)",
                  color: "var(--site-text)",
                  borderColor: "var(--site-border)",
                }}
                className="rounded border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-1 text-xs">
          {report.map((r) => (
            <li key={r.label} className={r.passes ? "text-neutral-500" : "text-red-700"}>
              {r.passes ? "✓" : "✕"} {r.label} — {r.ratio}:1
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
