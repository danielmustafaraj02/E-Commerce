"use client";

import { useActionState, useState, useTransition } from "react";
import { FormAlert } from "@/components/form-alert";
import {
  HOME_PRESETS,
  HOME_SECTIONS,
  PRODUCT_PRESETS,
  PRODUCT_SECTIONS,
  layoutFromPreset,
  type LayoutEntry,
  type LayoutPreset,
  type SectionMeta,
} from "@/lib/page-layout";
import { resetPageLayout, savePageLayout, type PageLayoutState } from "./actions";

type Target = "home" | "product";

const CONFIG: Record<
  Target,
  { label: string; sections: readonly SectionMeta[]; presets: LayoutPreset[]; preview: string }
> = {
  home: { label: "Home page", sections: HOME_SECTIONS, presets: HOME_PRESETS, preview: "/" },
  product: {
    label: "Product pages",
    sections: PRODUCT_SECTIONS,
    presets: PRODUCT_PRESETS,
    preview: "/products",
  },
};

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

function sameLayout(a: LayoutEntry[], b: LayoutEntry[]) {
  return a.length === b.length && a.every((e, i) => e.id === b[i].id && e.visible === b[i].visible);
}

function Editor({ target, initial }: { target: Target; initial: LayoutEntry[] }) {
  const { sections, presets, label, preview } = CONFIG[target];
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [state, action, pending] = useActionState<PageLayoutState, FormData>(
    async (prev, formData) => {
      const result = await savePageLayout(prev, formData);
      if (result.ok) setSaved(draft);
      return result;
    },
    {}
  );
  const [resetting, startReset] = useTransition();
  const [message, setMessage] = useState<PageLayoutState>({});
  const dirty = !sameLayout(saved, draft);
  const meta = new Map(sections.map((s) => [s.id, s]));
  const shown = draft.filter((e) => e.visible).length;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="layout" value={JSON.stringify(draft)} />

      <div>
        <p className="mb-3 text-sm text-neutral-600">
          {shown} of {draft.length} sections visible
          {dirty && <span className="text-accent-deep ml-2 font-medium">· unsaved changes</span>}
        </p>
        <ol className="border-foreground/10 divide-foreground/10 divide-y rounded-lg border bg-white">
          {draft.map((entry, i) => {
            const info = meta.get(entry.id);
            if (!info) return null;
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 px-3 py-3 ${entry.visible ? "" : "bg-neutral-50"}`}
              >
                <span className="w-6 text-center text-xs font-semibold text-neutral-400 tabular-nums">
                  {i + 1}
                </span>
                <div className={`min-w-0 flex-1 ${entry.visible ? "" : "opacity-50"}`}>
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="truncate text-xs text-neutral-500">{info.hint}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={entry.visible}
                    onChange={() =>
                      setDraft(draft.map((e) => (e.id === entry.id ? { ...e, visible: !e.visible } : e)))
                    }
                  />
                  Show
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${info.label} up`}
                    disabled={i === 0}
                    onClick={() => setDraft(move(draft, i, i - 1))}
                    className="border-foreground/15 h-8 w-8 rounded border text-sm hover:bg-neutral-100 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${info.label} down`}
                    disabled={i === draft.length - 1}
                    onClick={() => setDraft(move(draft, i, i + 1))}
                    className="border-foreground/15 h-8 w-8 rounded border text-sm hover:bg-neutral-100 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="bg-primary rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {pending ? "Saving…" : `Save ${label.toLowerCase()}`}
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => setDraft(saved)}
            className="border-foreground/15 rounded border px-4 py-2 text-sm disabled:opacity-40"
          >
            Discard changes
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={() =>
              startReset(async () => {
                const result = await resetPageLayout(target);
                setMessage(result);
                if (result.ok) {
                  const d = presets[0];
                  const fresh = layoutFromPreset(d, sections);
                  setSaved(fresh);
                  setDraft(fresh);
                }
              })
            }
            className="text-sm text-neutral-600 underline underline-offset-4"
          >
            Restore default
          </button>
          <a href={preview} target="_blank" rel="noreferrer" className="text-accent-deep ml-auto text-sm underline underline-offset-4">
            View live ↗
          </a>
        </div>
        <div className="mt-3" aria-live="polite">
          {(() => {
            const shownState = pending ? {} : state.ok || state.error ? state : message;
            if (shownState.error) return <FormAlert type="error">{shownState.error}</FormAlert>;
            if (shownState.ok) return <FormAlert type="success">{shownState.ok}</FormAlert>;
            return null;
          })()}
        </div>
      </div>

      <aside>
        <h2 className="mb-2 text-sm font-semibold">Ready-made layouts</h2>
        <ul className="flex flex-col gap-2">
          {presets.map((preset) => (
            <li key={preset.id}>
              <button
                type="button"
                onClick={() => setDraft(layoutFromPreset(preset, sections))}
                className="border-foreground/10 hover:border-accent w-full rounded-lg border bg-white p-3 text-left transition-colors"
              >
                <span className="block text-sm font-medium">{preset.name}</span>
                <span className="block text-xs text-neutral-500">{preset.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-neutral-500">Applying one only fills the list. Nothing changes until you save.</p>
      </aside>
    </form>
  );
}

export function PageLayoutEditor({ home, product }: { home: LayoutEntry[]; product: LayoutEntry[] }) {
  const [tab, setTab] = useState<Target>("home");
  return (
    <div>
      <div role="tablist" className="border-foreground/10 mb-6 flex gap-1 border-b">
        {(Object.keys(CONFIG) as Target[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === t ? "border-accent text-accent-deep font-medium" : "border-transparent text-neutral-600"
            }`}
          >
            {CONFIG[t].label}
          </button>
        ))}
      </div>
      {tab === "home" ? (
        <Editor key="home" target="home" initial={home} />
      ) : (
        <Editor key="product" target="product" initial={product} />
      )}
    </div>
  );
}
