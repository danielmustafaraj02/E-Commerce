"use client";

import Image from "next/image";
import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";
import {
  DESCRIPTION_FIELDS,
  DESCRIPTION_MAX,
  type CategoryDescriptions,
} from "./description-fields";

export function CategoryForm({
  action,
  initial,
  categories,
  coverProducts = [],
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
    coverProductId?: string | null;
  } & Partial<CategoryDescriptions>;
  categories: { id: string; name: string }[];
  // Candidates for the cover image: this category's own products that have at
  // least one photo. Empty on a new category, which has no products yet.
  coverProducts?: { id: string; name: string; imageUrl: string }[];
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
          Shown to visitors browsing in Portuguese. Falls back to the English name, then the Italian
          name, if left blank.
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
      <fieldset className="border-foreground/15 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Page description</legend>
        <p className="text-foreground/60 -mt-1 text-xs">
          Copy shown below the product grid on the category page (first page only) and used for its
          search-result snippet. Separate paragraphs with a blank line. Other languages fall back to
          English, then Italian, if left blank; leave all blank to show nothing.
        </p>
        {DESCRIPTION_FIELDS.slice(0, 2).map((field) => (
          <DescriptionField key={field.key} field={field} initial={initial} rows={5} />
        ))}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Other languages</summary>
          <div className="mt-3 flex flex-col gap-3">
            {DESCRIPTION_FIELDS.slice(2).map((field) => (
              <DescriptionField key={field.key} field={field} initial={initial} rows={4} />
            ))}
          </div>
        </details>
      </fieldset>
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

      <fieldset className="border-foreground/15 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Cover image</legend>
        <p className="text-foreground/60 -mt-1 text-xs">
          The piece that represents this category — its first photo is used on the homepage
          &ldquo;Shop by category&rdquo; shelf and on the thumbnail in the header&rsquo;s Products
          menu. Only products in this category that have a photo are listed.
        </p>
        {coverProducts.length === 0 ? (
          <p className="text-foreground/60 text-xs">
            No products with a photo in this category yet. Add one, then come back to pick the
            cover.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <CoverChoice
              value=""
              label="Automatic"
              hint="Newest product"
              checked={!initial?.coverProductId}
            />
            {coverProducts.map((product) => (
              <CoverChoice
                key={product.id}
                value={product.id}
                label={product.name}
                imageUrl={product.imageUrl}
                checked={initial?.coverProductId === product.id}
              />
            ))}
          </div>
        )}
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

// One language's description textarea (Arabic is right-to-left).
function DescriptionField({
  field,
  initial,
  rows,
}: {
  field: (typeof DESCRIPTION_FIELDS)[number];
  initial?: Partial<CategoryDescriptions>;
  rows: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{field.label}</span>
      <textarea
        name={field.key}
        rows={rows}
        maxLength={DESCRIPTION_MAX}
        dir={"rtl" in field && field.rtl ? "rtl" : undefined}
        defaultValue={initial?.[field.key] ?? ""}
        className="field"
      />
    </label>
  );
}

// One selectable cover: a radio rendered as its product's thumbnail. A radio
// (not a <select>) because the choice is a picture — you pick it by looking at
// it — and the whole tile is the label, so the hit target is the image itself.
function CoverChoice({
  value,
  label,
  hint,
  imageUrl,
  checked,
}: {
  value: string;
  label: string;
  hint?: string;
  imageUrl?: string;
  checked: boolean;
}) {
  return (
    <label className="group cursor-pointer text-xs" title={label}>
      <input
        type="radio"
        name="coverProductId"
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span
        className="border-foreground/15 peer-focus-visible:ring-primary/50 peer-checked:border-primary bg-surface relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 transition-colors peer-focus-visible:ring-2"
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="" width={96} height={96} className="h-full w-full object-cover" />
        ) : (
          <span className="text-foreground/60 px-2 text-center leading-tight">{hint}</span>
        )}
      </span>
      <span className="text-foreground/70 peer-checked:text-foreground mt-1.5 block w-24 truncate">
        {label}
      </span>
    </label>
  );
}
