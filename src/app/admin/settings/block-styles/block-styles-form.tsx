"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  Download,
  FolderOpen,
  Monitor,
  PanelLeftClose,
  Shapes,
  Smartphone,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import ws from "../page-layout/editor-workspace.module.css";
import { FullWindow } from "../page-layout/full-window";
import { IconButton, PanelSection } from "../page-layout/workspace-ui";
import { JEWELLERY_STYLES, jewelleryBlockTheme } from "@/lib/jewellery-styles";
import { ColorField } from "@/components/color-field";
import { FormAlert } from "@/components/form-alert";
import {
  THEME_GROUPS,
  blockThemeCss,
  parseBlockTheme,
  themeGroupId,
  type BlockTheme,
  type ThemeControl,
  type ThemeGroup,
} from "@/lib/block-theme";
import { blockHtml, compileBuilder, type BuilderBlock } from "@/lib/section-builder";
import { freshBlock } from "@/lib/section-builder-editing";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import { usePageSnapshot } from "../page-layout/section-preview";
import { resetBlockStyles, saveBlockStyles, type BlockStyleState } from "./actions";

/* ── The sample the preview draws ─────────────────────────────────────────
   Every block type once, in the site's own classes. Blocks that show live data
   on the site (reviews, products, collections) are drawn with stand-in markup
   of the same shape, so their styles can still be tried. */

const SAMPLE_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#cfc6b8"/><circle cx="300" cy="150" r="60" fill="#b3a893"/></svg>'
  );

const make = (type: BuilderBlock["type"], extra: Record<string, unknown> = {}) =>
  blockHtml({ ...freshBlock(type), ...extra } as BuilderBlock);

const SAMPLES: Record<string, string> = {
  heading: `${make("heading", { text: "A heading with a rule", size: "l" }).replace('bld-h-l"', 'bld-h-l bld-h-ul"')}`,
  eyebrow: make("eyebrow", { number: "01", label: "Eyebrow label" }),
  text: make("text", {
    text: "Body text sits here and wraps over a few lines so you can judge the size and spacing.",
  }),
  image: `<img class="bld-img" alt="" src="${SAMPLE_IMG}">`,
  button: `${make("button", { text: "Filled button", look: "solid" })}${make("button", { text: "Outline button", look: "outline" })}`,
  divider: make("divider"),
  vline: make("vline", { height: 4 }),
  list: make("list", { items: ["First point", "Second point", "Third point"] }),
  quote: make("quote", { text: "A memorable line from a customer.", cite: "Customer" }),
  video: `<div class="bld-video" style="height:120px;background:#cfc6b8"></div>`,
  counter: make("counter", { value: 1200, label: "Pieces made" }),
  icon: make("icon", { title: "Icon title", text: "A short line of text." }),
  stars: make("stars", { rating: 4.5, label: "4.5 out of 5" }),
  countdown: make("countdown", { label: "Offer ends in" }),
  badge: `${make("badge", { text: "New", look: "solid" })}${make("badge", { text: "Soft", look: "soft" })}`,
  faq: make("faq", { items: [{ q: "A question?", a: "An answer." }] }),
  reviews: `<ul class="shelf-quotes"><li><figure class="shelf-quote"><span class="shelf-stars">★★★★★</span><blockquote>Beautiful piece, arrived fast.</blockquote><figcaption>Anna, Murano necklace</figcaption></figure></li></ul>`,
  shelf: `<ul class="shelf-row" style="display:flex;gap:1rem;list-style:none;padding:0"><li style="position:relative"><img alt="" src="${SAMPLE_IMG}" style="width:9rem"><button type="button" class="shelf-quick" style="position:absolute;right:.6rem;bottom:.6rem;display:flex;align-items:center;justify-content:center;width:2.75rem;height:2.75rem;border:0;background:#fff;border-radius:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.2)">+</button></li><li><img alt="" src="${SAMPLE_IMG}" style="width:9rem"></li></ul>`,
  carousel: `<div style="display:flex;gap:1rem;align-items:center"><button type="button" class="popular-btn" style="width:2.5rem;height:2.5rem;border:1px solid #bbb;background:#fff">‹</button><div class="popular-card-media" style="overflow:hidden;width:9rem"><img alt="" src="${SAMPLE_IMG}" style="width:100%"></div><button type="button" class="popular-btn" style="width:2.5rem;height:2.5rem;border:1px solid #bbb;background:#fff">›</button></div>`,
  looks: `<div style="display:flex;gap:1rem"><div class="look-editorial-visual" style="overflow:hidden;width:9rem"><img alt="" src="${SAMPLE_IMG}" style="width:100%"></div><div><p class="look-editorial-title" style="margin:0;font-size:1.4em">Summer look</p><p class="look-editorial-price" style="margin:.3rem 0">€ 120</p></div></div>`,
  newsletter: `<div class="footer-newsletter-row" style="display:flex;gap:.5rem"><input placeholder="Your email" style="border:1px solid #bbb;padding:.6rem .8rem"><button type="button" class="btn-primary" style="padding:.6rem 1rem">Join</button></div>`,
  journal: `<div class="journal-preview-card" style="width:14rem;overflow:hidden"><div class="journal-preview-image" style="overflow:hidden"><img alt="" src="${SAMPLE_IMG}" style="width:100%;display:block"></div><div style="padding:.8rem"><p class="journal-preview-kicker" style="margin:0 0 .3rem;font-size:.75em;text-transform:uppercase;letter-spacing:.1em">Stories</p><p style="margin:0">A day on Murano</p></div></div>`,
  siteFaq: `<div><p class="faq-eyebrow" style="margin:0 0 .3rem;font-size:.75em;text-transform:uppercase;letter-spacing:.14em">Help</p><p class="shelf-heading faq-title" style="margin:0">Questions and answers</p></div>`,
  showcase: `<div class="bld-collection-row" style="display:flex;gap:1rem"><a class="bld-collection-card" style="display:block;overflow:hidden;width:11rem"><img alt="" src="${SAMPLE_IMG}" style="width:100%"><span class="bld-collection-name shelf-heading">Necklaces</span></a></div>`,
};

function sampleBody(): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const group of THEME_GROUPS) {
    if (seen.has(group.type)) continue;
    seen.add(group.type);
    const html = SAMPLES[group.type];
    if (!html) continue;
    parts.push(
      `<section data-sample="${group.type}" style="padding:1.25rem 0;border-bottom:1px dashed rgba(127,127,127,.35)"><p style="margin:0 0 .6rem;font:600 11px/1 system-ui;letter-spacing:.1em;text-transform:uppercase;opacity:.5">${group.label.split(" · ")[0]}</p>${html}</section>`
    );
  }
  return parts.join("\n");
}

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function Control({
  control,
  value,
  onChange,
}: {
  control: ThemeControl;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const id = `bs-${control.key}-${control.label}`.replace(/\W+/g, "-");
  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <label htmlFor={id} className="w-36 shrink-0 text-neutral-700">
        {control.label}
      </label>
      {control.kind === "color" && (
        <ColorField
          value={value}
          label={control.label}
          onChange={onChange}
          clearLabel="Default"
          siteColors={true}
        />
      )}
      {control.kind === "range" && (
        <>
          <input
            id={id}
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value ?? control.min}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 flex-1"
          />
          <span className="w-16 text-right text-xs text-neutral-500 tabular-nums">
            {value === undefined ? "default" : `${value}${control.unit}`}
          </span>
        </>
      )}
      {control.kind === "choice" && (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="">Default</option>
          {control.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      {value !== undefined && control.kind !== "color" && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="ml-auto text-xs text-neutral-500 underline"
        >
          Default
        </button>
      )}
    </div>
  );
}

type BlockPanel = "styles" | "blocks" | "files";
const BLOCK_PANELS: Record<BlockPanel, { label: string; icon: LucideIcon }> = {
  styles: { label: "Styles", icon: Sparkles },
  blocks: { label: "Blocks", icon: Shapes },
  files: { label: "Files", icon: FolderOpen },
};

export function BlockStylesForm({ initial }: { initial: BlockTheme }) {
  const [theme, setTheme] = useState<BlockTheme>(initial);
  const [saved, setSaved] = useState<BlockTheme>(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [phone, setPhone] = useState(false);
  const [panel, setPanel] = useState<BlockPanel | null>("styles");
  const [state, setState] = useState<BlockStyleState>({});
  const [pending, startTransition] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { snapshot, error, loading, reload } = usePageSnapshot(
    `/${defaultLocale}?layoutPreview=1`,
    true
  );

  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);

  // The page is built once; the draft styles are swapped in without a reload,
  // so the preview never flickers or jumps while a slider is dragged.
  const srcDoc = useMemo(() => {
    if (!snapshot) return "";
    const baseCss = compileBuilder({
      columns: 1,
      gap: 1,
      divider: "none",
      valign: "top",
      cells: [[]],
    } as never).css;
    return `<!doctype html><html class="${esc(snapshot.htmlClass)}" style="${esc(snapshot.htmlStyle)}"><head><meta charset="utf-8"><base target="_blank">${snapshot.stylesheets
      .map((href) => `<link rel="stylesheet" href="${esc(href)}">`)
      .join(
        ""
      )}<style>body{margin:0}</style><style>${baseCss}</style><style id="draft-theme"></style></head><body class="${esc(snapshot.bodyClass)}"><main class="${esc(snapshot.mainClass)}"><div class="bld" style="display:block;max-width:100%;padding:1rem 1.25rem">${sampleBody()}</div></main></body></html>`;
  }, [snapshot]);

  const css = useMemo(() => blockThemeCss(theme), [theme]);
  const applyCss = () => {
    const el = frame.current?.contentDocument?.getElementById("draft-theme");
    if (el) el.textContent = css;
  };
  useEffect(applyCss);

  const jumpTo = (type: string) => {
    const d = frame.current?.contentDocument;
    d?.querySelector(`[data-sample="${type}"]`)?.scrollIntoView({ block: "start" });
  };

  const set = (group: ThemeGroup, key: string, value: string | undefined) =>
    setTheme((prev) => {
      const id = themeGroupId(group);
      const next = { ...(prev[id] ?? {}) };
      if (value === undefined) delete next[key];
      else next[key] = value;
      const out = { ...prev, [id]: next };
      if (Object.keys(next).length === 0) delete out[id];
      return out;
    });

  const save = () =>
    startTransition(async () => {
      const result = await saveBlockStyles(JSON.stringify(theme));
      setState(result);
      if (result.ok) setSaved(theme);
    });

  const reset = () => {
    if (!window.confirm("Put every block back to its default look?")) return;
    startTransition(async () => {
      const result = await resetBlockStyles();
      setState(result);
      if (result.ok) {
        setTheme({});
        setSaved({});
      }
    });
  };

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify({ perlaBlockStyles: 1, theme }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "block-styles.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const status = pending
    ? { text: "Saving…", state: "busy" }
    : dirty
      ? { text: "Unsaved changes", state: "dirty" }
      : state.ok
        ? { text: "Saved, live now", state: "saved" }
        : { text: "No changes", state: undefined };
  const showOk = state.ok && (!dirty || state.ok.startsWith("Imported"));

  const panelContent = (which: BlockPanel) => {
    switch (which) {
      case "styles":
        return (
          <div className={ws.panelBody}>
            <PanelSection
              title="Jewellery styles"
              hint="A complete look for every block. Pick one, then fine-tune in Blocks. Colours follow Site style."
            >
              <div className={ws.choiceGrid}>
                {JEWELLERY_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={ws.choice}
                    disabled={pending}
                    aria-pressed={
                      JSON.stringify(theme) === JSON.stringify(jewelleryBlockTheme(style.id))
                    }
                    onClick={() => {
                      const next = jewelleryBlockTheme(style.id);
                      if (next) {
                        setTheme(next);
                        setState({});
                      }
                    }}
                  >
                    <strong>{style.name}</strong>
                    <small>{style.note}</small>
                  </button>
                ))}
              </div>
              <Link href="/admin/settings/site-style" className={ws.linkButton}>
                Edit the shared colours in Site style
              </Link>
            </PanelSection>
          </div>
        );
      case "blocks":
        return (
          <div className={ws.panelBody}>
            <p className={ws.hint}>
              Open a block to change how it looks everywhere. The canvas jumps to it. A block&apos;s
              own Style settings in the page editor still win.
            </p>
            <div className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
              {THEME_GROUPS.map((group) => {
                const id = themeGroupId(group);
                const changed = Object.keys(theme[id] ?? {}).length;
                return (
                  <details
                    key={id}
                    open={open === id}
                    onToggle={(e) => {
                      if ((e.currentTarget as HTMLDetailsElement).open) {
                        setOpen(id);
                        jumpTo(group.type);
                      } else if (open === id) setOpen(null);
                    }}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5 font-medium">
                      <span>{group.label}</span>
                      {changed > 0 && <span className={ws.badge}>{changed} changed</span>}
                    </summary>
                    <div className="px-3 pb-3">
                      {group.hint && <p className={ws.hint}>{group.hint}</p>}
                      {group.controls.map((control) => (
                        <Control
                          key={control.key}
                          control={control}
                          value={theme[id]?.[control.key]}
                          onChange={(v) => set(group, control.key, v)}
                        />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        );
      case "files":
        return (
          <div className={ws.panelBody}>
            <PanelSection title="Move between shops" hint="Export these styles as a file, or import one.">
              <div className={ws.row}>
                <button type="button" className={ws.textButton} onClick={exportTheme}>
                  <Download aria-hidden="true" size={15} strokeWidth={1.75} />
                  Export
                </button>
                <button
                  type="button"
                  className={ws.textButton}
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload aria-hidden="true" size={15} strokeWidth={1.75} />
                  Import…
                </button>
              </div>
            </PanelSection>
            <PanelSection title="Start again">
              <button
                type="button"
                className={ws.linkButton}
                data-tone="danger"
                disabled={pending}
                onClick={reset}
              >
                Put every block back to its default look
              </button>
            </PanelSection>
          </div>
        );
    }
  };

  return (
    <FullWindow fallback={<p className="text-sm text-neutral-500">Opening Block styles…</p>}>
      <div className={ws.workspace} data-inspector="none" data-panel={panel ? undefined : "closed"}>
        <header className={ws.topbar}>
          <Link href="/admin/settings" className={ws.back}>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.75} />
            Settings
          </Link>
          <span className={ws.rule} aria-hidden="true" />
          <div className={ws.title}>
            <h1>Block styles</h1>
            <p>How each kind of block looks wherever it is used</p>
          </div>
          <span className={ws.status} data-state={status.state} role="status">
            {status.text}
          </span>
          <div className={ws.tools}>
            <button
              type="button"
              className={ws.textButton}
              disabled={!dirty || pending}
              onClick={() => setTheme(saved)}
            >
              Discard
            </button>
            <button
              type="button"
              className={ws.primaryButton}
              disabled={pending || !dirty}
              onClick={save}
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        <nav className={ws.rail} role="tablist" aria-label="Tools" aria-orientation="vertical">
          {(Object.keys(BLOCK_PANELS) as BlockPanel[]).map((id) => {
            const { label, icon: Icon } = BLOCK_PANELS[id];
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
          <aside key={panel} className={ws.panel} role="tabpanel" aria-label={BLOCK_PANELS[panel].label}>
            <div className={ws.panelHead}>
              <h2>{BLOCK_PANELS[panel].label}</h2>
              <IconButton icon={PanelLeftClose} label="Close panel" onClick={() => setPanel(null)} />
            </div>
            {panelContent(panel)}
          </aside>
        )}

        <main className={ws.stage}>
          {(state.error || showOk) && (
            <div className={ws.toasts} aria-live="polite">
              <FormAlert type={state.error ? "error" : "success"}>
                {state.error ?? state.ok}
              </FormAlert>
            </div>
          )}
          <div className={ws.stageInner}>
            <div className={ws.row}>
              <IconButton
                icon={Monitor}
                label="Computer width"
                pressed={!phone}
                onClick={() => setPhone(false)}
              />
              <IconButton
                icon={Smartphone}
                label="Phone width"
                pressed={phone}
                onClick={() => setPhone(true)}
              />
            </div>
            {error && (
              <div className={ws.notice} data-tone="warn">
                <p>{error}</p>
                <button type="button" className={ws.textButton} onClick={() => void reload()}>
                  Try again
                </button>
              </div>
            )}
            {loading && !snapshot && <p className={ws.hint}>Loading the preview…</p>}
            {snapshot && (
              <div className={ws.stageFrame} style={{ width: phone ? 390 : "100%", marginInline: "auto" }}>
                <iframe
                  ref={frame}
                  title="Block styles preview"
                  sandbox="allow-same-origin"
                  srcDoc={srcDoc}
                  onLoad={applyCss}
                  style={{ display: "block", width: "100%", height: "calc(100vh - 9rem)", border: 0 }}
                />
              </div>
            )}
          </div>
        </main>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              if (file.size > 200_000) throw new Error("big");
              const json = JSON.parse(await file.text());
              const imported = parseBlockTheme(json?.theme ?? json);
              if (Object.keys(imported).length === 0) throw new Error("empty");
              setTheme(imported);
              setState({ ok: "Imported. Check the preview, then save." });
            } catch {
              setState({ error: "That file is not a block styles export." });
            }
          }}
        />
      </div>
    </FullWindow>
  );
}
