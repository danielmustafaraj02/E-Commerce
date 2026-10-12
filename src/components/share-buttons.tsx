"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

// WhatsApp/Facebook/X links are plain share-intent URLs (no SDK, no
// tracking pixel) — they cost nothing from a CSP or checkout-security
// standpoint (see src/proxy.ts), just a normal outbound link.
//
// Shown as a row of round icon buttons. The logos are self-drawn, like the
// footer's (components/social-links.tsx): no icon font or CDN. Every button
// keeps its name for screen readers (aria-label) and as a hover tooltip (title).

const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true as const };

function WhatsAppIcon() {
  return (
    <svg {...ICON} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path
        d="M9.3 8c-.3 0-.6.1-.8.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.3 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.8-1.9c-.2-.4-.4-.4-.5-.4h-.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M14 22v-8h2.7l.4-3.2H14V8.7c0-.9.3-1.6 1.6-1.6H17V4.2C16.6 4.1 15.6 4 14.5 4 12 4 10.3 5.6 10.3 8.4v2.4H7.6V14h2.7v8h3.7Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON} fill="currentColor">
      <path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5Z" />
    </svg>
  );
}

/* Round, quiet at rest; on hover each takes its platform's own colour. */
const BUTTON =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function ShareButtons({
  url,
  title,
  dict,
}: {
  url: string;
  title: string;
  dict: { share: string; copyLink: string; linkCopied: string };
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (very old browser, insecure context) —
      // the link is still visible/selectable in the address bar either way.
    }
  }

  /* The phone's own share sheet where there is one (it reaches every app the
     visitor uses); elsewhere the same button copies the link. */
  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Closing the sheet is not a failure; anything else falls back to copying.
        if ((error as DOMException)?.name === "AbortError") return;
      }
    }
    await copyLink();
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={share}
        className={`${BUTTON} hover:border-foreground hover:bg-foreground`}
        aria-label={dict.share}
        title={dict.share}
      >
        <Share2 size={17} strokeWidth={1.6} aria-hidden="true" />
      </button>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} hover:border-[#25d366] hover:bg-[#25d366]`}
        aria-label="WhatsApp"
        title="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} hover:border-[#1877f2] hover:bg-[#1877f2]`}
        aria-label="Facebook"
        title="Facebook"
      >
        <FacebookIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BUTTON} hover:border-[#101419] hover:bg-[#101419]`}
        aria-label="X"
        title="X"
      >
        <XIcon />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={`${BUTTON} hover:border-foreground hover:bg-foreground`}
        aria-label={copied ? dict.linkCopied : dict.copyLink}
        title={copied ? dict.linkCopied : dict.copyLink}
      >
        {copied ? (
          <Check size={17} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <Link2 size={17} strokeWidth={1.6} aria-hidden="true" />
        )}
      </button>
      {/* Announces the copy for screen readers; the tick says it visually. */}
      <span className="sr-only" role="status">
        {copied ? dict.linkCopied : ""}
      </span>
    </div>
  );
}
