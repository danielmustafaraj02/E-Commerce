"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-foreground/70 mt-2 text-sm">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex gap-4 text-sm">
        <button type="button" onClick={reset} className="bg-primary rounded px-4 py-2 text-white">
          Try again
        </button>
        <Link href="/" className="border-foreground/20 rounded border px-4 py-2">
          Back to home
        </Link>
      </div>
    </main>
  );
}
