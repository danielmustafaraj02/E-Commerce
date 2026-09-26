"use client";

import { useActionState, useState } from "react";
import { createDiscountCode } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function DiscountForm() {
  const [state, formAction, pending] = useActionState(createDiscountCode, {
    error: null as string | null,
  });
  // Percent-off and amount-off are mutually exclusive: only one input exists
  // in the DOM at a time, so the two can never both be submitted together.
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Code
        <input name="code" required className="field w-32 uppercase" />
      </label>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-0.5">Discount</legend>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="discountType"
              value="percent"
              className="field-radio"
              checked={discountType === "percent"}
              onChange={() => setDiscountType("percent")}
            />
            % off
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="discountType"
              value="amount"
              className="field-radio"
              checked={discountType === "amount"}
              onChange={() => setDiscountType("amount")}
            />
            Amount off
          </label>
          {discountType === "percent" ? (
            <input
              name="percentOff"
              type="number"
              min={0}
              max={100}
              required
              aria-label="Percent off"
              className="field w-24"
            />
          ) : (
            <input
              name="amountOff"
              type="number"
              min={0}
              step="0.01"
              required
              aria-label="Amount off"
              className="field w-28"
            />
          )}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm">
        Expires
        <input name="expiresAt" type="date" className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max uses
        <input name="maxUses" type="number" min={1} className="field w-24" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary text-sm">
        {pending ? "Creating..." : "Create code"}
      </button>
      {state?.error && (
        <div className="w-full">
          <FormAlert type="error">{state.error}</FormAlert>
        </div>
      )}
    </form>
  );
}
