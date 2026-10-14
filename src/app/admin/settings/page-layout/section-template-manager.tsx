"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { LayoutEntry, PageTarget } from "@/lib/page-layout";
import type { SectionDesign } from "@/lib/section-designs";
import { applySectionDesign } from "@/lib/section-designs";
import type { PageSnapshot } from "./section-preview";
import { DesignThumb } from "./design-thumb";
import { IconButton } from "./workspace-ui";
import ws from "./editor-workspace.module.css";
import {
  deleteSectionDesignTemplate,
  saveSectionDesignTemplate,
  updateSectionDesignTemplateDescription,
  type SectionDesignTemplateRecord,
} from "./actions";

type Props = {
  target: PageTarget;
  sectionId: string;
  designs: SectionDesign[];
  savedTemplates: SectionDesignTemplateRecord[];
  entry: LayoutEntry;
  snapshot: PageSnapshot | null;
  siteText?: Record<string, string>;
  onApply: (entry: LayoutEntry) => void;
};

/**
 * This section's numbered designs, side by side: ten built-in starting points
 * plus the ones saved over them or in further slots. Click one to load it onto
 * the canvas; save the current design into any slot.
 */
export function SectionTemplateManager({
  target,
  sectionId,
  designs,
  savedTemplates,
  entry,
  snapshot,
  siteText,
  onApply,
}: Props) {
  const [custom, setCustom] = useState<SectionDesignTemplateRecord[]>(savedTemplates);
  const [descriptions, setDescriptions] = useState<Record<number, string>>(
    Object.fromEntries(savedTemplates.map((item) => [item.slot, item.description]))
  );
  const [editing, setEditing] = useState<number | null>(null);
  const [extraSlots, setExtraSlots] = useState(0);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const total = Math.min(
    100,
    Math.max(10, designs.length + extraSlots, ...custom.map((item) => item.slot))
  );

  // Thumbnails draw from a stable copy of the section, so editing the canvas
  // doesn't redraw every miniature; Apply uses the live draft.
  const base = useMemo<LayoutEntry>(
    () => ({ id: entry.id, visible: true, custom: entry.custom, options: entry.options }),
    [entry.id, entry.custom, entry.options]
  );
  const thumbs = useMemo(
    () =>
      Array.from({ length: total }, (_, index) => {
        const slot = index + 1;
        const template = custom.find((item) => item.slot === slot);
        const builtin = designs[index];
        return template
          ? { ...base, builder: template.doc, style: template.style }
          : builtin
            ? applySectionDesign(base, builtin)
            : null;
      }),
    [total, custom, designs, base]
  );

  const save = (slot: number) =>
    startTransition(async () => {
      const state = await saveSectionDesignTemplate({
        target,
        sectionId,
        slot,
        name: `Design ${slot}`,
        description: descriptions[slot] ?? designs[slot - 1]?.description ?? "",
        doc: JSON.stringify({ builder: entry.builder, style: entry.style }),
      });
      setNotice(state.error ?? state.ok ?? "");
      if (state.template) {
        setCustom((items) =>
          [...items.filter((item) => item.slot !== slot), state.template!].sort(
            (a, b) => a.slot - b.slot
          )
        );
      }
    });

  const saveDescription = (template: SectionDesignTemplateRecord, slot: number) => {
    const description = descriptions[slot] ?? "";
    setEditing(null);
    if (description === template.description) return;
    startTransition(async () => {
      const result = await updateSectionDesignTemplateDescription(template.id, description);
      setNotice(result.error ?? result.ok ?? "");
      if (result.ok)
        setCustom((items) =>
          items.map((item) => (item.id === template.id ? { ...item, description } : item))
        );
    });
  };

  const remove = (template: SectionDesignTemplateRecord) =>
    startTransition(async () => {
      const result = await deleteSectionDesignTemplate(template.id);
      setNotice(result.error ?? result.ok ?? "");
      if (result.ok) setCustom((items) => items.filter((item) => item.id !== template.id));
    });

  return (
    <div className={ws.panelSection}>
      <ul className={ws.gallery}>
        {thumbs.map((thumb, index) => {
          const slot = index + 1;
          const template = custom.find((item) => item.slot === slot);
          const builtin = designs[index];
          const description = template?.description || builtin?.description || "";
          return (
            <li key={slot} className={ws.card}>
              <button
                type="button"
                className={ws.cardButton}
                disabled={pending || !thumb}
                title={thumb ? `Load design ${slot} onto the canvas` : undefined}
                onClick={() =>
                  onApply(
                    template
                      ? { ...entry, builder: template.doc, style: template.style }
                      : applySectionDesign(entry, builtin!)
                  )
                }
              >
                <span className={ws.cardFrame}>
                  {thumb ? (
                    <DesignThumb entry={thumb} snapshot={snapshot} siteText={siteText} />
                  ) : (
                    <span
                      className="grid aspect-video place-items-center text-[0.6875rem] text-neutral-500"
                      aria-hidden="true"
                    >
                      Empty slot
                    </span>
                  )}
                </span>
                <span className={ws.cardName}>
                  Design {slot}
                  {template && <span className={ws.badge}>Yours</span>}
                </span>
                {description && <span className={ws.cardMeta}>{description}</span>}
              </button>
              <span className={ws.cardActions}>
                <IconButton
                  icon={Save}
                  label={
                    entry.builder
                      ? template
                        ? `Save the current design over design ${slot}`
                        : `Save the current design as design ${slot}`
                      : "Rebuild the section with the visual editor first"
                  }
                  disabled={pending || !entry.builder}
                  onClick={() => save(slot)}
                />
                {template && (
                  <>
                    <IconButton
                      icon={Pencil}
                      label={`Describe design ${slot}`}
                      onClick={() => setEditing(editing === slot ? null : slot)}
                    />
                    <IconButton
                      icon={Trash2}
                      tone="danger"
                      label={
                        builtin
                          ? `Delete your design ${slot} (the built-in one comes back)`
                          : `Delete design ${slot}`
                      }
                      disabled={pending}
                      onClick={() => remove(template)}
                    />
                  </>
                )}
              </span>
              {template && editing === slot && (
                <label className="mt-2 flex flex-col gap-1 text-[0.6875rem] text-neutral-600">
                  What it is for
                  <textarea
                    className="field"
                    rows={2}
                    maxLength={300}
                    autoFocus
                    value={descriptions[slot] ?? template.description}
                    onChange={(event) =>
                      setDescriptions((current) => ({ ...current, [slot]: event.target.value }))
                    }
                    onBlur={() => saveDescription(template, slot)}
                  />
                </label>
              )}
            </li>
          );
        })}
      </ul>
      <div className={ws.row}>
        <button
          type="button"
          className={ws.textButton}
          disabled={pending || total >= 100}
          onClick={() => {
            setExtraSlots((count) => count + 1);
            setNotice(`Slot ${total + 1} added: save the current design into it.`);
          }}
        >
          <Plus aria-hidden="true" size={15} strokeWidth={1.75} />
          Add a slot
        </button>
      </div>
      {notice && (
        <p className={ws.hint} role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
