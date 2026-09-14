"use client";

import { useActionState, useState } from "react";
import { FormAlert } from "@/components/form-alert";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  sku: string;
  stockQty: number;
  lowStockThreshold: number;
  categoryId: string | null;
  active: boolean;
  imageUrls: string;
  trackInventory: boolean;
  supplierId: string | null;
  supplierSku: string | null;
  costPrice: number | null; // cents
};

export function ProductForm({
  action,
  categories,
  suppliers,
  initial,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  categories: Category[];
  suppliers: Supplier[];
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });
  const [trackInventory, setTrackInventory] = useState(initial?.trackInventory ?? true);

  return (
    <form action={formAction} className="form-card flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required defaultValue={initial?.name} className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Slug</span>
        <input
          name="slug"
          required
          defaultValue={initial?.slug}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={initial?.description}
          className="field"
        />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Price</span>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initial?.price !== undefined ? initial.price / 100 : undefined}
            className="field"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">SKU</span>
          <input name="sku" required defaultValue={initial?.sku} className="field" />
        </label>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="trackInventory"
          checked={trackInventory}
          onChange={(e) => setTrackInventory(e.target.checked)}
          className="field-checkbox"
        />
        Track inventory (uncheck for dropshipped items with no stock of your own)
      </label>
      {/* Always fully interactive, even with tracking off: for a dropshipped
          item this is the ONLY control that puts it back in/out of stock on
          the storefront (checkout never decrements it since the supplier
          owns real availability) — customers still just see the normal
          "Out of stock" badge, with nothing dropshipping-specific shown. */}
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Stock quantity</span>
          <input
            name="stockQty"
            type="number"
            min={0}
            required
            defaultValue={initial?.stockQty ?? 0}
            className="field"
          />
          {!trackInventory && (
            <span className="text-foreground/60 text-xs">
              Inventory isn&apos;t tracked for this item, so this number is never decremented
              automatically. Set it to 0 any time the supplier can&apos;t fulfill it, to show it as
              out of stock — the storefront never mentions dropshipping either way.
            </span>
          )}
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Low stock threshold</span>
          <input
            name="lowStockThreshold"
            type="number"
            min={0}
            required
            defaultValue={initial?.lowStockThreshold ?? 5}
            className="field"
          />
        </label>
      </div>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Dropshipping (optional)</legend>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Supplier</span>
          <select name="supplierId" defaultValue={initial?.supplierId ?? ""} className="field">
            <option value="">None (stocked in-house)</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium">Supplier SKU</span>
            <input name="supplierSku" defaultValue={initial?.supplierSku ?? ""} className="field" />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium">Cost price (what you pay the supplier)</span>
            <input
              name="costPrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                initial?.costPrice !== null && initial?.costPrice !== undefined
                  ? initial.costPrice / 100
                  : undefined
              }
              className="field"
            />
          </label>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Category</span>
        <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className="field">
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Image URLs (one per line)</span>
        <textarea
          name="imageUrls"
          rows={3}
          defaultValue={initial?.imageUrls}
          placeholder="https://..."
          className="field font-mono text-xs"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="field-checkbox"
        />
        Active (visible in the store)
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
