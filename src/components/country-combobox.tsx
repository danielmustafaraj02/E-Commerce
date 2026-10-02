"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ALL_COUNTRIES, countryFlagEmoji } from "@/lib/countries";

export type CountryOption = { code: string; name: string; flag: string };

/**
 * A country picker: an editable combobox with a filtered listbox, following
 * the WAI-ARIA combobox pattern.
 *
 * It replaces a native <select> for one reason that outweighs the native
 * control's advantages here: there are 247 countries, and typing two letters
 * beats scrolling a list that long. The browser's own type-ahead only matches
 * from the start of a name and resets after a second, which is no help to
 * someone looking for "United Arab Emirates" under U.
 *
 * What it costs, and how that cost is paid:
 *
 *  - Keyboard. Down/Up move, Home/End jump, Enter picks, Escape closes and
 *    puts the text back, Tab closes and moves on. Focus NEVER leaves the
 *    input: the active option is pointed at with aria-activedescendant, which
 *    is what lets a screen reader announce it without the focus ring jumping
 *    around the page.
 *  - Announcement. role="combobox" + aria-expanded + aria-controls on the
 *    input, role="listbox"/"option" + aria-selected on the list, so assistive
 *    tech is told what this is, whether it is open, and which option is
 *    current.
 *  - Touch. Options are 44px, the list scrolls, and picking one is a tap.
 *    A native select still gives iOS its wheel; this trades that for the one
 *    consistent, searchable control the rest of the page is styled like.
 *
 * It holds no fetch and no shipping knowledge — it reports a country code and
 * nothing else, so the same control can serve checkout later.
 */
export function CountryCombobox({
  value,
  onChange,
  locale,
  label,
  placeholder,
  id,
}: {
  /** ISO 3166-1 alpha-2, or "" for nothing chosen. */
  value: string;
  onChange: (code: string) => void;
  locale: string;
  label: string;
  placeholder: string;
  id?: string;
}) {
  const reactId = useId();
  const inputId = id ?? `country-${reactId}`;
  const listId = `${inputId}-list`;

  const options = useMemo<CountryOption[]>(() => {
    let display: Intl.DisplayNames | null = null;
    try {
      display = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      display = null;
    }
    return ALL_COUNTRIES.map((code) => ({
      code,
      name: display?.of(code) ?? code,
      flag: countryFlagEmoji(code),
    })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  const selected = options.find((o) => o.code === value) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* While closed the field shows the chosen country; while open it shows what
     is being typed, so the filter is visible and the choice is not lost. */
  const text = open ? query : (selected ? `${selected.flag} ${selected.name}` : "");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    if (!q) return options;
    /* Starts-with first, then contains: typing "ir" should offer Ireland and
       Iran before Montserrat. */
    const starts = options.filter((o) => o.name.toLocaleLowerCase(locale).startsWith(q));
    const contains = options.filter(
      (o) =>
        !o.name.toLocaleLowerCase(locale).startsWith(q) &&
        (o.name.toLocaleLowerCase(locale).includes(q) || o.code.toLowerCase() === q)
    );
    return [...starts, ...contains];
  }, [options, query, locale]);

  /* Close when the pointer goes elsewhere. Pointerdown rather than click, so
     the list is gone before whatever was clicked reacts. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  /* Keep the active option in view as it moves under the arrow keys. */
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openWith = (q: string) => {
    setQuery(q);
    setOpen(true);
    setActive(0);
  };

  const commit = (option: CountryOption) => {
    onChange(option.code);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openWith("");
        return;
      }
      if (filtered.length === 0) return;
      setActive((i) =>
        e.key === "ArrowDown"
          ? (i + 1) % filtered.length
          : (i - 1 + filtered.length) % filtered.length
      );
      return;
    }
    if (!open) return;
    if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, filtered.length - 1));
    } else if (e.key === "Enter") {
      const option = filtered[active];
      if (option) {
        e.preventDefault();
        commit(option);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    } else if (e.key === "Tab") {
      /* Tab must move on, not be swallowed — just tidy up on the way out. */
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="cc" ref={rootRef}>
      <label className="cc-label" htmlFor={inputId}>
        {label}
      </label>

      <div className="cc-field">
        <input
          id={inputId}
          ref={inputRef}
          className="cc-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[active] ? `${inputId}-o-${filtered[active].code}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            /* Typing while the list is CLOSED edits the label of the country
               already chosen ("🇺🇸 Stati Uniti"), because that is what the
               field is showing. Without this, the first keystroke after a
               selection appended to that label and the filter matched nothing
               — the field looked broken for anyone who picked a country and
               then changed their mind. Only the newly typed characters start
               the query. */
            if (!open && selected) {
              const label = `${selected.flag} ${selected.name}`;
              openWith(next.startsWith(label) ? next.slice(label.length) : next);
              return;
            }
            openWith(next);
          }}
          onFocus={() => openWith("")}
          /* Clicking a field that already has focus must still open the list:
             focus does not fire a second time. */
          onClick={() => {
            if (!open) openWith("");
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="cc-toggle"
          /* The input already carries the combobox semantics; this is a mouse
             affordance, so it is hidden from assistive tech rather than
             announced as a second control for the same thing. */
          aria-hidden="true"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.preventDefault();
            if (open) {
              setOpen(false);
            } else {
              openWith("");
              inputRef.current?.focus();
            }
          }}
        >
          <svg viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true">
            <path
              d="M1 1.5 6 6.5 11 1.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* The listbox is always in the DOM while open only; aria-controls above
          points at it either way, which is what the pattern expects. */}
      {open && (
        <ul className="cc-list" id={listId} role="listbox" ref={listRef} aria-label={label}>
          {filtered.length === 0 && (
            <li className="cc-empty" role="presentation">
              —
            </li>
          )}
          {filtered.map((o, i) => (
            <li
              key={o.code}
              id={`${inputId}-o-${o.code}`}
              role="option"
              aria-selected={o.code === value}
              data-active={i === active ? "true" : undefined}
              className="cc-option"
              /* Pointerdown, not click: the input must not lose focus first. */
              onPointerDown={(e) => {
                e.preventDefault();
                commit(o);
              }}
              onPointerEnter={() => setActive(i)}
            >
              <span className="cc-flag" aria-hidden="true">
                {o.flag}
              </span>
              <span className="cc-name">{o.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
