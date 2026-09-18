"use client";

import { useId, useState } from "react";

// Shared show/hide toggle for password inputs (login, register) — kept as
// its own client component rather than inlined in each form so the eye
// icon and state logic live in one place.
export function PasswordField({
  label,
  name,
  autoComplete,
  minLength,
}: {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className="field pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="text-foreground/40 hover:text-foreground/70 absolute inset-y-0 right-0 flex w-9 items-center justify-center transition-colors"
        >
          {visible ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
              <path d="M9.5 5.4A9.9 9.9 0 0 1 12 5c5 0 9 4.5 9.9 7-.4 1.1-1 2.2-1.9 3.2M6.5 6.6C4.6 7.9 3.1 9.7 2.1 12c1 2.5 5 7 9.9 7 1.3 0 2.6-.3 3.7-.8" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2.1 12c1-2.5 5-7 9.9-7s8.9 4.5 9.9 7c-1 2.5-5 7-9.9 7s-8.9-4.5-9.9-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}
