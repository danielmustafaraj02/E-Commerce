"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  CodeXml,
  CopyPlus,
  Ellipsis,
  History,
  Images,
  Layers,
  LayoutTemplate,
  Palette,
  PanelLeftClose,
  Redo2,
  Search,
  Shapes,
  SlidersHorizontal,
  Trash2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import ws from "./editor-workspace.module.css";
import { FullWindow } from "./full-window";
import { DesignThumb } from "./design-thumb";
import { IconButton, PanelSection } from "./workspace-ui";
import { FormAlert } from "@/components/form-alert";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import { MAX_CUSTOM_CSS, MAX_OVERRIDE_HTML } from "@/lib/custom-section";
import { formatHtml } from "@/lib/format-html";
import { describeChange } from "@/lib/describe-change";
import {
  alternativesFor,
  sectionStylesFor,
  recreateTemplateFor,
  templatesFor,
  usesOriginal,
} from "@/lib/page-templates";
import { createSectionDesigns } from "@/lib/section-designs";
import type { BlockPreset } from "@/lib/block-presets";
import { useSitePalette } from "@/components/color-field";
import {
  PAGE_LABELS,
  PAGE_TARGETS,
  type LayoutEntry,
  type OptionDef,
  type PageTarget,
  type SectionStyle,
} from "@/lib/page-layout";
import { compileBuilder, type BuilderDoc } from "@/lib/section-builder";
import { groupMembers, type BlockPos } from "@/lib/section-builder-editing";
import { useUndoable } from "@/lib/use-undoable";
import type { CanvasApi, Device } from "./canvas-interactions";
import { BuilderEditor } from "./builder-editor";
import {
  DesignChecks,
  DesignIO,
  MotionTimeline,
  PresetsProvider,
  SiteTextProvider,
  VersionsPanel,
} from "./builder-extras";

const EMPTY_TEXT: Record<string, string> = {};
import {
  SectionPreview,
  STARTER_HTML,
  editableHtml,
  usePageSnapshot,
  type PageSnapshot,
} from "./section-preview";
import { SectionTemplateManager } from "./section-template-manager";
import type { SectionDesignTemplateRecord } from "./actions";
import { StyleFields } from "./style-fields";
import { ShowcaseFields } from "./showcase-fields";
import { findShowcase } from "./showcase-preview";
import type { SavedTemplate } from "@/lib/section-templates-db";
import type { SectionDraft } from "@/lib/section-drafts";
import {
  addCustomSection,
  copySectionToOtherPage,
  deleteCustomSection,
  deleteBlockPreset,
  deleteSectionTemplate,
  listSectionVersions,
  saveBlockPreset,
  discardSectionDraft,
  saveSectionDraft,
  saveSectionEntry,
  saveSectionTemplate,
  type PageLayoutState,
} from "./actions";

type Target = PageTarget;
/** The workspace's tools, one rail button and panel each. */
type Panel = "collections" | "design" | "elements" | "layers" | "style" | "code" | "options" | "more";

const PANELS: Record<Panel, { label: string; icon: LucideIcon; wide?: boolean }> = {
  collections: { label: "Collections", icon: Images, wide: true },
  design: { label: "Design", icon: LayoutTemplate },
  elements: { label: "Elements", icon: Shapes },
  layers: { label: "Layers", icon: Layers },
  style: { label: "Style", icon: Palette, wide: true },
  code: { label: "HTML", icon: CodeXml, wide: true },
  options: { label: "Options", icon: SlidersHorizontal },
  more: { label: "More", icon: Ellipsis },
};

export function SectionEditor({
  target,
  initial,
  label,
  hint,
  previewUrl,
  savedTemplates,
  sectionTemplates,
  blockPresets = [],
  siteText,
  options,
  fixed = false,
  draft = null,
}: {
  target: Target;
  /** The live version of the section. */
  initial: LayoutEntry;
  /** The autosaved work in progress, if any (lib/section-drafts.ts). */
  draft?: SectionDraft | null;
  label: string;
  hint: string;
  previewUrl: string | null;
  savedTemplates: SavedTemplate[];
  sectionTemplates: SectionDesignTemplateRecord[];
  /** Looks saved from blocks, to apply to others. */
  blockPresets?: BlockPreset[];
  /** The site's text in the preview language (designs can use it with {{…}}). */
  siteText?: Record<string, string>;
  /** Display choices this section offers (the product page's buy box has some). */
  options?: OptionDef[];
  /** Carries the buy box: only options and style, no redesign. */
  fixed?: boolean;
}) {
  const sectionDesigns = useMemo(
    () =>
      initial.custom
        ? createSectionDesigns(target, {
            id: initial.id,
            label: initial.custom.name,
            hint: "Custom section",
            fixed: true,
          })
        : sectionStylesFor(target, initial.id),
    [target, initial.id, initial.custom]
  );
  // `saved` is the live version; `entry` the working copy, which starts from
  // the autosaved draft when there is one. A built-in section opens straight in
  // the visual editor: its recreated design is loaded as an unpublished change
  // (`saved` stays the built-in), so nothing changes on the site until Publish.
  const [saved, setSaved] = useState(initial);
  const recreateTemplate = initial.custom ? undefined : recreateTemplateFor(target, initial.id);
  const startsFromOriginal =
    !!recreateTemplate && !initial.custom && !initial.builder && initial.html === undefined;
  const {
    value: entry,
    set: setEntry,
    undo,
    redo,
    canUndo,
    canRedo,
    timeline,
    goto,
  } = useUndoable(
    draft
      ? draft.entry
      : startsFromOriginal
      ? {
          ...initial,
          builder: structuredClone(recreateTemplate.doc),
          ...(recreateTemplate.style
            ? { style: { ...initial.style, ...structuredClone(recreateTemplate.style) } }
            : {}),
        }
      : initial
  );
  const [selection, setSelection] = useState<BlockPos[]>([]);
  const selected = selection[0] ?? null;
  const [view, setView] = useState<{ device: Device; grid: boolean }>({
    device: "computer",
    grid: false,
  });
  const isShowcase = target === "home" && initial.id === "showcase";
  // Opens on the tool that fits: the block list for a design, the templates for
  // a section that has none yet. Clicking the open tool's rail button closes it.
  const [panel, setPanel] = useState<Panel | null>(
    fixed
      ? "style"
      : isShowcase
        ? "collections"
        : initial.builder || startsFromOriginal
          ? "layers"
          : "design"
  );
  // Where the visual editor draws its block palette, block list and settings.
  const [elementsSlot, setElementsSlot] = useState<HTMLDivElement | null>(null);
  const [layersSlot, setLayersSlot] = useState<HTMLDivElement | null>(null);
  const [inspectorSlot, setInspectorSlot] = useState<HTMLDivElement | null>(null);
  const slots = useMemo(
    () => ({ elements: elementsSlot, layers: layersSlot, inspector: inspectorSlot }),
    [elementsSlot, layersSlot, inspectorSlot]
  );
  const [state, setState] = useState<PageLayoutState>({});
  const [pending, startSave] = useTransition();
  const [discarding, startDiscard] = useTransition();
  const snap = usePageSnapshot(previewUrl, true);
  const [templates, setTemplates] = useState(savedTemplates);
  const [templateQuery, setTemplateQuery] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateState, setTemplateState] = useState<PageLayoutState>({});
  const [savingTemplate, startTemplate] = useTransition();

  const [presets, setPresets] = useState(blockPresets);
  const presetsValue = useMemo(
    () => ({
      presets,
      save: async (name: string, lookJson: string) => {
        const result = await saveBlockPreset(name, lookJson);
        if (result.presets) setPresets(result.presets);
        return result.error;
      },
      remove: async (name: string) => {
        const result = await deleteBlockPreset(name);
        if (result.presets) setPresets(result.presets);
      },
    }),
    [presets]
  );
  const palette = useSitePalette();

  // The draft on the server, as last autosaved (null: none). Autosave keeps it
  // in step with the working copy; Publish and Discard remove it.
  const [draftSaved, setDraftSaved] = useState<string | null>(
    draft ? JSON.stringify(draft.entry) : null
  );
  const [autosave, setAutosave] = useState<"idle" | "saving" | "error">("idle");
  const [resumeNoticeOpen, setResumeNoticeOpen] = useState(!!draft);
  const [open, setOpen] = useState<null | "history">(null);

  // Live blocks that only the home page renders (the collections animation,
  // the journal) are previewed with the home page's markup on other pages.
  const needsHome =
    target !== "home" &&
    !!entry.builder?.cells.some((cell) =>
      cell.some((b) => b.type === "showcase" || b.type === "journal")
    );
  const homeSnap = usePageSnapshot(
    needsHome ? `/${defaultLocale}?layoutPreview=1` : null,
    needsHome
  );
  const previewSnapshot = useMemo(() => {
    const own = snap.snapshot;
    const home = homeSnap.snapshot;
    if (!own || !home) return own;
    return {
      ...own,
      stylesheets: [...new Set([...own.stylesheets, ...home.stylesheets])],
      sections: {
        showcase: home.sections.showcase ?? "",
        journal: home.sections.journal ?? "",
        ...own.sections,
      },
    };
  }, [snap.snapshot, homeSnap.snapshot]);

  const entryJson = useMemo(() => JSON.stringify(entry), [entry]);
  // Differs from the live site (what Publish would change).
  const dirty = JSON.stringify(saved) !== entryJson;
  // What the editor opened with: a built-in section opens as an editable copy,
  // which differs from the live version without anyone having changed it yet.
  const [openedJson] = useState(entryJson);
  const untouched = draftSaved === null && entryJson === openedJson;
  // Changes the server draft doesn't have yet. Merely opening a section never
  // creates a draft.
  const unsaved = dirty ? entryJson !== draftSaved && !untouched : draftSaved !== null;
  const isCustom = !!entry.custom;
  const matchingTemplates = [
    ...templates,
    ...templatesFor(target).filter(
      (t) =>
        (!t.page || t.recreates === entry.id || t.forSection === entry.id) &&
        (!isCustom || !usesOriginal(t))
    ),
  ].filter((t) =>
    `${t.name} ${t.description}`.toLowerCase().includes(templateQuery.trim().toLowerCase())
  );
  const original = snap.snapshot?.sections[entry.id]?.trim() ?? "";
  // The template that recreates this built-in section, if there is one.
  const recreate = recreateTemplate;
  const draftOfOriginal = !saved.builder && !saved.custom && !!entry.builder && !entry.custom;
  const patch = (change: Partial<LayoutEntry>) => setEntry((prev) => ({ ...prev, ...change }));

  // The live canvas edits the builder document through this; it always acts on
  // the latest state, never a stale copy.
  const canvasApi = useMemo<CanvasApi>(
    () => ({
      getDoc: () => entryRef.current.builder,
      update: (change) =>
        setEntry((prev) => (prev.builder ? { ...prev, builder: change(prev.builder) } : prev)),
      select: (pos, additive) => {
        const doc = entryRef.current.builder;
        if (!pos || !doc) return setSelection([]);
        // Blocks in a group are selected together.
        const members = groupMembers(doc, pos);
        setSelection((prev) => {
          if (!additive) return members;
          const has = prev.some((p) => p.col === pos.col && p.idx === pos.idx);
          return has
            ? prev.filter((p) => !members.some((m) => m.col === p.col && m.idx === p.idx))
            : [
                ...prev,
                ...members.filter((m) => !prev.some((p) => p.col === m.col && p.idx === m.idx)),
              ];
        });
      },
      getSelection: () => selectionRef.current,
      getView: () => viewRef.current,
      undo: () => undoRef.current(),
      redo: () => redoRef.current(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const selectionRef = useRef(selection);
  const viewRef = useRef(view);
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  useEffect(() => {
    selectionRef.current = selection;
    viewRef.current = view;
    undoRef.current = undo;
    redoRef.current = redo;
  }, [selection, view, undo, redo]);
  const entryRef = useRef(entry);
  useEffect(() => {
    entryRef.current = entry;
  }, [entry]);

  // Ctrl/Cmd+S saves the draft at once (kept current by an effect below).
  const saveRef = useRef<() => void>(() => {});
  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y), except while typing in a field,
  // where the browser's own undo applies. Ctrl/Cmd+S saves the draft from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        saveRef.current();
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Builder → editable HTML: the design as readable code, builder dropped.
  const convertToHtml = () => {
    if (!entry.builder) return;
    const { html, css } = compileBuilder(entry.builder);
    const readable = formatHtml(html);
    if (entry.custom) {
      patch({
        builder: undefined,
        custom: { ...entry.custom, html: readable, css: `${entry.custom.css}\n${css}`.trim() },
      });
    } else {
      patch({
        builder: undefined,
        html: readable,
        style: { ...entry.style, css: `${entry.style?.css ?? ""}\n${css}`.trim() },
      });
    }
  };

  // Publish: the working copy becomes the live version (the server also
  // removes the draft, and keeps the replaced version for History).
  const publish = () =>
    startSave(async () => {
      const result = await saveSectionEntry(target, entry.id, entryJson);
      setState(result);
      if (result.ok) {
        setSaved(entry);
        setDraftSaved(null);
        setResumeNoticeOpen(false);
      }
    });

  // Back to the live version, draft thrown away.
  const discard = () => {
    if (!confirm("Throw away the draft and go back to the version on the site?")) return;
    setEntry(saved);
    setResumeNoticeOpen(false);
    startDiscard(async () => {
      const result = await discardSectionDraft(target, entry.id);
      if (result.error) setState(result);
      else setDraftSaved(null);
    });
  };

  // The draft as it is now; returns once the server has it.
  const saveDraft = async (json: string, isDirty: boolean) => {
    setAutosave("saving");
    const result = isDirty
      ? await saveSectionDraft(target, entry.id, json)
      : await discardSectionDraft(target, entry.id);
    if (result.error) {
      setAutosave("error");
      return;
    }
    setDraftSaved(isDirty ? json : null);
    setAutosave("idle");
  };

  // Autosave: a moment after the last change, never on every keystroke or drag.
  // Going back to exactly the live version removes the draft.
  useEffect(() => {
    if (pending || discarding || !unsaved) return;
    const timer = window.setTimeout(() => void saveDraft(entryJson, dirty), 1200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryJson, dirty, unsaved, pending, discarding]);

  // Leaving with changes the server doesn't have yet asks first.
  useEffect(() => {
    if (!unsaved && autosave !== "saving") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved, autosave]);


  // A short confirmation after a one-click change, with its undo.
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const applyTemplate = (t: { name: string; doc: BuilderDoc; style?: SectionStyle }) => {
    setSelection([]);
    patch({
      builder: structuredClone(t.doc),
      html: undefined,
      style: t.style ? structuredClone(t.style) : undefined,
    });
    setToast(`“${t.name}” is on the canvas.`);
  };

  const panels: Panel[] = fixed
    ? ["style", "more"]
    : [
        ...(isShowcase ? (["collections"] as Panel[]) : []),
        "design",
        ...(entry.builder ? (["elements", "layers"] as Panel[]) : []),
        "style",
        "code",
        ...(options && entry.builder ? (["options"] as Panel[]) : []),
        "more",
      ];
  // A tool that no longer applies (the design was turned into HTML) gives way.
  const openPanel = panel === null ? null : panels.includes(panel) ? panel : panels[0];
  const setOption = (def: OptionDef, value: string | undefined) => {
    const next = { ...entry.options };
    if (value === undefined) delete next[def.key];
    else next[def.key] = value;
    patch({ options: Object.keys(next).length ? next : undefined });
  };

  useEffect(() => {
    saveRef.current = () => {
      if (unsaved && !pending) void saveDraft(entryJson, dirty);
    };
  });

  // Template thumbnails draw from a stable copy of the section, so editing on
  // the canvas never redraws the miniatures.
  const thumbBase = useMemo<LayoutEntry>(
    () => ({ id: initial.id, visible: true, custom: initial.custom, options: initial.options }),
    [initial]
  );
  const thumbs = useMemo(
    () =>
      new Map<string, LayoutEntry>(
        [...templates, ...templatesFor(target)].map((t) => [
          t.id,
          { ...thumbBase, builder: t.doc, style: t.style },
        ])
      ),
    [templates, target, thumbBase]
  );
  const thumbOf = (t: { id: string; doc: BuilderDoc; style?: SectionStyle }) =>
    thumbs.get(t.id) ?? { ...thumbBase, builder: t.doc, style: t.style };
  const alternatives = useMemo(
    () =>
      target === "home" && (initial.id === "hero" || initial.id === "popular")
        ? alternativesFor(target, initial.id)
        : [],
    [target, initial.id]
  );

  const optionsForm = options && (
    <div className="flex flex-col gap-4">
      {/* The Look row's six editorial templates are far easier to judge side
          by side than one at a time in this preview. */}
      {options.some((o) => o.key === "articleOpening") && (
        <div className={ws.notice}>
          <p>
            Recreate the compact editorial opening with the article&apos;s own title and photo,
            then adjust the controls below and save to reuse it across article pages.
          </p>
          <button
            type="button"
            className={ws.textButton}
            onClick={() =>
              patch({
                builder: undefined,
                html: undefined,
                options: { articleOpening: "blended" },
              })
            }
          >
            Recreate blended headline
          </button>
        </div>
      )}
      {options.some((o) => o.key === "lookStyle") && (
        <Link href="/admin/settings/page-layout/looks-preview" className={ws.linkButton}>
          Compare all Look row styles side by side
        </Link>
      )}
      {fixed && (
        <p className={ws.hint}>
          This block carries the product photos and the buy buttons, so it always stays on the
          page and can&apos;t be rebuilt or replaced. Choose what it shows here, and restyle it in
          Style. The canvas updates as you change things.
        </p>
      )}
      {options.map((def) =>
        def.type === "range" ? (
          <label key={def.key} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{def.label}</span>
              <span className="text-xs text-neutral-600 tabular-nums">
                {entry.options?.[def.key] ?? def.initial}
                {def.unit}
                {entry.options?.[def.key] !== undefined && (
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => setOption(def, undefined)}
                  >
                    Reset
                  </button>
                )}
              </span>
            </span>
            <input
              type="range"
              min={def.min}
              max={def.max}
              step={def.step ?? 1}
              value={Number(entry.options?.[def.key] ?? def.initial)}
              onChange={(e) =>
                setOption(def, Number(e.target.value) === def.initial ? undefined : e.target.value)
              }
            />
            {def.hint && <span className="text-xs text-neutral-500">{def.hint}</span>}
          </label>
        ) : def.type === "toggle" ? (
          <label key={def.key} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={entry.options?.[def.key] !== "off"}
              onChange={(e) => setOption(def, e.target.checked ? undefined : "off")}
            />
            Show: {def.label}
          </label>
        ) : (
          <label key={def.key} className="flex flex-col gap-1">
            <span className="font-medium">{def.label}</span>
            <select
              value={entry.options?.[def.key] ?? def.choices[0].value}
              onChange={(e) =>
                setOption(def, e.target.value === def.choices[0].value ? undefined : e.target.value)
              }
              className="field"
            >
              {def.choices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )
      )}
    </div>
  );

  const rebuild = () =>
    recreate &&
    patch({
      builder: structuredClone(recreate.doc),
      ...(recreate.style ? { style: { ...entry.style, ...structuredClone(recreate.style) } } : {}),
    });

  // Two separate facts: is the work kept (the draft), and is it live.
  const status = pending
    ? { text: "Publishing…", state: "busy" }
    : discarding
      ? { text: "Discarding the draft…", state: "busy" }
      : autosave === "saving"
      ? { text: "Saving draft…", state: "busy" }
      : autosave === "error"
        ? { text: "Draft not saved, retrying", state: "dirty" }
        : dirty
          ? unsaved
            ? { text: "Unsaved changes", state: "dirty" }
            : untouched
              ? { text: "Editable copy, not live yet", state: undefined }
              : { text: "Draft saved, not live yet", state: "dirty" }
          : state.ok
            ? { text: "Published, live now", state: "saved" }
            : { text: "Same as the live site", state: undefined };

  const panelContent = (which: Panel) => {
    switch (which) {
      case "collections":
        return (
          <div className={ws.panelBody}>
            <p className={ws.hint}>
              Choose a composition and edit each collection’s title, description, button,
              destination and photograph.
            </p>
            <ShowcaseFields
              {...findShowcase(entry.builder)}
              onChange={(change) => {
                const current = findShowcase(entry.builder);
                const block = { type: "showcase" as const, ...current, ...change };
                if (current && entry.builder) {
                  patch({
                    builder: {
                      ...entry.builder,
                      cells: entry.builder.cells.map((cell) =>
                        cell.map((item) => (item === current ? block : item))
                      ),
                    },
                  });
                } else {
                  patch({
                    html: undefined,
                    builder: {
                      columns: 1,
                      gap: 0,
                      divider: "none",
                      valign: "top",
                      width: "full",
                      cells: [[block]],
                    },
                  });
                }
              }}
            />
          </div>
        );
      case "design":
        return (
          <div className={ws.panelBody}>
            {!isCustom && !entry.builder && recreate && (
              <div className={ws.notice}>
                <p>
                  <b>Make this section editable.</b> Rebuild it as a design with the same
                  content (your live products, looks, reviews, text…) where every heading,
                  button and layout can be changed and moved. You can always go back.
                </p>
                <button type="button" className={ws.primaryButton} onClick={rebuild}>
                  Rebuild as a design
                </button>
              </div>
            )}
            {alternatives.length > 0 && (
              <PanelSection
                title={initial.id === "hero" ? "Hero layouts" : "Favourites layouts"}
                hint="A starting layout for this section. Click one to put it on the canvas."
                actions={
                  initial.id === "popular" ? (
                    <Link href="/admin/products" className={ws.linkButton}>
                      Choose favourites
                    </Link>
                  ) : undefined
                }
              >
                <ul className={ws.gallery}>
                  {alternatives.map((t) => (
                    <TemplateCard
                      key={t.id}
                      name={t.name}
                      description={t.description}
                      thumb={thumbOf(t)}
                      snapshot={previewSnapshot}
                      siteText={siteText}
                      onApply={() => applyTemplate(t)}
                    />
                  ))}
                </ul>
              </PanelSection>
            )}
            <PanelSection
              title="Designs for this section"
              hint="Numbered starting points for this section, and the ones you saved."
            >
              <SectionTemplateManager
                key={`${target}:${entry.id}`}
                target={target}
                sectionId={entry.id}
                designs={sectionDesigns}
                savedTemplates={sectionTemplates}
                entry={entry}
                snapshot={previewSnapshot}
                siteText={siteText}
                onApply={(candidate) => {
                  setSelection([]);
                  setEntry(candidate);
                  setToast("The design is on the canvas.");
                }}
              />
            </PanelSection>
            <PanelSection
              title={entry.builder ? "Start over from a template" : "Start from a template"}
              hint="Click a template to put it on the canvas. Nothing is live until you publish."
            >
              <label className={ws.search}>
                <Search aria-hidden="true" size={15} strokeWidth={1.75} />
                <input
                  type="search"
                  className="field"
                  placeholder="Search templates"
                  aria-label="Search templates"
                  value={templateQuery}
                  onChange={(e) => setTemplateQuery(e.target.value)}
                />
              </label>
              {matchingTemplates.length === 0 ? (
                <p role="status" className={ws.hint}>
                  No template matches “{templateQuery.trim()}”. Try another word.
                </p>
              ) : (
                <ul className={ws.gallery}>
                  {matchingTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      name={t.name}
                      description={t.description}
                      yours={"saved" in t}
                      thumb={thumbOf(t)}
                      snapshot={previewSnapshot}
                      siteText={siteText}
                      onApply={() => applyTemplate(t)}
                      actions={
                        <>
                          {!usesOriginal(t) && (
                            <IconButton
                              icon={CopyPlus}
                              label={`Add “${t.name}” to the page as a new section`}
                              disabled={savingTemplate}
                              onClick={() =>
                                startTemplate(async () => {
                                  await addCustomSection(target, t.id);
                                })
                              }
                            />
                          )}
                          {"saved" in t && (
                            <IconButton
                              icon={Trash2}
                              tone="danger"
                              label={`Delete the template “${t.name}”`}
                              disabled={savingTemplate}
                              onClick={() => {
                                if (
                                  !confirm(
                                    `Delete the template “${t.name}”? Sections already made from it are not affected.`
                                  )
                                )
                                  return;
                                startTemplate(async () => {
                                  const result = await deleteSectionTemplate(t.id);
                                  setTemplateState(result);
                                  if (result.ok)
                                    setTemplates((list) => list.filter((x) => x.id !== t.id));
                                });
                              }}
                            />
                          )}
                        </>
                      }
                    />
                  ))}
                </ul>
              )}
            </PanelSection>
            <PanelSection
              title="Save as a template"
              hint="Reuse this design on any section or page: it joins the templates above."
            >
              {entry.builder ? (
                <div className={ws.row}>
                  <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    maxLength={60}
                    placeholder="Template name"
                    aria-label="Template name"
                    className="field min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    className={ws.textButton}
                    disabled={savingTemplate || !templateName.trim()}
                    onClick={() =>
                      startTemplate(async () => {
                        const result = await saveSectionTemplate(
                          templateName,
                          JSON.stringify({ builder: entry.builder, style: entry.style })
                        );
                        setTemplateState(result);
                        if (result.ok) {
                          setTemplateName("");
                          // Reload so the new template appears with its saved id.
                          window.location.reload();
                        }
                      })
                    }
                  >
                    {savingTemplate ? "Saving…" : "Save"}
                  </button>
                </div>
              ) : (
                <p className={ws.hint}>
                  Only designs made with the visual editor can be saved. Pick a template first.
                </p>
              )}
              <div aria-live="polite">
                {templateState.error && <FormAlert type="error">{templateState.error}</FormAlert>}
                {templateState.ok && <FormAlert type="success">{templateState.ok}</FormAlert>}
              </div>
            </PanelSection>
          </div>
        );
      case "elements":
        return <div ref={setElementsSlot} />;
      case "layers":
        return (
          <>
            <div ref={setLayersSlot} />
            {entry.builder && (
              <div className={ws.panelBody}>
                <MotionTimeline doc={entry.builder} onSelect={(pos) => canvasApi.select(pos)} />
              </div>
            )}
          </>
        );
      case "style":
        return (
          <div className={ws.panelBody}>
            {/* Background, spacing, gradients, overlays, film and the section's CSS. */}
            <StyleFields style={entry.style} onChange={(style) => patch({ style })} />
          </div>
        );
      case "code":
        return (
          <div className={ws.panelBody}>
            {entry.builder ? (
              <>
                <p className={ws.hint}>
                  This section is made with the visual editor. This is the HTML it produces (read
                  only). To edit it by hand, turn it into HTML; you can&apos;t go back to the
                  visual editor afterwards, except by starting from a template.
                </p>
                <textarea
                  readOnly
                  rows={18}
                  value={formatHtml(compileBuilder(entry.builder).html)}
                  className="field font-mono text-xs"
                />
                <button type="button" className={ws.textButton} onClick={convertToHtml}>
                  Turn into HTML I can edit by hand
                </button>
              </>
            ) : isCustom ? (
              <HtmlBox
                value={entry.custom!.html}
                max={MAX_OVERRIDE_HTML}
                onChange={(html) => patch({ custom: { ...entry.custom!, html } })}
              />
            ) : entry.html !== undefined ? (
              <>
                <HtmlBox
                  value={entry.html}
                  max={MAX_OVERRIDE_HTML}
                  onChange={(html) => patch({ html })}
                />
                <button
                  type="button"
                  className={ws.linkButton}
                  data-tone="danger"
                  onClick={() => patch({ html: undefined })}
                >
                  Reset to the original section
                </button>
              </>
            ) : (
              <>
                <p className={ws.hint}>
                  {original
                    ? "Editing the HTML turns this section into a fixed copy: product names, prices and stock stop updating and its buttons stop working until you reset it. To only restyle it, use Style."
                    : "This section shows nothing on the site right now (for example, no best sellers yet). You can write its HTML from scratch."}
                </p>
                <button
                  type="button"
                  className={ws.textButton}
                  disabled={!snap.snapshot}
                  onClick={() => patch({ html: original ? editableHtml(original) : STARTER_HTML })}
                >
                  {original ? "Edit this section's HTML" : "Write this section's HTML from scratch"}
                </button>
              </>
            )}
            {isCustom && !entry.builder && (
              <label className="flex flex-col gap-1 text-xs text-neutral-600">
                CSS (applies only to this section)
                <textarea
                  rows={8}
                  spellCheck={false}
                  maxLength={MAX_CUSTOM_CSS}
                  value={entry.custom!.css}
                  onChange={(e) => patch({ custom: { ...entry.custom!, css: e.target.value } })}
                  className="field font-mono text-xs"
                />
              </label>
            )}
          </div>
        );
      case "options":
        return <div className={ws.panelBody}>{optionsForm}</div>;
      case "more":
        return (
          <div className={ws.panelBody}>
            <PanelSection
              title="Copy to another page"
              hint="Adds a copy of the live version there as a new custom section. Publish first."
            >
              <select
                value=""
                disabled={pending}
                aria-label="Copy this section to another page"
                className="field"
                onChange={(e) => {
                  const to = e.target.value as Target;
                  if (!to) return;
                  if (dirty) {
                    setState({ error: "Publish your changes first, then copy the section." });
                    return;
                  }
                  if (
                    !confirm(
                      `Copy this section to ${PAGE_LABELS[to]}? It is added there as a new custom section.`
                    )
                  )
                    return;
                  startSave(async () => {
                    const result = await copySectionToOtherPage(target, entry.id, label, to);
                    if (result) setState(result);
                  });
                }}
              >
                <option value="">Choose a page…</option>
                {PAGE_TARGETS.filter((t) => t !== target).map((t) => (
                  <option key={t} value={t}>
                    {PAGE_LABELS[t]}
                  </option>
                ))}
              </select>
            </PanelSection>
            {entry.builder && (
              <>
                <VersionsPanel
                  load={() => listSectionVersions(target, entry.id)}
                  onRestore={(version) =>
                    version.entry.builder &&
                    patch({ builder: version.entry.builder, style: version.entry.style })
                  }
                />
                <DesignChecks
                  doc={entry.builder}
                  colors={{
                    pageBg: palette[0]?.hex,
                    text: palette[2]?.hex,
                    sectionBg: /^#[0-9a-f]{3,6}$/i.test(entry.style?.bg ?? "")
                      ? entry.style?.bg
                      : undefined,
                    sectionText: /^#[0-9a-f]{3,6}$/i.test(entry.style?.color ?? "")
                      ? entry.style?.color
                      : undefined,
                  }}
                  onSelect={(pos) => canvasApi.select(pos)}
                />
                <DesignIO
                  doc={entry.builder}
                  name={label}
                  onImport={(builder) => patch({ builder })}
                />
              </>
            )}
            <PanelSection title="Start again">
              <div className="flex flex-col items-start gap-2">
                {entry.builder && (
                  <button type="button" className={ws.linkButton} onClick={convertToHtml}>
                    Turn into HTML I can edit by hand
                  </button>
                )}
                {entry.builder && !isCustom && (
                  <button
                    type="button"
                    className={ws.linkButton}
                    data-tone="danger"
                    onClick={() => patch({ builder: undefined })}
                  >
                    Go back to the original section
                  </button>
                )}
                {isCustom && (
                  <form action={deleteCustomSection.bind(null, target, entry.id)}>
                    <button
                      type="submit"
                      className={ws.linkButton}
                      data-tone="danger"
                      onClick={(e) => {
                        if (!confirm("Delete this section for good?")) e.preventDefault();
                      }}
                    >
                      Delete this section
                    </button>
                  </form>
                )}
              </div>
            </PanelSection>
          </div>
        );
    }
  };

  const inspector = entry.builder ? (
    <div ref={setInspectorSlot} />
  ) : optionsForm ? (
    <div className={ws.inspectorBody}>
      <h2 className="mb-3 text-[0.9375rem] font-semibold">Options</h2>
      {optionsForm}
    </div>
  ) : (
    <div className={ws.emptyInspector}>
      <h2>{isCustom || entry.html !== undefined ? "Written in HTML" : "Built-in section"}</h2>
      <p>
        {isCustom || entry.html !== undefined
          ? "This section is HTML written by hand. Edit it in HTML, or pick a template in Design to rebuild it with the visual editor."
          : "This is the built-in section, filled with your live products and text. Rebuild it as a design to change and move every part of it."}
      </p>
      {!isCustom && entry.html === undefined && recreate ? (
        <button type="button" className={ws.primaryButton} onClick={rebuild}>
          Rebuild as a design
        </button>
      ) : (
        <button type="button" className={ws.textButton} onClick={() => setPanel("code")}>
          Open HTML
        </button>
      )}
    </div>
  );

  return (
    <FullWindow fallback={<p className="text-sm text-neutral-500">Opening the editor…</p>}>
      <div
        className={ws.workspace}
        data-panel={openPanel ? undefined : "closed"}
        data-panel-size={openPanel && PANELS[openPanel].wide ? "wide" : undefined}
      >
        <header className={ws.topbar}>
          <Link href="/admin/settings/page-layout" className={ws.back}>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.75} />
            Page layout
          </Link>
          <span className={ws.rule} aria-hidden="true" />
          <div className={ws.title}>
            <h1>{label}</h1>
            <p>
              {PAGE_LABELS[target]} · {hint}
            </p>
          </div>
          <span className={ws.status} data-state={status.state} role="status">
            {status.text}
          </span>
          <div className={ws.tools}>
            <IconButton icon={Undo2} label="Undo" shortcut="Ctrl+Z" disabled={!canUndo} onClick={undo} />
            <IconButton
              icon={Redo2}
              label="Redo"
              shortcut="Ctrl+Shift+Z"
              disabled={!canRedo}
              onClick={redo}
            />
            <IconButton
              icon={History}
              label="History of this session"
              pressed={open === "history"}
              onClick={() => setOpen(open === "history" ? null : "history")}
            />
            <span className={ws.rule} aria-hidden="true" />
            <button
              type="button"
              className={ws.textButton}
              disabled={pending || discarding || (!dirty && draftSaved === null)}
              onClick={discard}
              title="Throw the draft away and go back to the live version"
            >
              Discard draft
            </button>
            <button
              type="button"
              className={ws.primaryButton}
              disabled={pending || discarding || !dirty}
              onClick={publish}
              title="Put this design on the live site. Your work is saved as a draft as you go (Ctrl+S saves it at once)."
            >
              {pending ? "Publishing…" : "Publish"}
            </button>
          </div>
          {open === "history" && (
            <div className={ws.popover}>
              <p>Every change since you opened this section. Click one to go back (or forward) to it.</p>
              <ol>
                {timeline.states
                  .map((_, i) => ({
                    i,
                    label: i === 0 ? "Start" : describeChange(timeline.states[i - 1], timeline.states[i]),
                  }))
                  .reverse()
                  .map(({ i, label: step }) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => goto(i)}
                        aria-current={i === timeline.index ? "step" : undefined}
                        data-future={i > timeline.index ? "" : undefined}
                      >
                        <span>{i + 1}</span>
                        <span>{step}</span>
                      </button>
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </header>

        <nav className={ws.rail} role="tablist" aria-label="Tools" aria-orientation="vertical">
          {panels.map((id) => {
            const { label: name, icon: Icon } = PANELS[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={openPanel === id}
                aria-controls="editor-panel"
                className={ws.railButton}
                onClick={() => setPanel(openPanel === id ? null : id)}
              >
                <Icon aria-hidden="true" size={21} strokeWidth={1.6} />
                {name}
              </button>
            );
          })}
        </nav>

        {openPanel && (
          <aside
            // A fresh panel per tool, so each opens at its top.
            key={openPanel}
            id="editor-panel"
            className={ws.panel}
            role="tabpanel"
            aria-label={PANELS[openPanel].label}
          >
            <div className={ws.panelHead}>
              <h2>{PANELS[openPanel].label}</h2>
              <IconButton icon={PanelLeftClose} label="Close panel" onClick={() => setPanel(null)} />
            </div>
            {panelContent(openPanel)}
          </aside>
        )}

        <main className={ws.stage} data-visual-primary="section">
          {(toast || state.error) && (
            <div className={ws.toasts} aria-live="polite">
              {state.error ? (
                <FormAlert type="error">{state.error}</FormAlert>
              ) : (
                <div className={ws.toast} role="status">
                  <span>{toast}</span>
                  <button
                    type="button"
                    onClick={() => {
                      undo();
                      setToast(null);
                    }}
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          )}
          <div className={ws.stageInner}>
            {draft && resumeNoticeOpen && dirty && (
              <div className={ws.notice}>
                <p>
                  <b>Your draft from {new Date(draft.at).toLocaleString()}.</b> It isn&apos;t on
                  the site yet: Publish puts it live, Discard draft goes back to the live version.
                </p>
                <button
                  type="button"
                  className={ws.textButton}
                  onClick={() => setResumeNoticeOpen(false)}
                >
                  Got it
                </button>
              </div>
            )}
            {draftOfOriginal && (
              <div className={ws.notice}>
                <p>
                  <b>Editable copy of the original look.</b> Change anything. Nothing changes on
                  your site until you publish.
                </p>
                <button type="button" className={ws.textButton} onClick={() => setEntry(saved)}>
                  Keep the built-in section
                </button>
              </div>
            )}
            {previewSnapshot ? (
              <SectionPreview
                entry={entry}
                snapshot={previewSnapshot}
                siteText={siteText}
                maxHeight={6000}
                canvas={entry.builder ? { api: canvasApi, selection, view, setView } : undefined}
              />
            ) : snap.error ? (
              <div className={ws.notice} data-tone="warn">
                <p>Preview unavailable: {snap.error}</p>
                <button type="button" className={ws.textButton} onClick={snap.reload}>
                  Try again
                </button>
              </div>
            ) : (
              <p className={ws.hint}>Loading the page preview…</p>
            )}
          </div>
        </main>

        <aside className={ws.inspector} aria-label="Settings">
          {inspector}
        </aside>

        {entry.builder && (
          <SiteTextProvider value={siteText ?? EMPTY_TEXT}>
            <PresetsProvider value={presetsValue}>
              <BuilderEditor
                doc={entry.builder}
                onChange={(builder) => patch({ builder })}
                selected={selected}
                onSelect={(pos) => canvasApi.select(pos)}
                slots={slots}
              />
            </PresetsProvider>
          </SiteTextProvider>
        )}
      </div>
    </FullWindow>
  );
}

/** A template in a gallery: its miniature, name and description; click to apply. */
function TemplateCard({
  name,
  description,
  yours,
  thumb,
  snapshot,
  siteText,
  onApply,
  actions,
}: {
  name: string;
  description?: string;
  yours?: boolean;
  thumb: LayoutEntry;
  snapshot: PageSnapshot | null;
  siteText?: Record<string, string>;
  onApply: () => void;
  actions?: ReactNode;
}) {
  return (
    <li className={ws.card}>
      <button type="button" className={ws.cardButton} onClick={onApply} title={`Use “${name}”`}>
        <span className={ws.cardFrame}>
          <DesignThumb entry={thumb} snapshot={snapshot} siteText={siteText} />
        </span>
        <span className={ws.cardName}>
          {name}
          {yours && <span className={ws.badge}>Yours</span>}
        </span>
        {description && <span className={ws.cardMeta}>{description}</span>}
      </button>
      {actions && <span className={ws.cardActions}>{actions}</span>}
    </li>
  );
}

function HtmlBox({
  value,
  max,
  onChange,
}: {
  value: string;
  max: number;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <textarea
        rows={18}
        spellCheck={false}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field font-mono text-xs leading-relaxed"
      />
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => onChange(formatHtml(value))}
          className="text-accent-deep underline underline-offset-4"
        >
          Tidy up (indent)
        </button>
        <span>Scripts, event handlers, forms and non-YouTube/Vimeo frames are removed.</span>
      </div>
    </>
  );
}
