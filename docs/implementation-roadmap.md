# Implementation roadmap

Order follows the master specification, adjusted where the audit found risks
that matter more than the planned order. Each phase is independently testable
and reversible. Status as of 11 October 2026.

## Stop points (need the owner's explicit go-ahead)

- Anything that writes to the production database outside normal admin use
  (migrations included: they run automatically on the next deploy).
- Switching Stripe to live keys, changing payment providers, or any refund flow.
- Changing secrets or environment variables in Vercel.
- Rewriting Git history (the database dump) or changing repository visibility.
- Vercel plan or billing changes (the site is currently disabled).

## Phase 0 — Audit and preservation · **done**

- Architecture, builder, security, performance documents in `docs/`.
- Measured baseline (`performance-baseline.md`).
- Found: live site disabled by Vercel; DB dump in public history; open security
  findings; mobile LCP and CLS misses.

**Owner actions:** resolve the Vercel pause (dashboard → Usage/Billing; Pro for a
commercial shop); decide on the dump in Git history.

## Phase 0.5 — Revenue and security fixes · **done** (pulled forward)

Fixed F02, F03, F04, F05 and the Next.js advisories (see `security-audit.md`).
Acceptance: duplicate-line, limit, coupon-race and settlement-race tests pass;
`npm audit --omit=dev` reports 0. **Met.**

## Phase 1 — Core architecture · **first part done**

Done:
- Draft/publish for sections: autosaved server drafts, explicit Publish,
  Discard, resume on reopen, unsaved-change protection, draft badges on the page
  overview. No migration needed (reserved keys in `PageLayout`).

Next:
- `v` schema version on `BuilderDoc` + migration function.
- Page-level drafts (section order and visibility).
- Split `section-builder.ts` (schema / compile / CSS / templates) behind its
  current exports.

Acceptance: published content unchanged while drafts are edited (verified on a
local database); tests for draft storage and actions (**met** for sections).

## Phase 2 — Editor foundation · **largely present**

Present: canvas, selection, multi-select, drag, resize, rotation, grid snapping,
alignment, layers, lock/hide, copy/paste/duplicate, undo/redo, autosave.

Next: rulers and pan, spacing guides between blocks, keyboard shortcut sheet,
layer list virtualization for very long sections.

## Phase 3 — Templates and responsive · **partial**

Next: tablet breakpoint (overrides stored like phone ones, inheritance
phone ← tablet ← computer); inspector shows inherited vs overridden values with
"reset to inherited"; header/footer/cart template families.

Acceptance: a section can differ on tablet without changing computer or phone;
every overridden property shows and can be reset.

## Phase 4 — Advanced design · **partial**

Next: media tags, focal point and crop presets; duplicate detection on upload;
spacing/radius tokens in Site style; versioned theme export/import with
validation.

## Phase 5 — Commerce · **present**

Next: F01 (express checkout holds), F08 (idempotent checkout attempts), refunds
from the admin through Stripe (needs authorization), stock rule consistency for
supplier-managed items.

## Phase 6 — Security and performance · **in progress**

Security next: F06, F07, F09, F14, F15; a Neon development branch so the local
admin no longer tests against production.

Performance next (from the baseline): product page CLS; self-hosted fonts;
shared JavaScript; per-route CSS; article hero preload. Acceptance: mobile LCP
≤ 2.5 s and CLS ≤ 0.1 on home, product, category and article pages under the
documented test profile.

## Phase 7 — Go-live wizard · **done** (pulled forward)

`/admin/settings/go-live`: six steps (store, domain and Vercel, payments,
security, search and speed, publish), read-only, no secret values, design
publishing and code deployment shown separately, exact deploy instructions
instead of a deploy button (no secure deployment integration exists).
Detects the current Vercel suspension as a blocker.

## Phase 8 — Final QA · **not started**

End-to-end tests (Playwright) for: open editor → apply template → autosave →
reopen → publish → storefront shows it → restore version; Stripe test checkout
against a test-mode account; visual regression snapshots of every template on
desktop/tablet/mobile. Needs: a test database and Stripe test keys in CI.
