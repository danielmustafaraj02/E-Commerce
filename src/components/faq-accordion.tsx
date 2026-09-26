"use client";

import { useEffect, useState } from "react";
import { Link } from "@/components/localized-link";
import type { FaqItem, FaqLink } from "@/lib/faq";

function AnswerLink({ link }: { link: FaqLink }) {
  const content = (
    <>
      {link.label} <span aria-hidden="true">{link.external ? "↗" : "→"}</span>
    </>
  );
  return link.external ? (
    <a href={link.href} className="faq-link" target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link href={link.href} className="faq-link">
      {content}
    </Link>
  );
}

// One answer open at a time, the first `initial` questions shown and the rest
// behind "More questions". A link to #<question id> (e.g. the product page's
// "#gift-packaging") reveals and opens that answer. `defaultOpen` starts one
// answer open (rendered open on the server too, so nothing shifts).
export function FaqAccordion({
  items,
  initial,
  moreLabel,
  fewerLabel,
  defaultOpen,
}: {
  items: FaqItem[];
  initial: number;
  moreLabel: string;
  fewerLabel: string;
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.slice(1);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return;
      if (index >= initial) setShowAll(true);
      setOpen(id);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items, initial]);

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const expanded = open === item.id;
        const hidden = !showAll && index >= initial;
        return (
          <div key={item.id} id={item.id} className="faq-item" hidden={hidden}>
            <h3 className="faq-question">
              <button
                type="button"
                id={`faq-q-${item.id}`}
                aria-expanded={expanded}
                aria-controls={`faq-a-${item.id}`}
                onClick={() => setOpen(expanded ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`faq-a-${item.id}`}
              role="region"
              aria-labelledby={`faq-q-${item.id}`}
              className="faq-answer"
              data-open={expanded}
            >
              <div>
                <p>{item.answer}</p>
                {item.link && <AnswerLink link={item.link} />}
                {item.links && item.links.length > 0 && (
                  <ul className="faq-links">
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <AnswerLink link={link} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {items.length > initial && (
        <button
          type="button"
          className="faq-more"
          aria-expanded={showAll}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? fewerLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
