import { noIndexMetadata } from "@/lib/seo";

// Rendered per request, never cached: this page handles a visitor's own data
// or a payment, so it keeps the strict per-request CSP nonce (see proxy.ts,
// STRICT_CSP_PATH), which a cached page could not carry.
export const dynamic = "force-dynamic";

export const metadata = noIndexMetadata;

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
