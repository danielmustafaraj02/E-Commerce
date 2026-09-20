import type { Metadata } from "next";

// For pages that must never appear in search results: private/account-scoped
// pages, transactional flows, and thin utility pages. `follow: false` too —
// there is nothing on them worth passing link equity through.
export const noIndexMetadata: Metadata = { robots: { index: false, follow: false } };
