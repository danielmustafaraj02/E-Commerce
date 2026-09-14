# E-Commerce Platform — Full Build Prompt (White-Label, Secure, CLI-Buildable)

Use this as a single prompt for Claude Code (or similar CLI coding agent). It's written so the result is a **generic, database-driven store** — rebrand it into a new shop just by editing config/DB rows, not code.

---

## 1. Project Goal

Build a production-ready, secure, white-label e-commerce platform. The **same codebase** must be able to become a completely different-looking store just by changing:

- Store name, logo, colors, fonts (via a `store_settings` table)
- Product catalog (via `products` table)
- Currency, tax rules, shipping zones (via config tables)

No hardcoded brand names, colors, or product data anywhere in the code.

---

## 2. Tech Stack

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes (or separate Node.js + Express if preferred)
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** NextAuth.js (email/password + optional Google login), hashed with bcrypt/argon2
- **Payments:** Stripe (cards, Apple Pay, Google Pay) + PayPal as a second option
- **Hosting:** Vercel (frontend/API) + Railway or Supabase (Postgres)
- **Image storage:** Cloudinary or S3-compatible bucket
- **Email:** Resend or SendGrid (order confirmations, password resets)

---

## 3. White-Label Architecture (this is the key requirement)

Create a `store_settings` table (single row per deployment, or multi-row if multi-tenant):

```
store_settings
- id
- store_name
- logo_url
- primary_color
- secondary_color
- font_family
- default_currency (e.g. EUR)
- default_locale (e.g. it-IT)
- contact_email
- vat_number
- company_legal_name
- company_address
```

All frontend theming pulls from this table at build/runtime — **no hardcoded brand text or colors in components.** Background is white/neutral by default (`#FFFFFF` base), with the primary/secondary colors from settings used only for accents, buttons, and highlights.

---

## 4. Core Database Schema

```
users (id, email, password_hash, name, role[customer/admin], created_at)
products (id, name, description, price, currency, sku, stock_qty, category_id, active, created_at)
product_images (id, product_id, url, position)
categories (id, name, slug, parent_id)
orders (id, user_id, status, subtotal, tax_amount, shipping_amount, total, currency, created_at)
order_items (id, order_id, product_id, quantity, unit_price)
addresses (id, user_id, full_name, street, city, postal_code, country, phone)
shipping_methods (id, name, base_price, price_per_kg, estimated_days, active)
shipping_zones (id, name, countries[], shipping_method_ids[])
tax_rules (id, country, region, rate_percent, name) -- e.g. Italy IVA 22%, 10%, 4% reduced rates
payments (id, order_id, provider[stripe/paypal], provider_transaction_id, status, amount, created_at)
discount_codes (id, code, percent_off OR amount_off, expires_at, max_uses, used_count)
reviews (id, product_id, user_id, rating, comment, created_at)
```

---

## 5. Tax (IVA / VAT) Requirements

- Store default tax rate must be configurable per country in `tax_rules` table (Italy = 22% standard IVA, with 10%/4% reduced rate options for applicable categories).
- Prices shown to customers **must clearly state whether IVA is included** (standard for EU B2C: prices shown IVA-inclusive).
- Checkout must calculate tax based on the **customer's shipping/billing country**, not just the seller's country (EU VAT / OSS rules apply if selling cross-border into other EU states above certain thresholds — flag this clearly in the UI as a "consult an accountant" note, don't hardcode assumptions).
- Every completed order must generate an invoice-style record (order number, VAT number, itemized IVA amount) — required for Italian/EU compliance. Store must have a **P.IVA field** in settings and print it on invoices.

---

## 6. Shipping (Spedizioni)

- `shipping_zones` maps countries → available shipping methods.
- `shipping_methods` holds base price + per-kg price + estimated delivery days.
- Checkout dynamically shows only shipping methods valid for the customer's destination country.
- Support at least: standard shipping, express shipping, and free-shipping-over-threshold (configurable amount in `store_settings`).
- Order status must include: `pending → paid → processing → shipped → delivered → cancelled/refunded`, with a `tracking_number` field once shipped.

---

## 7. Payment Methods

- **Stripe** (primary): card payments, Apple Pay, Google Pay, using Stripe Checkout or Payment Intents (never handle raw card numbers on your own server).
- **PayPal** (secondary option) via PayPal's official SDK.
- Webhooks required for both providers to confirm payment status server-side (never trust the frontend alone to mark an order "paid").
- Store must NEVER store raw card numbers, CVV, or full payment details in the database — only provider transaction IDs and status.

---

## 8. Security Requirements (non-negotiable)

- All secrets (API keys, DB credentials) in environment variables, never committed to git (`.env` in `.gitignore`).
- Passwords hashed with bcrypt or argon2, never stored plain.
- HTTPS enforced everywhere (Vercel does this by default).
- Input validation and sanitization on every API route (use Zod or similar schema validation).
- Rate limiting on login, checkout, and API endpoints to prevent brute-force/abuse.
- CSRF protection on all state-changing requests.
- Role-based access control: admin routes must verify `role === 'admin'` server-side, not just hide UI elements.
- SQL injection protection via ORM (Prisma parameterizes queries automatically — don't write raw SQL string concatenation).
- Stripe/PayPal webhook signatures must be verified (reject unsigned/forged webhook calls).
- Regular dependency updates (`npm audit`) and no unused/abandoned packages.
- Admin panel behind separate login with stronger session timeout rules.

---

## 9. Admin Panel (minimum features)

- Product CRUD (create/edit/delete/upload images)
- Order management (view, update status, add tracking number)
- Customer list (view orders, basic details — no raw payment data)
- Discount code creation
- Store settings editor (this is what makes it "white-label" — changing name/logo/colors from here rebrands the whole site)
- Basic sales dashboard (revenue, orders count, top products)

---

## 10. Deliverables Expected From the Build

1. Full Next.js project with the schema above implemented in Prisma
2. Working customer-facing store: home, category, product page, cart, checkout, order confirmation, account/order history
3. Working admin panel as described above
4. Stripe + PayPal integration with webhook handlers
5. Seed script with example placeholder data (so it's testable immediately)
6. `README.md` explaining how to: set environment variables, run locally, run migrations, deploy to Vercel + Railway/Supabase
7. `.env.example` file listing every required environment variable with no real secrets

---

## 11. Missing Pieces Added After Review — Security & Professional Features

The sections below were gaps in the original spec. Added after checking current (2026) e-commerce security and professional-store standards.

### 11.1 Compliance (was missing entirely)

- **PCI DSS scope reduction:** using Stripe/PayPal hosted checkout or Stripe Elements keeps you in the lowest PCI compliance tier (SAQ A), since card data never touches your server. Document this explicitly in the README so whoever deploys it doesn't accidentally build a custom card form (which would blow up PCI scope).
- **GDPR (mandatory for EU customers):**
  - Cookie consent banner (functional vs. analytics/marketing cookies split, opt-in not opt-out for non-essential)
  - Privacy policy page + data export/delete endpoints for user accounts ("right to be forgotten")
  - Data retention policy: define how long order/customer data is kept
  - Log a record of consent (timestamp, what was agreed to)
- **Legal pages required, not optional:** Terms & Conditions, Privacy Policy, Return/Refund Policy, Cookie Policy — add a `legal_pages` table (slug, title, content, last_updated) so these are editable without a code deploy.
- **EU 14-day right of withdrawal:** for physical goods sold to EU consumers, checkout/order-confirmation flow must reference the legal right to return within 14 days — this is a legal requirement, not a nice-to-have.

### 11.2 Security — what was under-specified

- **MFA (multi-factor authentication) on all admin accounts** — mandatory, not optional. MFA blocks the overwhelming majority of automated credential-stuffing attacks, and admin accounts are the highest-value target on any store.
- **Web Application Firewall (WAF)** — Vercel and Cloudflare both offer one; enable it in front of the app to filter SQL injection, XSS, and bot traffic before it reaches your code.
- **Bot / credential-stuffing protection** on login, registration, and checkout — add CAPTCHA (hCaptcha/Turnstile) or a bot-detection service, since login endpoints are the most-attacked surface on any store.
- **Fraud detection on payments** — enable Stripe Radar (built into Stripe, scores each transaction for fraud risk) rather than relying only on "payment succeeded."
- **Security headers** — enforce CSP (Content-Security-Policy), HSTS, X-Frame-Options, X-Content-Type-Options at the framework/hosting level.
- **Audit logging** — every admin action (price change, order refund, product delete, settings change) must be written to an `audit_log` table (who, what, when, before/after values). This is both a security control and something you'll want the day something goes wrong.
- **Automated backups + disaster recovery** — daily automated Postgres backups with a tested restore process, not just "the host probably backs it up." Document an actual recovery runbook.
- **Monitoring & alerting** — error tracking (Sentry or similar) + uptime monitoring, with alerts if checkout or payment webhooks start failing. A broken checkout that nobody notices for 3 days is the single most common way small stores quietly lose money.
- **Dependency/vulnerability scanning** — automated `npm audit` / Dependabot-style checks in CI, since outdated packages are the most common root cause of e-commerce breaches.
- **Session security** — short session expiry for admin accounts, forced re-login for sensitive actions (refunds, settings changes, deleting products).
- **Least-privilege roles** — beyond just `customer`/`admin`, add a `staff` role with limited permissions (e.g. can view orders, can't change store settings or issue refunds) so you're not forced to hand out full admin access to every helper.

### 11.3 Professional store features that were missing

- **Inventory management:** low-stock threshold + alert, and automatic "out of stock" handling at checkout (prevent overselling — this is a very common real-world bug in DIY stores).
- **Returns/refunds workflow:** a `return_requests` table and admin flow — customers need a way to request a return, not just an email to you.
- **Abandoned cart recovery:** track carts that were started but not completed, with an optional automated reminder email — this alone typically recovers meaningful revenue for small stores.
- **Multi-currency display (optional but common):** even if you charge in EUR, showing an approximate price in the visitor's local currency improves conversion for international traffic.
- **Search + filtering:** product search with filters (category, price range, in-stock only) — was implied but not explicit in the schema.
- **Guest checkout:** don't force account creation to buy — this is one of the top reasons for cart abandonment.
- **Order status emails:** automatic transactional emails at each status change (order placed, shipped, delivered), not just at purchase.
- **Sitemap + basic SEO metadata** (title/description per product, Open Graph tags) — needed for the store to be findable at all.
- **Accessibility basics (WCAG):** proper alt text fields on product images, keyboard-navigable checkout, sufficient color contrast — increasingly also a legal requirement in the EU (European Accessibility Act) for e-commerce.

---

## 13. Additional Mandatory Items — Deeper Safety Pass

This section covers what's still missing after a second, deeper pass. Some of these matter more than people expect.

### 13.1 Checkout-page skimming (Magecart) — the #1 real-world card-theft vector

This is worth calling out on its own because it's how most major e-commerce card breaches actually happen, and it bypasses backend security entirely — the attack runs as JavaScript inside the _customer's browser_ on your checkout page, silently capturing what they type before it's even submitted.

- **Minimize third-party scripts on checkout/payment pages specifically** — every analytics tag, chat widget, or ad pixel on that page is a potential attack surface, even if you never wrote the malicious code yourself (attackers often compromise the _third-party vendor_, not your site directly).
- **Content-Security-Policy (CSP)** restricting which domains can load scripts, and **Subresource Integrity (SRI)** hashes on any third-party script you do load, so a tampered script fails to execute instead of running silently.
- **Use Stripe/PayPal's hosted checkout or embedded iframe elements** rather than a custom card form — this keeps card entry inside an isolated frame the rest of your page's JavaScript can't read from, which is the single biggest mitigation available.
- **File integrity / script-change monitoring** on the checkout page in production, so an unauthorized change to what scripts are running gets flagged instead of sitting undetected (average dwell time for these attacks before discovery is measured in months).

### 13.2 Infrastructure & secrets hardening (was assumed, not specified)

- **Separate staging and production environments** with separate databases and API keys — never test against live customer data or real Stripe keys.
- **Secrets manager** (Vercel/Railway's built-in env var encryption, or a dedicated tool) with **periodic API key rotation**, not "set once and forget."
- **TLS 1.2+ enforced**, weak ciphers disabled (mostly automatic on Vercel/Cloudflare, but worth confirming rather than assuming).
- **DNS security:** enable domain lock (prevents unauthorized transfer) and consider DNSSEC; monitor SSL certificate expiry (auto-renewal should be on, but a monitoring alert as backup costs nothing).
- **Least-privilege API keys** — Stripe/PayPal/Cloudinary keys scoped to only the permissions actually needed, separate keys per environment.

### 13.3 Account & session hardening (was underspecified)

- **Account lockout / exponential backoff** after repeated failed logins (works alongside CAPTCHA, not instead of it).
- **Email verification required** before an account can place orders, to cut down on fraud and fake accounts.
- **Password reset tokens** must be single-use and expire quickly (e.g. 15–30 minutes).
- **Secure cookie flags** on all session cookies: `httpOnly`, `secure`, `sameSite=strict` (or `lax` where cross-site flows require it) — a commonly-skipped default in DIY builds.
- **Re-authentication required** for sensitive actions (changing email/password, viewing full order history with addresses).

### 13.4 Input & upload security

- **Server-side validation on every input**, not just frontend form validation (client-side checks are a UX nicety, never a security control).
- **File upload restrictions** on product image uploads: enforce file type allow-list (not just extension — check actual file signature), size limits, and run through a malware/AV scan before storage — image upload fields are a common injection point for planting malicious files.
- **Output encoding** everywhere user-generated content is displayed (reviews, product descriptions) to prevent stored XSS.

### 13.5 Incident response & data-processing obligations

- **Written incident response plan**, even a simple one: who does what if a breach is suspected, and in what order (contain → assess → notify → remediate).
- **GDPR 72-hour breach notification rule** — if EU customer data is exposed, you're legally required to notify the relevant data protection authority within 72 hours of becoming aware. This needs to be a known process, not something figured out during a crisis.
- **Data Processing Agreements (DPAs)** with every subprocessor that touches customer data — Stripe, PayPal, your hosting provider, your email service. Most of these offer a standard DPA you just need to accept/sign; confirm this is done, don't assume it's automatic.
- **Data minimization** — don't collect or store more customer data than the store actually needs (e.g. don't store full card numbers ever, don't require a phone number if you don't use it).

### 13.6 Business/legal operational items (outside the code, but genuinely mandatory)

These aren't things I can build, but they're required in practice before taking real payments — flagging so nothing gets missed:

- **Registered business entity** (partita IVA / equivalent) — most payment processors require this to fully activate a live account, not just a test one.
- **Electronic invoicing (fatturazione elettronica)** — if operating in Italy, this is a legal requirement for issuing valid invoices, separate from just generating a PDF receipt. Needs either an accountant-provided tool or an e-invoicing API integration.
- **Business/cyber insurance** — worth pricing out once you're processing real transactions; a data breach or major fraud incident can be an existential cost for a small store without it.
- **Consult an accountant on VAT/OSS rules** if you expect to sell to customers in multiple EU countries — the correct tax rate depends on buyer location past certain thresholds, and getting this wrong has real penalties.

---

## 14. How to Use This Prompt

Paste this entire file into Claude Code (or your CLI coding agent) in an empty project folder and say:

> "Build this e-commerce platform exactly as specified above, step by step, starting with the database schema and Prisma setup."

Then iterate section by section (auth → products → cart/checkout → payments → admin panel → section 11 security/compliance items → section 11 professional features) rather than asking for everything in one shot — this keeps output reviewable and reduces errors.

**Note on sections 11 and 13:** some of these (MFA, WAF, audit logging, backups, monitoring, CSP/SRI on checkout, DPAs) are genuinely necessary before you take real payments — not polish to add "someday." Build the store, but don't flip it live to real customers until at least: MFA on admin, Stripe Radar enabled, security headers + CSP set, backups configured, and the business/legal items in §13.6 are sorted.
