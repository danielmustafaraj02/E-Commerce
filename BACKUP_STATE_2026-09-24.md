# Production Backup & State Snapshot — 2026-09-24

**Created at:** 2026-09-24 UTC  
**Current production site:** https://perlamuranoglass.com  
**Git commit:** `0e2220b` (Add project rules and a safe prod-to-local DB sync script)

---

## 1. Git & Deployment State

### Current Commit
```
0e2220b Add project rules and a safe prod-to-local DB sync script
6e372cd Product page: Read more fades the description out instead of an ellipsis mid-word
c50c964 Product page: wider editorial hero, clearer hierarchy, grouped details
```

### Branch
- **Main branch:** `main` (all changes here deploy to https://perlamuranoglass.com)
- **Status:** Clean (no uncommitted changes)

### Deployment Process
1. Push to `main` branch
2. Vercel automatically deploys to https://perlamuranoglass.com
3. Build step runs: `node scripts/migrate.mjs && next build`
4. Migrations are applied to live production database

**MIGRATION SAFETY NOTE:** Vercel preview deployments skip migrations (use live DB) unless `MIGRATE_PREVIEWS=1` is set.

---

## 2. Database Schema & Migrations

### Migration History (20 migrations)
All migrations are in `prisma/migrations/`:
1. `20260914205418_init` — Initial schema
2. `20260917130000_add_wishlist` — Wishlist feature
3. `20260917140000_add_product_translations` — Multi-language support
4. `20260917214002_add_fr_de_translations`
5. `20260918033700_add_ar_zh_ru_translations`
6. `20260918040000_add_es_pt_hi_ja_translations`
7. `20260920120000_add_password_changed_at` — Security: Password change tracking
8. `20260920120100_add_indexes` — Performance: Database indexes
9. `20260921120000_add_category_descriptions`
10. `20260921150000_add_order_locale` — Track order language
11. `20260921170000_add_address_coordinates` — Shipping coordinates
12. `20260922010000_add_product_color` — Product color attribute
13. `20260923180000_add_product_image_lifestyle_flag`
14. `20260923190000_add_product_story` — Editorial content
15. `20260924010000_add_improvement_task_claude_fields`
16. `20260924020000_add_product_compare_at_price` — Original price tracking
17. `20260924120000_add_product_price_history`
18. `20260924130000_add_looks` — Product styling/pairing
19. `20260924140000_add_gift_metadata`

### Database Structure
- **Provider:** PostgreSQL (Neon in production)
- **Major tables:**
  - `User` — Authentication (email, password, MFA)
  - `Account`, `Session`, `VerificationToken` — Auth.js
  - `StoreSettings` — Single row, all payment/integration credentials
  - `Product`, `Category`, `Supplier` — Catalog
  - `Order`, `OrderItem` — Sales
  - `Payment` — Payment records (Stripe/PayPal)
  - `ShippingZone`, `ShippingMethod`, `TaxRule` — Fulfillment
  - `Review`, `Wishlist` — Customer features
  - `Cart` — Shopping cart
  - `NewsletterSubscriber` — Email marketing
  - `ImprovementTask` — Roadmap/to-do list
  - `AnalyticsRecord` — Custom analytics
  - `Looks` — Product styling combinations
  - `GiftMetadata` — Gift purchase metadata

---

## 3. Configuration & Credentials

### Stored in Database (StoreSettings table)
These can be set in **Admin → Settings** without redeployment:
- `stripeSecretKey` (fallback to env)
- `stripePublishableKey` (fallback to env)
- `stripeWebhookSecret` (fallback to env)
- `klarnaEnabled` (boolean toggle)
- `paypalClientId` (fallback to env)
- `paypalClientSecret` (fallback to env)
- `paypalWebhookId` (fallback to env)
- `resendApiKey` (fallback to env)
- `emailFrom` (fallback to env)
- `turnstileSiteKey` (fallback to env)
- `turnstileSecretKey` (fallback to env)
- `upstashRedisUrl` (fallback to env)
- `upstashRedisToken` (fallback to env)
- `googleClientId` (fallback to env)
- `googleClientSecret` (fallback to env)
- SEO: `siteUrl`, `metaDescription`, `ogImageUrl`, `googleSiteVerification`
- Store branding: `storeName`, `logoUrl`, `primaryColor`, `secondaryColor`
- Offline payments: `bankTransferEnabled`, bank details, `codEnabled`, COD fee
- Social links: Facebook, Instagram, Twitter, TikTok, YouTube, LinkedIn

### Environment Variables (Required for Deployment)
These must be set in **Vercel dashboard → Settings → Environment Variables**:
- `DATABASE_URL` — Postgres connection (CRITICAL)
- `AUTH_SECRET` — Session signing key (CRITICAL)
- `NEXTAUTH_URL` — Public site URL (CRITICAL)
- `STRIPE_SECRET_KEY` (or via DB StoreSettings)
- `STRIPE_PUBLISHABLE_KEY` (or via DB)
- `STRIPE_WEBHOOK_SECRET` (or via DB)
- `PAYPAL_CLIENT_ID` (or via DB)
- `PAYPAL_CLIENT_SECRET` (or via DB)
- `PAYPAL_WEBHOOK_ID` (or via DB)
- `PAYPAL_ENV` — `live` or `sandbox`
- `RESEND_API_KEY` (or via DB)
- `EMAIL_FROM` (or via DB)
- `CRON_SECRET` — Abandoned order cron auth
- `UPSTASH_REDIS_REST_URL` (or via DB)
- `UPSTASH_REDIS_REST_TOKEN` (or via DB)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (or via DB)
- `TURNSTILE_SECRET_KEY` (or via DB)
- `SENTRY_DSN` — Error tracking
- `GOOGLE_CLIENT_ID` (or via DB, optional)
- `GOOGLE_CLIENT_SECRET` (or via DB, optional)
- `ADMIN_SESSION_MAX_AGE_MINUTES` — Default 240 (optional)
- `ABANDONED_ORDER_REMINDER_HOURS` — Default 1 (optional)
- `ABANDONED_ORDER_EXPIRE_HOURS` — Default 2 (optional)
- `BANK_TRANSFER_HOLD_DAYS` — Default 5 (optional)
- `NEXT_PUBLIC_IMAGE_HOSTS` — Additional image CDN hosts (optional)

### Vercel Configuration (vercel.json)
```json
{
  "crons": [{ "path": "/api/cron/abandoned-orders", "schedule": "0 3 * * *" }]
}
```
- **Daily cron at 3 AM UTC:** Cleans up abandoned (unpaid) orders, releases stock

---

## 4. Product Data & Images

### Product Catalog
- **Manifest file:** `scripts/murano-manifest.json` (440 KB)
- **Seeding script:** `scripts/seed-murano-catalog.ts`
- **Products:** 3 main categories (via `public/products/` structure)
  - `bracciali-in-vetro-di-murano` — Bracelets
  - `collane-in-vetro-di-murano` — Necklaces
  - `orecchini-in-vetro-di-murano` — Earrings

### Images
- **Location:** `public/products/` (local, committed to git)
- **Additional images:** External URLs (e.g., Vercel Blob, external CDNs)
  - Images referenced in DB via `imageUrl` fields on `Product`
  - Admin can add new images via URL paste (Admin → Catalog → Products)
- **Optimization:** `next/image` on configured hosts; see `lib/image-hosts.ts`

### Catalog Modification Scripts
All scripts read `scripts/murano-manifest.json` and can be run with `--dry-run`:
- `import-products.ts` — Import product list
- `apply-product-i18n.ts` — Apply multi-language descriptions
- `set-product-colors.ts` — Assign colors to products
- `apply-jewelry-competitor-pricing.ts` — Price adjustments
- `create-looks.ts` — Create product styling combinations
- And 30+ more admin/maintenance scripts

---

## 5. Integrations & Services

### Payment Processing
- **Stripe:** Card, Apple Pay, Google Pay, Klarna (conditional)
- **PayPal:** Hosted checkout
- **Bank Transfer:** Manual, offline
- **Cash on Delivery:** Optional, manual collection

### Email
- **Provider:** Resend
- **Templates:** React Email (`src/emails/`)
- **Uses:** Order confirmations, password resets, verification, abandoned cart

### Authentication
- **Method:** Auth.js (NextAuth v5) + custom JWT
- **Sessions:** Re-validated against DB on each read
- **MFA:** TOTP (Time-based One-Time Password)
- **Providers:** Email/password + optional Google OAuth

### Rate Limiting
- **Provider:** Upstash Redis (fallback: in-memory per-instance)
- **Used for:** Login attempts, checkout, contact form, API endpoints

### Bot Protection
- **Cloudflare Turnstile:** CAPTCHA on login, register, contact, checkout
- **Optional:** Gracefully degraded if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset

### Error Tracking
- **Sentry:** Optional DSN for production error alerts
- **Fallback:** Console/hosting logs only

### Analytics
- **Vercel Analytics:** Automatic (for Core Web Vitals)
- **Custom:** `/api/events` for custom event tracking
- **Consent-gated:** GA only loaded after cookie consent (`components/consent-gated-analytics.tsx`)

---

## 6. Crons & Scheduled Jobs

### Active Crons
1. **Abandoned Order Cleanup** (3 AM UTC daily)
   - Path: `/api/cron/abandoned-orders`
   - Requires: `CRON_SECRET` header auth
   - Actions:
     - Send reminder emails for unpaid orders >1 hour old
     - Cancel and release stock for unpaid orders >2 hours old (card/PayPal)
     - Cancel and release stock for unpaid bank transfers >5 days old

---

## 7. Monitoring & Observability

### Health Check
- **Endpoint:** `GET /api/health`
- **Purpose:** Uptime monitoring / monitoring service integration

### Sentry (Optional)
- **Setup:** Add `SENTRY_DSN` env var to enable
- **Tracks:** Unhandled errors, payment issues, API failures
- **Integration:** `src/lib/monitoring.ts`

### Vercel Analytics
- **Type:** Real-user monitoring (RUM) / Core Web Vitals
- **Auto-enabled:** No setup required
- **Dashboard:** Vercel project dashboard

---

## 8. Rollback Procedure

### Quick Rollback (if needed within 24 hours)
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find the last known-good deployment
3. Click "Promote to Production"
# This reverts code AND database migrations (be careful with migrations)
```

**IMPORTANT:** If you've added database columns that your code depends on, rolling back code without rolling back DB will cause errors. Always review migration changes before rollback.

### Safe Full Rollback (Database + Code)
```bash
# 1. Rollback database to a backup (Neon/hosting dashboard)
# 2. Revert git commit: git revert <commit-hash>
# 3. Push to main, let Vercel deploy the reverted code
```

### Partial Rollback (Code Only, Keep New DB Schema)
```bash
# 1. Revert git commit: git revert <commit-hash>
# 2. Push to main, Vercel deploys old code against new schema
# Note: Only safe if migrations are backward-compatible
```

### No Automatic Rollback
- Vercel does NOT auto-rollback on build failure
- You must manually promote a previous deployment or revert the commit
- Preview deployments use the live database (if not `MIGRATE_PREVIEWS=1`), so test changes there first

---

## 9. Staging / Development Environment Setup

### Option A: Vercel Preview Deployment (Recommended for Feature Testing)
```bash
# 1. Create feature branch: git checkout -b feature/my-change
# 2. Push to GitHub
# 3. Vercel auto-creates preview URL
# 4. Preview uses LIVE PRODUCTION DATABASE (unless MIGRATE_PREVIEWS=1)
#    So test read-only features, never write production data!
```

### Option B: Local Development Environment
```bash
# 1. Create local Postgres database
#    (or use neon/supabase/railway for remote dev DB)
# 2. Set DATABASE_URL to dev database
# 3. npm install
# 4. npm run db:migrate  # Apply all migrations
# 5. npm run db:seed     # Baseline data
# 6. npx tsx scripts/seed-murano-catalog.ts  # Products
# 7. npm run dev
# 8. Visit http://localhost:3000
```

**NOTE:** Set different env vars for dev:
- `STRIPE_PUBLISHABLE_KEY` → test key
- `STRIPE_SECRET_KEY` → test key
- `PAYPAL_ENV=sandbox`
- `GOOGLE_CLIENT_ID/SECRET` → dev OAuth app (or leave unset to skip Google sign-in)
- Leave `SENTRY_DSN` unset to avoid sending dev errors to production Sentry

### Option C: Staging Database + Vercel Deployment
```bash
# 1. Create a second Vercel project pointing to the same repo
# 2. Set it to deploy from a `staging` branch (or `main` with env override)
# 3. Attach separate DATABASE_URL (staging Postgres)
# 4. Deploy staging independently
# 5. Test before promoting code to main → production
```

---

## 10. Critical Safeguards

### Before Pushing to Main
- ✅ Run tests locally: `npm test`
- ✅ Check types: `npm run typecheck`
- ✅ Verify migrations: `npm run db:migrate --dry-run` (if schema changed)
- ✅ Test in preview deployment first (if possible)

### Before Production Migrations
- ✅ Backup live database (Neon, Vercel, or hosting provider)
- ✅ Test migration on dev database first
- ✅ Review migration SQL (`prisma/migrations/*/migration.sql`)
- ✅ Have rollback plan documented (this file)

### Credentials Safety
- ✅ Never commit `.env` or real keys to git
- ✅ `.env*` is gitignored except `.env.example`
- ✅ Use Vercel dashboard or `vercel env` CLI to manage secrets
- ✅ Never copy production env vars to local `.env`
- ✅ Rotate credentials periodically (Stripe, PayPal, Resend API keys)

---

## 11. What to Backup Regularly

### Required Backups
1. **Database**: Automated by hosting (Neon auto-backs up)
   - Check: Neon project → Branches → Backup
2. **Product images** in `public/products/` → Already in git
3. **Customer data** → Lives in database only (no separate export needed)
4. **Environment variables** → Note them down or store in secure vault
5. **Vercel deployment history** → Check Vercel deployments dashboard

### Nice-to-Have Backups
- Entire database export: `pg_dump` monthly
- Analytics data export (before deletion from analytics provider)
- Email templates & campaign data (if using external email service)

---

## 12. Disaster Recovery Checklist

If production goes down:

- [ ] Check Vercel status page
- [ ] Check database status (Neon console)
- [ ] Review recent deployments (Vercel dashboard)
- [ ] Check error logs (`/api/health`)
- [ ] Inspect Sentry for errors (if enabled)
- [ ] Review recent git commits — was something deployed that breaks?
- [ ] Rollback last deployment if recent code looks suspicious
- [ ] Contact hosting providers (Neon, Vercel, Stripe) if infrastructure issue
- [ ] Restore from database backup if data corruption
- [ ] Post-incident: Review logs, update runbooks, add monitoring

---

## Key Files for Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Development guidelines (read before coding) |
| `AGENTS.md` | Next.js 16 API differences & deprecations |
| `.env.example` | Environment variable reference |
| `prisma/schema.prisma` | Database schema |
| `prisma/migrations/` | All applied migrations |
| `vercel.json` | Vercel config (crons, redirects, etc.) |
| `next.config.ts` | Next.js config (images, headers, etc.) |
| `scripts/murano-manifest.json` | Product catalog data |
| `src/proxy.ts` | Auth middleware & request gate |
| `src/auth.ts` | Auth.js configuration |
| `src/lib/store-settings.ts` | StoreSettings cache & fallback logic |

---

## Deployment Summary

**Production URL:** https://perlamuranoglass.com  
**Hosting:** Vercel  
**Database:** PostgreSQL (Neon)  
**Branch:** main (auto-deploys)  
**Last commit:** 0e2220b  
**Migrations:** 20 (all applied)  
**Status:** ✅ Safe to backup, ready for staging/dev setup

