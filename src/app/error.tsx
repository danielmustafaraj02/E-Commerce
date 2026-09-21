"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ERROR_MESSAGES, useClientLocale } from "@/lib/i18n/error-messages";
import "./home.css";
import "./shop.css";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useClientLocale();
  const t = ERROR_MESSAGES[locale];

  useEffect(() => {
    console.error("Unhandled route error:", error);
    // Same-origin report — see src/app/api/client-error/route.ts for why
    // this doesn't call a third-party SDK directly from the browser.
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, digest: error.digest, url: location.href }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    // Not <ShelfMain>: an error boundary shouldn't depend on the font loader, so
    // the display/UI faces fall back to the system serif/sans here.
    <main className="shelf flex flex-1 flex-col">
      <div className="shelf-wrap shop-w-sm shop-center">
        <h1 className="shop-title">{t.title}</h1>
        <p className="shop-lede">{t.body}</p>
        <div className="shop-actions">
          <button type="button" onClick={reset} className="btn-primary text-sm">
            {t.retry}
          </button>
          <Link href="/" className="btn-secondary text-sm">
            {t.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
