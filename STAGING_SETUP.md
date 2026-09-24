# Staging Environment Setup Guide

**Created:** 2026-09-24  
**Purpose:** Create an isolated staging/development environment separate from production  
**Production Backup:** BACKUP_STATE_2026-09-24.md (committed at git `8df16b4`)

---

## Overview

This guide provides three approaches to create a safe staging environment where you can test changes before deploying to production (https://perlamuranoglass.com). All methods keep production untouched.

---

## Option A: Vercel Preview Deployment (Fastest, Recommended for Testing)

### ⚠️ WARNING: Preview Uses Live Database
Vercel preview deployments automatically use your **live production database** unless you explicitly enable database migrations for previews. This is safe for **read-only testing** but dangerous for **writing test data**.

### Setup Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   vercel login  # Authenticate with your Vercel account
   ```

2. **Create a feature branch** (changes are NOT immediately deployed):
   ```bash
   git checkout -b feature/staging-test
   # Make your code changes here
   git push origin feature/staging-test
   ```

3. **Vercel auto-creates a preview URL**
   - Once pushed, Vercel dashboard shows a preview deployment
   - URL pattern: `https://<branch-name>-<project>.vercel.app`
   - Preview automatically deploys on every push to the branch

4. **Test in preview** (read-only, don't modify production data!)
   - Browse the storefront
   - Test UI changes, checkout flow (but don't finalize payments)
   - Check for console errors (Vercel dashboard → Logs → Runtime)

5. **When ready, merge to main**:
   ```bash
   git pull origin main
   git merge feature/staging-test
   git push origin main
   ```
   - Vercel automatically deploys to production (https://perlamuranoglass.com)
   - Migrations run against live database

### Verify Rollback After Preview Test
If you found an issue in preview:
- Simply **don't merge** the feature branch
- Or revert the merge commit if already merged
- Vercel will keep the preview running (useful for debugging)

---

## Option B: Local Development Database (Full Control)

### Setup Steps

1. **Create a local or remote development database**

   **Option B1: Local PostgreSQL** (requires local Postgres 14+)
   ```bash
   # Start local Postgres (adjust for your setup)
   # macOS with Homebrew:
   brew services start postgresql
   
   # Or use Docker:
   docker run -d \
     --name postgres-dev \
     -e POSTGRES_PASSWORD=devpass \
     -e POSTGRES_DB=ecommerce_dev \
     -p 5432:5432 \
     postgres:16
   ```

   **Option B2: Remote Development Database** (Neon, Supabase, or Railway)
   ```bash
   # Create a new project in Neon console (neon.tech)
   # Copy the connection string
   # Looks like: postgresql://user:password@host.neon.tech:5432/dbname
   ```

2. **Create a local `.env.local` file** (Git-ignored):
   ```bash
   cp .env.example .env.local
   
   # Edit .env.local:
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_dev"
   
   # Use TEST keys for integrations:
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_test_..."
   PAYPAL_ENV="sandbox"  # Use sandbox, not live
   
   # Keep others for local testing:
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_SECRET="$(npx auth secret)"  # Generate a new one for dev
   RESEND_API_KEY="re_test_..."
   UPSTASH_REDIS_REST_URL="..."  # Leave empty to use in-memory fallback
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

3. **Apply migrations to dev database**:
   ```bash
   npm run db:migrate  # Applies all pending migrations
   ```

4. **Seed baseline data**:
   ```bash
   SEED_ADMIN_PASSWORD="TestAdmin123!" npm run db:seed
   # Creates admin account: admin@demo-store.example / TestAdmin123!
   ```

5. **Import products**:
   ```bash
   npx tsx scripts/seed-murano-catalog.ts
   # Imports from scripts/murano-manifest.json
   ```

6. **Start dev server**:
   ```bash
   npm run dev
   # Opens http://localhost:3000
   ```

### Test Scenarios (Local)
- ✅ Create test products
- ✅ Test checkout (with Stripe test card: 4242 4242 4242 4242)
- ✅ Create orders
- ✅ Test admin features
- ✅ Verify email templates (Resend in test mode)
- ✅ Try multi-language features
- ✅ Test database migrations

### Cleanup
```bash
# Keep the dev database for repeated testing, OR
# Drop it when done:
dropdb ecommerce_dev  # Local only
# Neon: Delete the branch in Neon console
```

### Verify Rollback (Local)
- Local database changes don't affect production
- Simply `rm` the local DB and recreate it anytime
- No production impact whatsoever

---

## Option C: Vercel Staging Project (Full Isolation)

### Setup Steps

1. **Create a second Vercel project** (same repo, separate environment):
   ```bash
   vercel project add --name ecommerce-staging
   # This creates a separate Vercel project for staging
   ```

2. **Create a `staging` branch**:
   ```bash
   git checkout -b staging
   git push origin staging  # Don't merge to main
   ```

3. **Configure staging project to deploy from `staging` branch**:
   - Go to Vercel dashboard
   - Select the new `ecommerce-staging` project
   - Settings → Git → Production Branch
   - Change from `main` to `staging`

4. **Create staging database** (separate from production):
   - **Option C1: Separate Neon project**
     - Create new project in Neon console
     - Copy the connection string
   
   - **Option C2: Database branch** (Neon-only feature)
     - In Neon console → Branches
     - Create a branch from production
     - Gets a copy of production data (snapshot in time)

5. **Set staging environment variables**:
   - Vercel dashboard → `ecommerce-staging` project → Settings → Environment Variables
   - Set all variables (same structure as production, but with different credentials)
   ```
   DATABASE_URL="neon://staging-database-url"
   STRIPE_SECRET_KEY="sk_test_..."  (test keys!)
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   NEXTAUTH_URL="https://ecommerce-staging.vercel.app"
   # ... copy all other vars, but use test credentials
   ```

6. **Deploy staging**:
   ```bash
   git checkout staging
   # Make a test commit (e.g., update a product name)
   git commit -am "Test: Change product name in staging"
   git push origin staging
   # Vercel automatically deploys to ecommerce-staging.vercel.app
   ```

7. **Test staging**:
   - Visit https://ecommerce-staging.vercel.app
   - Test checkout (uses test Stripe keys)
   - Create test orders
   - Verify emails send to staging Resend account
   - Full freedom to test without affecting production

### Promote from Staging to Production
```bash
# After testing in staging:
git checkout main
git merge staging  # Merge staging changes into main
git push origin main
# Vercel auto-deploys to production (LIVE!)
# Migrations run against production database
```

### Verify Rollback (Staging Project)
- Staging and production are completely separate Vercel projects
- Rollback production by promoting a previous production deployment (Option A rollback)
- Staging remains unaffected
- You can keep staging running indefinitely for ongoing tests

---

## Comparison Table

| Feature | Preview | Local Dev | Staging Project |
|---------|---------|-----------|-----------------|
| **Database** | Live production | Local or remote dev DB | Separate staging DB |
| **Setup time** | ~5 min | ~30 min | ~20 min |
| **Cost** | Free (included) | Free (local) or ~$5/mo | +$5-10/mo (Vercel + DB) |
| **Test data safety** | ⚠️ Production DB | ✅ Isolated | ✅ Isolated |
| **Full control** | Code only | Code + DB + all configs | Code + DB + all configs |
| **Testing payments** | No (live keys) | Yes (test keys) | Yes (test keys) |
| **Rollback ease** | ✅ Don't merge | ✅ Delete local DB | ✅ Separate projects |
| **Production impact** | None (preview only) | None (local) | None (separate project) |

---

## Recommended Workflow

1. **For quick UI/content testing**: Use **Vercel Preview** (Option A)
   - Fast, no setup, automatic
   - Don't write test data (production DB)

2. **For payment/checkout testing**: Use **Local Dev** (Option B)
   - Full control, test cards work, no cost
   - Test emails, orders, admin features

3. **For pre-launch testing**: Use **Staging Project** (Option C)
   - Matches production setup exactly
   - Can test migrations before going live
   - Isolated database backup

4. **Before each main deployment**:
   ```bash
   # Test locally or in staging
   git checkout feature/my-change
   npm test
   npm run typecheck
   npm run db:migrate --dry-run  (if schema changed)
   
   # Then in preview or staging
   git push origin feature/my-change
   # Visit preview URL, test thoroughly
   
   # Finally, merge to main
   git checkout main
   git merge feature/my-change
   git push origin main
   # Vercel deploys to production automatically
   ```

---

## Rollback Readiness Checklist

### Before Creating Staging Environment
- ✅ Backup committed: `BACKUP_STATE_2026-09-24.md` (git `8df16b4`)
- ✅ Production database backed up (automatic via Neon)
- ✅ Recent deployments documented
- ✅ Rollback procedures documented (BACKUP_STATE_2026-09-24.md § 8)

### If You Need to Rollback Production
1. **Go to Vercel dashboard**
2. **Deployments tab**
3. **Find last known-good deployment**
4. **Click "Promote to Production"**
5. **Confirm — code and DB revert**

⚠️ **Important**: Rollback reverts migrations too. If a previous deployment added DB columns, rolling back deletes them. Review the migration history before rolling back.

### If Staging Setup Goes Wrong
- **Staging preview?** Just don't merge the branch. No production impact.
- **Staging project?** Delete the Vercel project (Settings → Delete Project). No production impact.
- **Local database?** Drop it and recreate. No production impact.

---

## Next Steps

### Choose Your Staging Approach
- [ ] Option A (Preview) — Simplest, code testing only
- [ ] Option B (Local) — Full control, payment testing
- [ ] Option C (Staging Project) — Production-like, pre-launch testing

### Set It Up
1. Follow the steps above for your chosen option
2. Make a small test change (e.g., update homepage text)
3. Deploy to staging
4. Verify it works
5. Verify rollback is possible (don't merge, or revert)

### Backup Verification
```bash
# Confirm backup commit exists:
git log --oneline | head -5
# Should show: 8df16b4 Backup: Document current production state...

# View the backup:
cat BACKUP_STATE_2026-09-24.md
```

---

## Troubleshooting

### "Vercel preview uses production database — can I test with test data?"
Yes, but in isolated staging project (Option C) or local database (Option B). Preview is read-only safe.

### "Can I roll back a staging deployment?"
Yes, within Vercel (same as production). Or just push a revert commit to your staging branch.

### "What if staging DB and production DB get out of sync?"
Create a fresh staging DB branch (Neon feature), or rebuild local dev DB from migrations.

### "How do I test migrations before production?"
1. Local dev: `npm run db:migrate` applies migrations to dev DB first
2. Or staging project: Deploy to staging (migrations apply there first)
3. After successful staging test, merge to main → migrations run on production

---

## Security Notes

- 🔒 **Never commit `.env`** — it's gitignored
- 🔒 **Use test Stripe keys in staging** — never use production keys in non-prod
- 🔒 **Staging env vars in Vercel dashboard** — not in git
- 🔒 **Don't copy production DATABASE_URL to staging** — create separate staging DB
- 🔒 **Rotate credentials periodically** (Stripe, PayPal, API keys)

