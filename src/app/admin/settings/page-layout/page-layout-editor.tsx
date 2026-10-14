"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  History,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { FormAlert } from "@/components/form-alert";
import {
  HOME_PRESETS,
  PAGE_LABELS,
  PAGE_TARGETS,
  PRODUCT_PRESETS,
  SECTIONS_BY_TARGET,
  layoutFromPreset,
  type LayoutEntry,
  type LayoutPreset,
  type PageTarget,
} from "@/lib/page-layout";
import { templatesFor, usesOriginal } from "@/lib/page-templates";
import type { SavedTemplate } from "@/lib/section-templates-db";
import { addCustomSection, resetPageLayout, savePageLayout, type PageLayoutState } from "./actions";
import { DesignThumb } from "./design-thumb";
import { usePageSnapshot } from "./section-preview";
import styles from "./page-overview.module.css";

type Target = PageTarget;

/** The ready-made layouts of a page: home and product pages have several; the
 *  others just the built-in order. */
function presetsFor(target: Target): LayoutPreset[] {
  if (target === "home") return HOME_PRESETS;
  if (target === "product") return PRODUCT_PRESETS;
  return [
    {
      id: "classic",
      name: "Classic",
      description: "The built-in order, everything on.",
      order: SECTIONS_BY_TARGET[target].map((s) => s.id),
    },
  ];
}

export type LayoutVersion = { id: string; at: string; layout: LayoutEntry[] };

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

const orderOf = (layout: LayoutEntry[]) => layout.map((e) => `${e.id}:${e.visible}`).join("|");

function Editor({
  target,
  initial,
  versions,
  drafts,
  previewUrl,
  savedTemplates,
  siteText,
}: {
  siteText?: Record<string, string>;
  target: Target;
  initial: LayoutEntry[];
  versions: LayoutVersion[];
  drafts: string[];
  previewUrl: string | null;
  savedTemplates: SavedTemplate[];
}) {
  const sections = SECTIONS_BY_TARGET[target];
  const presets = presetsFor(target);
  const label = PAGE_LABELS[target];
  // "View live" opens the same page the preview shows (without the preview flag).
  const preview = previewUrl ? previewUrl.replace("?layoutPreview=1", "") : "/";
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  // "keep": save only order and visibility. "replace": a restored version, content included.
  const [mode, setMode] = useState<"keep" | "replace">("keep");
  const [state, action, pending] = useActionState<PageLayoutState, FormData>(
    async (prev, formData) => {
      const result = await savePageLayout(prev, formData);
      if (result.ok) {
        setSaved(draft);
        setMode("keep");
      }
      return result;
    },
    {}
  );
  const [resetting, startReset] = useTransition();
  const [message, setMessage] = useState<PageLayoutState>({});
  // The side column shows the layouts and versions, or the section gallery.
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  // The page itself, so every section can be shown as it looks.
  const snap = usePageSnapshot(previewUrl, true);

  // Live preview of the whole page in another tab, fed the unsaved order and
  // visibility. Same origin only, and only a window this editor opened.
  const previewWin = useRef<Window | null>(null);
  const [previewOn, setPreviewOn] = useState(false);
  const send = (message: unknown) => {
    if (previewWin.current && !previewWin.current.closed) {
      previewWin.current.postMessage(message, window.location.origin);
    } else setPreviewOn(false);
  };
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === previewWin.current &&
        (event.data as { type?: string } | null)?.type === "layout-preview-ready"
      ) {
        setPreviewOn(true);
        previewWin.current?.postMessage(
          { type: "layout-draft", layout: draft },
          window.location.origin
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });
  useEffect(() => {
    if (!previewOn) return;
    const timer = setTimeout(() => send({ type: "layout-draft", layout: draft }), 150);
    return () => clearTimeout(timer);
  }, [draft, previewOn]);
  const openPreview = () => {
    if (previewWin.current && !previewWin.current.closed) {
      previewWin.current.focus();
      send({ type: "layout-draft", layout: draft });
      return;
    }
    if (previewUrl) previewWin.current = window.open(previewUrl, "layout-preview");
  };

  // Drag a section card by its handle; the line shows where it will land.
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const drop = () => {
    if (dragging !== null && dropAt !== null) {
      // Landing just above or below itself leaves the order as it is.
      const to = dropAt > dragging ? dropAt - 1 : dropAt;
      setDraft((list) => move(list, dragging, to));
    }
    setDragging(null);
    setDropAt(null);
  };

  const dirty = orderOf(saved) !== orderOf(draft) || mode === "replace";
  const meta = new Map(sections.map((s) => [s.id, s]));
  const shown = draft.filter((e) => e.visible).length;
  const status = pending
    ? { text: "Saving…", state: "busy" }
    : dirty
      ? { text: "Unsaved changes", state: "dirty" }
      : state.ok
        ? { text: "Saved, live now", state: "saved" }
        : { text: "Up to date", state: undefined };

  // The section gallery: stable thumbnails, one per template.
  const allTemplates = useMemo(
    () => [...savedTemplates, ...templatesFor(target).filter((t) => !usesOriginal(t))],
    [savedTemplates, target]
  );
  const templateThumbs = useMemo(
    () =>
      new Map(
        allTemplates.map((t) => [
          t.id,
          { id: `template-${t.id}`, visible: true, builder: t.doc, style: t.style } as LayoutEntry,
        ])
      ),
    [allTemplates]
  );
  const found = allTemplates.filter((t) =>
    `${t.name} ${t.description}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const shownState = pending ? {} : state.ok || state.error ? state : message;

  return (
    <form action={action} className={styles.overview}>
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="layout" value={JSON.stringify(draft)} />

      <div className={styles.main}>
        <div className={styles.bar}>
          <p className={styles.count}>
            {shown} of {draft.length} sections shown
          </p>
          <span className={styles.status} data-state={status.state} role="status">
            {status.text}
          </span>
          <span className={styles.barTools}>
            <button
              type="button"
              className={styles.ghostButton}
              disabled={!previewUrl}
              onClick={openPreview}
              title="Open the page in another tab; it follows your unsaved order"
            >
              <ExternalLink aria-hidden="true" size={15} strokeWidth={1.75} />
              {previewOn ? "Live preview open" : "Live preview"}
            </button>
            <button
              type="button"
              className={styles.ghostButton}
              disabled={!dirty}
              onClick={() => {
                setDraft(saved);
                setMode("keep");
              }}
            >
              Discard
            </button>
            <button type="submit" className={styles.primaryButton} disabled={pending || !dirty}>
              {pending ? "Saving…" : `Save ${label.toLowerCase()}`}
            </button>
          </span>
        </div>
        <div aria-live="polite">
          {shownState.error && <FormAlert type="error">{shownState.error}</FormAlert>}
          {shownState.ok && !dirty && <FormAlert type="success">{shownState.ok}</FormAlert>}
        </div>

        {!previewUrl && (
          <p className={styles.note}>
            This page needs a sample (a product, category or article) before its sections can be
            shown here.
          </p>
        )}
        {snap.error && (
          <p className={styles.note}>
            The pictures of the sections could not be loaded: {snap.error}{" "}
            <button type="button" className={styles.link} onClick={snap.reload}>
              Try again
            </button>
          </p>
        )}

        <ol
          className={styles.stack}
          onDragOver={(e) => {
            if (dragging === null) return;
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            drop();
          }}
        >
          {draft.map((entry, i) => {
            const info = entry.custom
              ? { label: entry.custom.name, hint: "Your own section", fixed: false }
              : meta.get(entry.id);
            if (!info) return null;
            const fixed = !!(info as { fixed?: boolean }).fixed;
            const edited = !!(entry.style || entry.builder || entry.html !== undefined);
            return (
              <li
                key={entry.id}
                className={styles.card}
                data-hidden={entry.visible ? undefined : ""}
                data-dragging={dragging === i ? "" : undefined}
                data-drop-before={dropAt === i ? "" : undefined}
                data-drop-after={dropAt === i + 1 && i === draft.length - 1 ? "" : undefined}
                onDragOver={(e) => {
                  if (dragging === null) return;
                  e.preventDefault();
                  const r = e.currentTarget.getBoundingClientRect();
                  setDropAt(e.clientY < r.top + r.height / 2 ? i : i + 1);
                }}
              >
                <span
                  className={styles.grip}
                  draggable
                  role="img"
                  aria-label={`Drag ${info.label}`}
                  title="Drag to move this section"
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", entry.id);
                    const card = e.currentTarget.closest("li");
                    if (card) e.dataTransfer.setDragImage(card, 24, 24);
                    setDragging(i);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setDropAt(null);
                  }}
                >
                  <GripVertical aria-hidden="true" size={16} strokeWidth={1.75} />
                </span>
                <Link
                  href={`/admin/settings/page-layout/${target}/${entry.id}`}
                  className={styles.thumb}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {previewUrl ? (
                    <DesignThumb entry={entry} snapshot={snap.snapshot} siteText={siteText} height={150} />
                  ) : (
                    <span className={styles.thumbEmpty} />
                  )}
                </Link>
                <div className={styles.body}>
                <div className={styles.info}>
                  <p className={styles.name}>
                    <span>{i + 1}.</span> {info.label}
                  </p>
                  <p className={styles.hint}>{info.hint}</p>
                  <p className={styles.badges}>
                    {entry.custom && <span className={styles.badge}>Custom</span>}
                    {!entry.custom && edited && <span className={styles.badge}>Customised</span>}
                    {!entry.visible && <span className={styles.badge} data-tone="muted">Hidden</span>}
                    {drafts.includes(entry.id) && (
                      <span className={styles.badge} data-tone="draft" title="Changes saved as a draft, not published yet">
                        Draft
                      </span>
                    )}
                  </p>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    disabled={fixed}
                    aria-pressed={!entry.visible}
                    aria-label={entry.visible ? `Hide ${info.label}` : `Show ${info.label}`}
                    title={
                      fixed
                        ? "This block always stays on the page"
                        : entry.visible
                          ? "Hide this section"
                          : "Show this section"
                    }
                    onClick={() =>
                      setDraft(
                        draft.map((e) => (e.id === entry.id ? { ...e, visible: !e.visible } : e))
                      )
                    }
                  >
                    {entry.visible ? (
                      <Eye aria-hidden="true" size={17} strokeWidth={1.75} />
                    ) : (
                      <EyeOff aria-hidden="true" size={17} strokeWidth={1.75} />
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Move ${info.label} up`}
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => setDraft(move(draft, i, i - 1))}
                  >
                    <ArrowUp aria-hidden="true" size={17} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Move ${info.label} down`}
                    title="Move down"
                    disabled={i === draft.length - 1}
                    onClick={() => setDraft(move(draft, i, i + 1))}
                  >
                    <ArrowDown aria-hidden="true" size={17} strokeWidth={1.75} />
                  </button>
                  <Link
                    data-visual-section={`${target}/${entry.id}`}
                    href={`/admin/settings/page-layout/${target}/${entry.id}`}
                    className={styles.editButton}
                  >
                    <Pencil aria-hidden="true" size={15} strokeWidth={1.75} />
                    {fixed ? "Options & style" : "Edit design"}
                  </Link>
                </div>
                </div>
              </li>
            );
          })}
        </ol>

        <button type="button" className={styles.addButton} onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" size={17} strokeWidth={1.75} />
          Add a section
        </button>
      </div>

      <aside className={styles.side}>
        {adding ? (
          <div className={styles.sideBlock}>
            <div className={styles.sideHead}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Back to layouts"
                onClick={() => setAdding(false)}
              >
                <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.75} />
              </button>
              <h2>Add a section</h2>
            </div>
            <p className={styles.hint}>
              {dirty
                ? "Save your order first: adding a section opens it in the editor."
                : "It is added at the bottom of the page and opens in the editor."}
            </p>
            <label className={styles.search}>
              <Search aria-hidden="true" size={15} strokeWidth={1.75} />
              <input
                type="search"
                className="field"
                placeholder="Search templates"
                aria-label="Search templates"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {found.length === 0 ? (
              <p className={styles.hint} role="status">
                No template matches “{query.trim()}”.
              </p>
            ) : (
              <ul className={styles.gallery}>
                {found.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={styles.galleryCard}
                      disabled={dirty || resetting}
                      onClick={() => startReset(() => addCustomSection(target, t.id))}
                      title={`Add “${t.name}”`}
                    >
                      <span className={styles.galleryFrame}>
                        <DesignThumb entry={templateThumbs.get(t.id)!} snapshot={snap.snapshot} siteText={siteText} />
                      </span>
                      <span className={styles.galleryName}>
                        {t.name}
                        {"saved" in t && <span className={styles.badge}>Yours</span>}
                      </span>
                      <span className={styles.galleryMeta}>{t.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>
                <LayoutTemplate aria-hidden="true" size={17} strokeWidth={1.75} />
                Ready-made layouts
              </h2>
              <ul className={styles.presets}>
                {presets.map((preset) => {
                  const order = layoutFromPreset(preset, sections, draft).filter((e) => e.visible);
                  return (
                    <li key={preset.id}>
                      <button
                        type="button"
                        className={styles.preset}
                        onClick={() => setDraft(layoutFromPreset(preset, sections, draft))}
                      >
                        <span className={styles.presetMap} aria-hidden="true">
                          {order.slice(0, 6).map((e) => (
                            <span key={e.id}>{meta.get(e.id)?.label ?? e.custom?.name ?? e.id}</span>
                          ))}
                          {order.length > 6 && <span>+{order.length - 6} more</span>}
                        </span>
                        <span className={styles.presetName}>{preset.name}</span>
                        <span className={styles.presetMeta}>{preset.description}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.hint}>Choosing one only changes the list until you save.</p>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>
                <History aria-hidden="true" size={17} strokeWidth={1.75} />
                Earlier versions
              </h2>
              {versions.length === 0 ? (
                <p className={styles.hint}>Each time you save, the version appears here.</p>
              ) : (
                <ul className={styles.versions}>
                  {versions.map((v) => (
                    <li key={v.id}>
                      <span>
                        {new Date(v.at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <button
                        type="button"
                        className={styles.link}
                        onClick={() => {
                          setDraft(v.layout);
                          setMode("replace");
                        }}
                      >
                        Load
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.hint}>A loaded version brings its designs back too, once saved.</p>
            </div>

            <div className={styles.sideBlock}>
              <a href={preview} target="_blank" rel="noreferrer" className={styles.link}>
                View the live page
              </a>
              <button
                type="button"
                className={styles.dangerLink}
                disabled={resetting}
                onClick={() =>
                  startReset(async () => {
                    if (
                      !confirm(
                        "Restore the default layout? This removes your custom sections and design changes."
                      )
                    )
                      return;
                    const result = await resetPageLayout(target);
                    setMessage(result);
                    if (result.ok) {
                      const fresh = layoutFromPreset(presets[0], sections);
                      setSaved(fresh);
                      setDraft(fresh);
                      setMode("keep");
                    }
                  })
                }
              >
                <RotateCcw aria-hidden="true" size={14} strokeWidth={1.75} />
                Restore the default layout
              </button>
            </div>
          </>
        )}
      </aside>
    </form>
  );
}

export type PageData = {
  target: Target;
  layout: LayoutEntry[];
  versions: LayoutVersion[];
  /** Sections with an unpublished draft. */
  drafts: string[];
  /** The storefront URL the live preview opens; null when the page has no sample yet. */
  previewUrl: string | null;
};

export function PageLayoutEditor({
  pages,
  savedTemplates,
  siteText,
}: {
  pages: PageData[];
  savedTemplates: SavedTemplate[];
  siteText?: Record<string, string>;
}) {
  const [tab, setTab] = useState<Target>("home");
  const page = pages.find((p) => p.target === tab) ?? pages[0];
  return (
    <div>
      <div role="tablist" aria-label="Pages" className={styles.tabs}>
        {PAGE_TARGETS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            data-visual-target={t}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {PAGE_LABELS[t]}
          </button>
        ))}
      </div>
      <Editor
        key={page.target}
        target={page.target}
        initial={page.layout}
        versions={page.versions}
        drafts={page.drafts}
        previewUrl={page.previewUrl}
        savedTemplates={savedTemplates}
        siteText={siteText}
      />
    </div>
  );
}
