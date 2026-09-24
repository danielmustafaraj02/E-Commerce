"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export type LookProductOption = {
  id: string;
  name: string;
  category: string;
  // Name of the look the piece is in now, if another one: saving moves it.
  otherLook: string | null;
};

const PIECE_LABELS = ["Necklace", "Bracelet", "Earrings"];

export function LookForm({
  action,
  products,
  initial,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  products: LookProductOption[];
  initial?: {
    name: string;
    imageUrl: string | null;
    discountPercent: number;
    active: boolean;
    productIds: string[];
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required defaultValue={initial?.name} className="field" />
        <span className="text-foreground/60 text-xs">
          For staff only, e.g. &quot;Laguna Azzurra&quot;.
        </span>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Pieces</legend>
        {PIECE_LABELS.map((label, index) => (
          <label key={label} className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground/70">{label}</span>
            <select
              name="productIds"
              required
              defaultValue={initial?.productIds[index] ?? ""}
              className="field"
            >
              <option value="">Choose a product…</option>
              {categories.map((category) => (
                <optgroup key={category} label={category}>
                  {products
                    .filter((p) => p.category === category)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.otherLook ? ` (now in "${p.otherLook}")` : ""}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        ))}
        <span className="text-foreground/60 text-xs">
          A piece belongs to one look: choosing one that&apos;s in another look moves it here.
        </span>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Set discount (%)</span>
        <input
          name="discountPercent"
          type="number"
          min={1}
          max={50}
          required
          defaultValue={initial?.discountPercent ?? 15}
          className="field"
        />
        <span className="text-foreground/60 text-xs">
          Taken off each piece when all three are bought together, at checkout.
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Styled photo URL (optional)</span>
        <input name="imageUrl" defaultValue={initial?.imageUrl ?? ""} className="field" />
        <span className="text-foreground/60 text-xs">
          A photo of the three pieces together. Left blank, the product page arranges the
          pieces&apos; own photos.
        </span>
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} />
        <span>Show on the product pages and apply the discount</span>
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary self-start text-sm">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
