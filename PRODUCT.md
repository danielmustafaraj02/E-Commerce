# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two co-equal primary audiences:
- **Gift buyers** shopping for a specific occasion (holiday, birthday, anniversary), served by the gift-finder and personalised gift card flows.
- **Self-purchasers** buying Murano glass jewelry for themselves, drawn by the craftsmanship and heritage story.

Both groups shop the same catalog and trust story; the journeys differ mainly in entry point (gift-finder/gift-card vs. direct product/category browsing).

## Product Purpose

Perla Murano Glass sells genuine, hand-blown Murano glass jewelry (necklaces, and related pieces) online, across an 11-locale storefront (en, it, fr, de, ar, zh, ru, es, pt, hi, ja). Success means a buyer trusts the piece is authentically made in Murano, Italy, and completes a purchase for themselves or as a gift.

## Positioning

**Verified authenticity** is the core differentiator: genuine hand-blown Murano glass, as opposed to the mass-produced imitations common elsewhere in the market. The 700-year Murano glassmaking tradition is the provenance/trust story, not just decorative color.

## Operating Context

- Full storefront: category/product browsing, cart, checkout (Stripe), order confirmation, wishlist, "looks" (curated/composable outfit pairings), gift-finder, personalised gift cards, blog, legal pages, contact.
- Account area with login/register, password reset, and MFA (TOTP via otplib/qrcode).
- Admin backend for day-to-day store operation: products, categories, orders, returns, discounts, shipping (zones/methods), tax rules, suppliers, customers, newsletter, SEO, legal pages, team/roles, roadmap.
- Automation surfaces: cron jobs, webhooks, merchant feed export, consent logging, audit log.
- Multi-locale content and SEO (hreflang alternates, locale-aware metadata) across 11 languages.

## Capabilities and Constraints

- Next.js (App Router) + Prisma/Postgres, NextAuth, Stripe payments, Resend for transactional email, Upstash rate limiting.
- Fulfillment involves real suppliers (Supplier/Fulfillment models) — pieces are sourced/made, not print-on-demand or dropshipped generically.
- Reviews are backed by a real `Review` model; there is no mechanism for or intent to fabricate testimonials.
- Discount codes support both percentage and fixed-amount formats with currency formatting.

## Brand Commitments

- Store name: **Perla Murano Glass**. Domain: perlamuranoglass.com.
- Never imply the protected "Vetro Artistico® Murano" certification mark for a product unless that specific product actually holds it — this is an active legal constraint already flagged in code (`src/lib/launch-checklist.ts`) and must be respected in all future copy and design work.
- Friendly/partner link to venetianmuranoglass.com referenced on the About page.

## Evidence on Hand

- Heritage/brand-story content on `/about` and `/murano-glass` (technique, authenticity, care, history FAQ).
- Blog content, e.g. "How to Care for Murano Glass Jewelry."
- Real product catalog data (Product/ProductImage/Category models) — no placeholder/fabricated product content should be introduced.
- No fabricated testimonials, press mentions, or benchmarks; only real `Review` data may be surfaced as social proof.

## Product Principles

1. Authenticity is the trust anchor — every design and copy decision should reinforce that pieces are genuinely hand-blown in Murano, never implying more certification than is true.
2. Serve gift-buying and self-purchase as equally weighted journeys, not one as an afterthought of the other.
3. Heritage (700-year tradition) is a positioning asset, not just decorative background — the story should stay legible, not buried behind product listings.
4. Global-first: the storefront's 11-locale reach means content and design must hold up in RTL (Arabic) and non-Latin scripts (Chinese, Japanese, Hindi, Russian), not just English.
5. The admin backend is a genuine operating tool for running the business day-to-day (orders, suppliers, tax, shipping) — clarity and low error-proneness there matter as much as storefront polish.
