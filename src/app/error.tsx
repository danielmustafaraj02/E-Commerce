"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./home.css";
import "./shop.css";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <h1 className="shop-title">Something went wrong</h1>
        <p className="shop-lede">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div className="shop-actions">
          <button type="button" onClick={reset} className="btn-primary text-sm">
            Try again
          </button>
          <Link href="/" className="btn-secondary text-sm">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
