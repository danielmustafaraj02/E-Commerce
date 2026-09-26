"use client";

import { useState, useSyncExternalStore } from "react";
import { Link } from "@/components/localized-link";
import type { FooterSection } from "@/lib/footer-nav";

// Footer link groups: collapsible on phones (one tap opens a group), always
// open as columns from 48rem up. CSS does the desktop layout, so there's no
// layout shift before hydration; this only keeps aria-expanded truthful.
const DESKTOP = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function FooterAccordion({ sections }: { sections: FooterSection[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => false
  );

  return (
    <div className="footer-nav">
      {sections.map((section) => {
        const expanded = desktop || open === section.id;
        const panelId = `footer-panel-${section.id}`;
        const buttonId = `footer-button-${section.id}`;
        return (
          <div key={section.id} className="footer-group">
            <h2 className="footer-group-heading">
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                tabIndex={desktop ? -1 : undefined}
                onClick={() => setOpen(open === section.id ? null : section.id)}
              >
                {section.title}
                <span className="footer-group-icon" aria-hidden="true" />
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="footer-group-panel"
              data-open={open === section.id}
            >
              <ul>
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href}>{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
