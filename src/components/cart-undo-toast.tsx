"use client";

import { useEffect, useRef } from "react";

const UNDO_DURATION_MS = 5000;

export type PendingRemoval = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

export function CartUndoToast({
  pending,
  label,
  undoLabel,
  onUndo,
  onExpire,
}: {
  pending: PendingRemoval;
  label: string;
  undoLabel: string;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(onExpire, UNDO_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [pending.productId, onExpire]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="cart-undo-toast"
    >
      <span className="cart-undo-toast-label">{label}</span>
      <button
        type="button"
        onClick={() => {
          clearTimeout(timerRef.current);
          onUndo();
        }}
        className="cart-undo-toast-action"
      >
        {undoLabel}
      </button>
      <div
        className="cart-undo-toast-bar"
        style={{ animationDuration: `${UNDO_DURATION_MS}ms` }}
        key={pending.productId}
      />
    </div>
  );
}
