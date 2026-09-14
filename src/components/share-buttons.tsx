"use client";

import { useState } from "react";

// WhatsApp/Facebook/X links are plain share-intent URLs (no SDK, no
// tracking pixel) — they cost nothing from a CSP or checkout-security
// standpoint (see src/proxy.ts), just a normal outbound link.
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

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-foreground/60">{dict.share}</span>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground/70 hover:text-primary transition-colors"
        aria-label="WhatsApp"
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground/70 hover:text-primary transition-colors"
        aria-label="Facebook"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground/70 hover:text-primary transition-colors"
        aria-label="X"
      >
        X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="text-foreground/70 hover:text-primary transition-colors"
      >
        {copied ? dict.linkCopied : dict.copyLink}
      </button>
    </div>
  );
}
