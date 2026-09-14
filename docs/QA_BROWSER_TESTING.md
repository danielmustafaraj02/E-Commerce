# Checking the site in Firefox

This project is QA'd against a real, running Firefox instance (not JSDOM/headless assumptions) — console errors, failed network requests, and full click-through flows across storefront + admin. This doc covers both the automated path (Claude driving Firefox via MCP) and the manual path (a human doing the same thing by hand).

## 1. Automated: Firefox DevTools MCP (for Claude Code)

The project now ships a project-scoped MCP server config at [`.mcp.json`](../.mcp.json) using Mozilla's official **`@mozilla/firefox-devtools-mcp`** package (note: the older `firefox-devtools-mcp` name on npm is deprecated — this project points at the current one). It's configured with the tool modules actually needed for QA — `pages`, `snapshot`, `input`, `network`, `console`, `screenshot` — deliberately leaving out unrelated modules (`profiler`, `webextension`, `debugging`, `privileged`, `androidDevice`, etc.).

**First use in a session:** Claude Code will prompt you to approve the project's `.mcp.json` server the first time it tries to use it (or you can pre-approve via `claude mcp` settings) — this is expected, it's a trust prompt for running `npx @mozilla/firefox-devtools-mcp`, not an error.

**Requirements:**
- Firefox installed locally (already present on this machine: `/usr/bin/firefox`, v155.0.1). No profile/setup needed — the MCP server launches its own controlled instance by default.
- The dev server running (`npm run dev`, see [LOCAL_DEV.md](./LOCAL_DEV.md)) — the MCP config's `--startUrl` points at `http://localhost:3000`.

**What a QA pass should check** (mirrors [`reports/qa-log.md`](../reports/qa-log.md)'s existing scope — keep new passes consistent with it):
- Console: zero unexpected errors/warnings per page (ignore known/benign ones already logged).
- Network: zero failed (4xx/5xx, or dropped) requests during normal navigation.
- Manual flow walk-throughs: home → products (filters, pagination) → product detail → cart (add/update/remove) → checkout (guest + logged-in) → order confirmation.
- Admin: login/logout, dashboard, tax rules, shipping config, team/roles, and the staff-vs-admin permission boundary (staff can reach catalog/orders/shipping/discounts; must NOT reach `/admin/payments` or `/admin/team`'s access-granting controls).
- Responsive: re-check key pages at a mobile viewport (Firefox DevTools MCP's `--viewport` flag, or Responsive Design Mode manually — see below).

**Logging findings:** append new findings to `reports/qa-log.md` under a new `## Pass N — <date>` heading, following the existing format (🔴 real bug / 🟠 medium / 🟢 low / ✅ verified working / 🟡 not-a-bug-false-positive). Only log *new* findings — skip anything already listed.

## 2. Manual: driving Firefox yourself

If you'd rather click through it by hand:

1. `npm run dev`, then open http://localhost:3000 in Firefox.
2. **Console:** `Ctrl+Shift+K` (or `F12` → Console tab) — watch for red errors and yellow warnings while navigating.
3. **Network:** `Ctrl+Shift+E` (or `F12` → Network tab) — filter to "4xx/5xx" or sort by status to spot failed requests; the "Disable Cache" checkbox matters when testing repeat visits.
4. **Responsive Design Mode:** `Ctrl+Shift+M` — test at common breakpoints (390px mobile, 768px tablet, 1280px+ desktop). This project's footer/nav/filter-panel are known to reflow at mobile widths (see `reports/qa-log.md` for what's already been verified).
5. **Accessibility:** `F12` → Accessibility tab, or the "Inspect Accessibility Properties" context-menu item, to spot missing landmarks (e.g. the known `<main>`-landmark gap on `/admin/*` pages).
6. Seeded admin login for testing admin/staff flows: `admin@demo-store.example` / `ChangeMe123!` (see [README](../README.md#getting-started) — change this before any real deploy).

## 3. Why Firefox specifically

Cross-browser coverage matters generally, but this codebase in particular sets a strict per-request nonce-based CSP and several security headers on the checkout path (`src/proxy.ts`, `next.config.ts`) — Firefox's DevTools surface CSP violations and blocked requests clearly in the console, which is exactly the class of bug (a blocked script, a misconfigured `connect-src`) that's easy to miss testing only against a framework's own dev-mode warnings.
