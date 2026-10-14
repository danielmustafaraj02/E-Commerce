"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Palette,
  PanelLeftClose,
  PencilRuler,
  RotateCcw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Type,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import ws from "../page-layout/editor-workspace.module.css";
import { FullWindow } from "../page-layout/full-window";
import { IconButton, PanelSection } from "../page-layout/workspace-ui";
import { FormAlert } from "@/components/form-alert";
import {
  saveSiteStyle,
  resetSiteStyle,
  saveCustomPalette,
  deleteCustomPalette,
  type SiteStyleState,
} from "./actions";
import { FONT_FAMILIES, FONT_PAIRINGS, BUNDLED_PAIRING, findPairing } from "@/lib/font-pairings";
import {
  PALETTE_VARIANTS,
  paletteFromColour,
  type PaletteVariant,
} from "@/lib/palette-from-colour";
import { SitePreview, type PreviewPage } from "./site-preview";
import {
  COLOR_PALETTES,
  THEME_PALETTE,
  findPalette,
  type CustomPalette,
} from "@/lib/color-palettes";
import {
  COLOR_ROLES,
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

type StylePanel = "palettes" | "colours" | "fonts" | "checks";
const STYLE_PANELS: Record<StylePanel, { label: string; icon: LucideIcon }> = {
  palettes: { label: "Palettes", icon: Palette },
  colours: { label: "Colours", icon: PencilRuler },
  fonts: { label: "Fonts", icon: Type },
  checks: { label: "Checks", icon: ShieldCheck },
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
  previewPages,
}: {
  style: SiteStyle;
  customPalettes: CustomPalette[];
  previewPages: PreviewPage[];
}) {
  const [brand, setBrand] = useState("#1b7f8c");
  const [variant, setVariant] = useState<PaletteVariant>("airy");
  const saved = useMemo(() => toDraft(style), [style]);
  const [draft, setDraft] = useState<Draft>(saved);
  const [state, formAction, pending] = useActionState<SiteStyleState, FormData>(saveSiteStyle, {});
  const [resetState, setResetState] = useState<SiteStyleState>({});
  const [resetting, startReset] = useTransition();
  const [paletteName, setPaletteName] = useState("");
  const [paletteState, savePaletteAction, savingPalette] = useActionState<SiteStyleState, FormData>(
    saveCustomPalette,
    {}
  );
  const [deleting, startDelete] = useTransition();
  const [panel, setPanel] = useState<StylePanel | null>("palettes");

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

  const palettes = [
    {
      id: THEME_PALETTE.id,
      name: THEME_PALETTE.name,
      colors: THEME_PALETTE.colors as Record<ColorRole, string>,
      clear: true,
    },
    ...customPalettes.map((p) => ({ id: p.id, name: p.name, colors: p.colors, clear: false })),
    ...COLOR_PALETTES.map((p) => ({ id: p.id, name: p.name, colors: p.colors, clear: false })),
  ];
  const pairings = [
    {
      id: BUNDLED_PAIRING.id,
      heading: "",
      body: "",
      label: "Site default",
      detail: "NewYork + DM Sans (bundled)",
    },
    ...FONT_PAIRINGS.map((p) => ({
      id: p.id,
      heading: p.heading,
      body: p.body,
      label: `${p.heading} + ${p.body}`,
      detail: p.style,
    })),
  ];
  const status = pending
    ? { text: "Saving…", state: "busy" }
    : dirty
      ? { text: "Unsaved changes", state: "dirty" }
      : state.ok
        ? { text: "Saved, live now", state: "saved" }
        : { text: "No changes", state: undefined };
  const alert = state.error ?? paletteState.error ?? resetState.error;
  const notice = !dirty ? (state.ok ?? paletteState.ok ?? resetState.ok) : paletteState.ok;

  const panelContent = (which: StylePanel) => {
    switch (which) {
      case "palettes":
        return (
          <div className={ws.panelBody}>
            <PanelSection
              title="Palettes"
              hint="Click one to try it on the page. Nothing is live until you save."
            >
              <div className={ws.choiceGrid}>
                {palettes.map((p) => {
                  const active = p.clear ? !anyColorSet : palette?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      className={ws.choice}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          ...Object.fromEntries(
                            COLOR_ROLES.map((r) => [r, p.clear ? "" : p.colors[r]])
                          ),
                        }))
                      }
                    >
                      <span className={ws.swatches} aria-hidden="true">
                        {COLOR_ROLES.map((r) => (
                          <span key={r} style={{ background: p.colors[r] }} />
                        ))}
                      </span>
                      <strong>{p.name}</strong>
                    </button>
                  );
                })}
              </div>
              <p className={ws.hint}>
                {customPalette ? "Custom: edited by hand. " : ""}
                {paletteNote}
              </p>
            </PanelSection>
            <PanelSection
              title="From one colour"
              hint="Pick your brand colour; the rest is built around it and checked for readability."
            >
              <div className={ws.row}>
                <input
                  type="color"
                  aria-label="Brand colour"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-9 w-11 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
                />
                <select
                  value={variant}
                  aria-label="Palette style"
                  onChange={(e) => setVariant(e.target.value as PaletteVariant)}
                  className="field min-w-0 flex-1"
                >
                  {PALETTE_VARIANTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}: {v.note}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={ws.textButton}
                  onClick={() => {
                    const generated = paletteFromColour(brand, variant);
                    if (generated) setDraft((d) => ({ ...d, ...generated }));
                  }}
                >
                  <WandSparkles aria-hidden="true" size={15} strokeWidth={1.75} />
                  Generate
                </button>
              </div>
            </PanelSection>
            <PanelSection
              title="Save as a palette"
              hint="Keeps these eight colours under a name. The same name replaces it."
            >
              <div className={ws.row}>
                <input
                  form="save-palette"
                  name="name"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  placeholder="e.g. Autumn window"
                  aria-label="Palette name"
                  maxLength={40}
                  className="field min-w-0 flex-1"
                />
                <button
                  form="save-palette"
                  type="submit"
                  className={ws.textButton}
                  disabled={savingPalette || paletteName.trim().length === 0}
                >
                  {savingPalette ? "Saving…" : "Save"}
                </button>
              </div>
              {customPalettes.length > 0 && (
                <ul className={ws.checkList}>
                  {customPalettes.map((p) => (
                    <li key={p.id}>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={ws.swatches} style={{ height: "1rem", width: "4.5rem" }}>
                          {COLOR_ROLES.map((r) => (
                            <span key={r} style={{ background: p.colors[r] }} />
                          ))}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </span>
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        label={`Delete the palette ${p.name}`}
                        disabled={deleting}
                        onClick={() =>
                          startDelete(async () => {
                            const result = await deleteCustomPalette(p.id);
                            setResetState(result);
                          })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </PanelSection>
          </div>
        );
      case "colours":
        return (
          <div className={ws.panelBody}>
            <p className={ws.hint}>
              Fine-tune any role. Empty follows the theme. Error, success and warning colours are
              deliberately fixed.
            </p>
            {COLOR_ROLES.map((role) => (
              <div key={role} className="flex flex-col gap-1">
                <label htmlFor={role} className="font-medium">
                  {LABELS[role]}
                </label>
                <div className={ws.roleRow}>
                  <input
                    type="color"
                    aria-label={`${LABELS[role]} colour picker`}
                    value={effective[role]}
                    onChange={(e) => set(role, e.target.value)}
                  />
                  <input
                    id={role}
                    value={draft[role]}
                    onChange={(e) => set(role, e.target.value)}
                    placeholder={DEFAULT_COLORS[role]}
                    spellCheck={false}
                    className="field font-mono"
                  />
                  <IconButton
                    icon={RotateCcw}
                    label={`${LABELS[role]}: follow the theme`}
                    disabled={!draft[role]}
                    onClick={() => set(role, "")}
                  />
                </div>
                <span className={ws.hint}>{HINTS[role]}</span>
              </div>
            ))}
          </div>
        );
      case "fonts":
        return (
          <div className={ws.panelBody}>
            <PanelSection title="Font pairings" hint="A heading face and a text face that suit each other.">
              <div className={ws.choiceGrid}>
                {pairings.map((p) => {
                  const active =
                    p.id === BUNDLED_PAIRING.id
                      ? !draft.fontHeading && !draft.fontBody
                      : pairing?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      className={ws.choice}
                      onClick={() =>
                        setDraft((d) => ({ ...d, fontHeading: p.heading, fontBody: p.body }))
                      }
                    >
                      <strong>{p.label}</strong>
                      <small>{p.detail}</small>
                    </button>
                  );
                })}
              </div>
              <p className={ws.hint}>
                {pairing
                  ? `${pairing.style}: ${pairing.bestFor}`
                  : custom
                    ? "Your own mix of the two families below."
                    : `${BUNDLED_PAIRING.style}: ${BUNDLED_PAIRING.bestFor}`}
              </p>
            </PanelSection>
            <PanelSection title="Mix your own">
              {(
                [
                  ["fontHeading", "Headings", "NewYork (bundled)"],
                  ["fontBody", "Text and controls", "DM Sans (bundled)"],
                ] as const
              ).map(([key, label, fallback]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="font-medium">{label}</span>
                  <select
                    value={draft[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="field"
                  >
                    <option value="">{fallback}</option>
                    {draft[key] && !FONT_FAMILIES.includes(draft[key]) && (
                      <option value={draft[key]}>{draft[key]} (custom)</option>
                    )}
                    {FONT_FAMILIES.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </PanelSection>
          </div>
        );
      case "checks":
        return (
          <div className={ws.panelBody}>
            <PanelSection
              title="Readability"
              hint="Contrast between the colours that sit on each other, against the WCAG AA minimum."
            >
              <ul className={ws.checkList}>
                {report.map((r) => (
                  <li key={r.label} data-fail={r.passes ? undefined : ""}>
                    <span>{r.label}</span>
                    <span>
                      {r.ratio}:1 {r.passes ? "" : `(needs ${r.min}:1)`}
                    </span>
                  </li>
                ))}
              </ul>
            </PanelSection>
            <PanelSection title="Start again">
              <button
                type="button"
                className={ws.linkButton}
                data-tone="danger"
                disabled={resetting || pending}
                onClick={() => {
                  if (!confirm("Put every colour and font back to the theme defaults?")) return;
                  startReset(async () => {
                    const result = await resetSiteStyle();
                    setResetState(result);
                    if (result.ok) setDraft(toDraft({}));
                  });
                }}
              >
                {resetting ? "Restoring…" : "Restore the theme defaults"}
              </button>
            </PanelSection>
          </div>
        );
    }
  };

  return (
    <FullWindow fallback={<p className="text-sm text-neutral-500">Opening Site style…</p>}>
      <form
        action={formAction}
        className={ws.workspace}
        data-inspector="none"
        data-panel={panel ? undefined : "closed"}
      >
        {/* The draft travels in these, so a closed panel never drops a value. */}
        {(Object.keys(draft) as (keyof Draft)[]).map((key) => (
          <input key={key} type="hidden" name={key} value={draft[key]} />
        ))}
        <header className={ws.topbar}>
          <Link href="/admin/settings" className={ws.back}>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.75} />
            Settings
          </Link>
          <span className={ws.rule} aria-hidden="true" />
          <div className={ws.title}>
            <h1>Site style</h1>
            <p>Colours and fonts for every page and language</p>
          </div>
          <span className={ws.status} data-state={status.state} role="status">
            {status.text}
          </span>
          <div className={ws.tools}>
            {failures.length > 0 && (
              <button
                type="button"
                className={ws.textButton}
                onClick={() => setPanel("checks")}
                title="Some colours are hard to read together"
              >
                <TriangleAlert aria-hidden="true" size={15} strokeWidth={1.75} />
                {failures.length} contrast {failures.length === 1 ? "issue" : "issues"}
              </button>
            )}
            <button
              type="button"
              className={ws.textButton}
              disabled={!dirty || pending}
              onClick={() => setDraft(saved)}
            >
              Discard
            </button>
            <button type="submit" className={ws.primaryButton} disabled={pending || !dirty}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        <nav className={ws.rail} role="tablist" aria-label="Tools" aria-orientation="vertical">
          {(Object.keys(STYLE_PANELS) as StylePanel[]).map((id) => {
            const { label, icon: Icon } = STYLE_PANELS[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={panel === id}
                className={ws.railButton}
                onClick={() => setPanel(panel === id ? null : id)}
              >
                <Icon aria-hidden="true" size={21} strokeWidth={1.6} />
                {label}
              </button>
            );
          })}
        </nav>

        {panel && (
          <aside key={panel} className={ws.panel} role="tabpanel" aria-label={STYLE_PANELS[panel].label}>
            <div className={ws.panelHead}>
              <h2>{STYLE_PANELS[panel].label}</h2>
              <IconButton icon={PanelLeftClose} label="Close panel" onClick={() => setPanel(null)} />
            </div>
            {panelContent(panel)}
          </aside>
        )}

        <main className={ws.stage}>
          {(alert || notice) && (
            <div className={ws.toasts} aria-live="polite">
              <FormAlert type={alert ? "error" : "success"}>{alert ?? notice}</FormAlert>
            </div>
          )}
          <div className={ws.stageInner}>
            <SitePreview draft={draft} pages={previewPages} />
          </div>
        </main>
      </form>
      {/* Saving a palette is its own form: forms can't nest. It carries the
          RESOLVED colours, so roles still on the theme store what you see. */}
      <form action={savePaletteAction} id="save-palette" hidden>
        {COLOR_ROLES.map((r) => (
          <input key={r} type="hidden" name={r} value={effective[r]} />
        ))}
      </form>
    </FullWindow>
  );
}
