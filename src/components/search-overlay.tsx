"use client";

import { useEffect, useRef, useState } from "react";
import "./search-overlay.css";

/**
 * Header search — a magnifier that unfolds into a field.
 *
 * Closed: one quiet icon in the header's icon cluster. Click (or Enter/Space
 * on it) and an ivory field opens in its place, the champagne hairline draws
 * out, and focus lands in the input on the same frame so the shopper can type
 * immediately. Escape, the close button, or a click outside closes it; the
 * field then collapses back to the icon in the same place.
 *
 * The field grows inside the header's existing spare width rather than over
 * the page, so nothing reflows and no overlay is needed.
 */
export function HeaderSearch({
  placeholder,
  label,
}: {
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Focus on the same frame the field opens, so the caret is already there.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes and returns the shopper to the icon, keeping the keyboard
  // where they were.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        wrapperRef.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // A click outside dismisses the field; a click inside must not, so the
  // shopper can select the text they already typed.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="header-search" ref={wrapperRef} data-open={open}>
      {/* ── Closed: the magnifier ─────────────────────────────────────────── */}
      <button
        type="button"
        className="header-search__trigger"
        onClick={() => setOpen(true)}
        aria-label={label}
        aria-expanded={open}
        aria-controls="header-search-field"
        title={label}
        tabIndex={open ? -1 : 0}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
          <circle cx="9" cy="9" r="6.5" />
          <path d="M18 18l-4-4" />
        </svg>
      </button>

      {/* ── The field, laid over the icon in the same space. Always mounted so
             its width can animate; `aria-hidden` and inert pointer-events keep
             the closed state out of the tab order and the a11y tree. ──────── */}
      <form
        action="/products"
        method="GET"
        id="header-search-field"
        role="search"
        className="header-search__field"
        aria-hidden={!open}
      >
          <span className="header-search__inner">
            <span className="header-search__icon">
              {/* Not a second copy of the closed-state magnifier: a finer lens
                  (thinner stroke, smaller circle, shorter handle). The same
                  glyph twice in one line of a 40px header reads as a mistake;
                  this one sits quietly beside the text. */}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5" />
                <path d="M16 16l-3.2-3.2" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              enterKeyHint="search"
              autoComplete="off"
              className="header-search__input"
              tabIndex={open ? 0 : -1}
            />
            <button
              type="button"
              className="header-search__close"
              onClick={() => setOpen(false)}
              aria-label={label}
              tabIndex={open ? 0 : -1}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </span>
      </form>
    </div>
  );
}
