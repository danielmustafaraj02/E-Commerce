"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function CategoryForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: {
    name: string;
    nameEn: string | null;
    nameFr: string | null;
    nameDe: string | null;
    nameAr: string | null;
    nameZh: string | null;
    nameRu: string | null;
    nameEs: string | null;
    namePt: string | null;
    nameHi: string | null;
    nameJa: string | null;
    slug: string;
    parentId: string | null;
  };
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Italian)</span>
        <input name="name" required defaultValue={initial?.name} className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (English)</span>
        <input name="nameEn" defaultValue={initial?.nameEn ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in English. Falls back to the Italian name if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (French)</span>
        <input name="nameFr" defaultValue={initial?.nameFr ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in French. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (German)</span>
        <input name="nameDe" defaultValue={initial?.nameDe ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in German. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Arabic)</span>
        <input name="nameAr" dir="rtl" defaultValue={initial?.nameAr ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Arabic. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Chinese)</span>
        <input name="nameZh" defaultValue={initial?.nameZh ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Chinese. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Russian)</span>
        <input name="nameRu" defaultValue={initial?.nameRu ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Russian. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Spanish)</span>
        <input name="nameEs" defaultValue={initial?.nameEs ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Spanish. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Portuguese)</span>
        <input name="namePt" defaultValue={initial?.namePt ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Portuguese. Falls back to the English name, then the
          Italian name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Hindi)</span>
        <input name="nameHi" defaultValue={initial?.nameHi ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Hindi. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name (Japanese)</span>
        <input name="nameJa" defaultValue={initial?.nameJa ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          Shown to visitors browsing in Japanese. Falls back to the English name, then the Italian
          name, if left blank.
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Slug</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={initial?.slug}
          placeholder="e.g. home-goods"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Parent category</span>
        <select name="parentId" defaultValue={initial?.parentId ?? ""} className="field">
          <option value="">None (top-level)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
