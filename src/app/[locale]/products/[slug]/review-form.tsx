"use client";

import { useActionState, useState } from "react";
import { submitReview } from "./review-actions";
import { applyTemplate } from "@/lib/i18n/format";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const MAX_COMMENT_LENGTH = 2000;
// Only start counting down once the reviewer is getting close to the limit;
// "1,985 characters left" under an empty box is noise.
const SHOW_COUNTER_FROM = 1600;

export function ReviewForm({
  productId,
  slug,
  existing,
  dict,
}: {
  productId: string;
  slug: string;
  existing: { rating: number; comment: string | null } | null;
  dict: Dictionary["product"];
}) {
  const [state, formAction, pending] = useActionState(submitReview, {
    error: null as string | null,
    success: false,
  });
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const displayRating = hoverRating || rating;

  return (
    <form action={formAction} className="shop-panel mt-6 flex max-w-xl flex-col gap-5 p-5 sm:p-6">
      <h3 className="shop-ui text-base font-semibold">
        {existing ? dict.updateReview : dict.writeAReview}
      </h3>

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />

      {/* Real radio inputs: arrow keys, screen readers and form submission all
          work natively; the stars are just their labels. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{dict.yourRating}</legend>
        <div
          className="flex flex-wrap items-center gap-x-1 gap-y-2"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= displayRating;
            return (
              <label
                key={n}
                onMouseEnter={() => setHoverRating(n)}
                className="has-focus-visible:outline-accent relative flex size-11 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 active:scale-90 has-focus-visible:outline-2 has-focus-visible:outline-offset-1"
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  aria-label={`${n} / 5, ${dict.ratingLabels[n - 1]}`}
                  className="sr-only"
                />
                <svg
                  viewBox="0 0 24 24"
                  width="34"
                  height="34"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={
                    filled
                      ? "fill-[#f5c451] stroke-[#cf9a1f] transition-colors duration-150"
                      : "stroke-foreground/35 fill-transparent transition-colors duration-150"
                  }
                >
                  <path d="M12 2.9l2.77 5.83 6.33.76-4.68 4.45 1.24 6.36L12 17.15l-5.66 3.15 1.24-6.36-4.68-4.45 6.33-.76L12 2.9z" />
                </svg>
              </label>
            );
          })}
          <span aria-live="polite" className="text-accent-deep ms-2 min-w-24 text-sm font-semibold">
            {displayRating > 0 ? dict.ratingLabels[displayRating - 1] : ""}
          </span>
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">{dict.yourComment}</span>
        <textarea
          name="comment"
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="field text-base sm:text-sm"
        />
        {comment.length >= SHOW_COUNTER_FROM && (
          <span className="text-foreground/60 self-end text-xs">
            {applyTemplate(dict.charactersLeft, { n: MAX_COMMENT_LENGTH - comment.length })}
          </span>
        )}
      </label>

      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state.success && <FormAlert type="success">{dict.reviewSaved}</FormAlert>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="btn-primary text-sm max-sm:w-full"
        >
          {pending ? dict.savingReview : existing ? dict.updateReview : dict.submitReview}
        </button>
        {rating === 0 && !state.success && (
          <p className="text-foreground/60 text-xs">{dict.ratingRequired}</p>
        )}
      </div>
    </form>
  );
}
