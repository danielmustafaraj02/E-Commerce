"use client";

import { useActionState, useState } from "react";
import { submitReview } from "./review-actions";
import { applyTemplate } from "@/lib/i18n/format";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const MAX_COMMENT_LENGTH = 2000;

function Star({
  filled,
  onSelect,
  onHover,
  onHoverEnd,
  label,
}: {
  filled: boolean;
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onFocus={onHover}
      onBlur={onHoverEnd}
      aria-label={label}
      className="-m-0.5 rounded p-0.5 transition-transform duration-150 ease-out hover:scale-125 active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        width="30"
        height="30"
        strokeWidth="1.5"
        className={
          filled
            ? "fill-primary stroke-primary transition-all duration-150"
            : "stroke-foreground/30 fill-transparent transition-all duration-150"
        }
      >
        <path d="M12 2.9l2.77 5.83 6.33.76-4.68 4.45 1.24 6.36L12 17.15l-5.66 3.15 1.24-6.36-4.68-4.45 6.33-.76L12 2.9z" />
      </svg>
    </button>
  );
}

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
    <form
      action={formAction}
      className="form-card mt-6 flex max-w-md flex-col gap-4 transition-shadow duration-300 hover:shadow-md"
    >
      <h3 className="font-semibold">{existing ? dict.updateReview : dict.writeAReview}</h3>

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{dict.yourRating}</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              filled={n <= displayRating}
              onSelect={() => setRating(n)}
              onHover={() => setHoverRating(n)}
              onHoverEnd={() => setHoverRating(0)}
              label={`${n} / 5`}
            />
          ))}
          {displayRating > 0 && (
            <span className="text-foreground/60 animate-fade-up ml-1 text-sm">
              {displayRating} / 5
            </span>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.yourComment}</span>
        <textarea
          name="comment"
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="field"
        />
        <span className="text-foreground/50 self-end text-xs">
          {applyTemplate(dict.charactersLeft, { n: MAX_COMMENT_LENGTH - comment.length })}
        </span>
      </label>

      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state.success && <FormAlert type="success">{dict.reviewSaved}</FormAlert>}
      {rating === 0 && !state.success && (
        <p className="text-foreground/50 text-xs">{dict.ratingRequired}</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="btn-primary self-start text-sm"
      >
        {pending ? dict.savingReview : existing ? dict.updateReview : dict.submitReview}
      </button>
    </form>
  );
}
