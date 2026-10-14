"use client";

import type { LucideIcon } from "lucide-react";
import styles from "./editor-workspace.module.css";

/** A square tool button with a drawn icon; its name is the tooltip and the
 *  accessible label. `pressed` makes it a toggle. */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  pressed,
  tone,
  shortcut,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tone?: "danger";
  /** Shown in the tooltip, e.g. "Ctrl+Z". */
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      className={styles.iconButton}
      data-tone={tone}
      aria-label={label}
      aria-pressed={pressed}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.75} />
    </button>
  );
}

/** A titled group inside a workspace panel. */
export function PanelSection({
  title,
  hint,
  children,
  actions,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className={styles.panelSection}>
      <header>
        <h3>{title}</h3>
        {actions}
      </header>
      {hint && <p className={styles.hint}>{hint}</p>}
      {children}
    </section>
  );
}
