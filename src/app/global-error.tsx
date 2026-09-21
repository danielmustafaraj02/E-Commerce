"use client";

import { useEffect } from "react";
import { ERROR_MESSAGES, localeDir, useClientLocale } from "@/lib/i18n/error-messages";

// Catches errors thrown by the root layout itself (where the normal
// error.tsx boundary can't help, since it renders inside that same layout).
// Must render its own <html>/<body> — this replaces the whole page.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useClientLocale();
  const t = ERROR_MESSAGES[locale];

  useEffect(() => {
    console.error("Unhandled root-layout error:", error);
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, digest: error.digest, url: location.href }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang={locale} dir={localeDir(locale)}>
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{t.title}</h1>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>{t.short}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              background: "#111827",
              color: "white",
              border: "none",
            }}
          >
            {t.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
