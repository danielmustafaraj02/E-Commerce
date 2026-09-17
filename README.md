# E-Commerce — Murano glass jewelry store

A Next.js storefront and admin panel for selling Murano-glass jewelry
(bracelets, necklaces, earrings) — built on Postgres/Prisma, Stripe and
PayPal for payments, NextAuth (Auth.js v5) for auth, and deployed on Vercel.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Postgres via Prisma (Neon in production)
- **Auth**: NextAuth v5 — credentials + optional Google OAuth, optional TOTP MFA
- **Payments**: Stripe and PayPal
- **Email**: Resend
- **Bot protection**: Cloudflare Turnstile (optional)
- **Rate limiting**: Upstash Redis (falls back to in-memory if unset)
- **Error tracking**: Sentry (optional)
- **Hosting**: Vercel

## Getting started

```bash
npm install
cp .env.example .env   # fill in your own values — see comments in that file
npm run db:migrate
npm run db:seed                          # baseline data (tax/shipping rules, an admin account)
npx tsx scripts/seed-murano-catalog.ts   # sample product catalog from public/products/
npm run dev
```

Open http://localhost:3000. `npm run db:seed` creates a fixed admin login,
`admin@demo-store.example` / `ChangeMe123!` (see `prisma/seed.ts`) — change
that password immediately via **Account → Security** (or Admin → Settings
once logged in), and enable MFA while you're there.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` / `npm run typecheck` | Lint / type-check |
| `npm test` / `npm run test:watch` | Run the test suite once (Vitest) / in watch mode |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed baseline data |
| `npm run db:studio` | Prisma Studio (DB browser) |
| `npm run format` / `npm run format:check` | Prettier write / check-only |

## Deploying

Deployed on Vercel with a Postgres database (Neon works well via the Vercel
Marketplace: `vercel integration add neon`). After the database and
environment variables (see `.env.example`) are set:

```bash
npx prisma migrate deploy
```

against the production database whenever `prisma/schema.prisma` changes.
Several integrations (Stripe/PayPal, Resend, Turnstile, Upstash) are
optional at the env-var level and degrade gracefully when unset, but
checkout, transactional email, bot protection, and durable rate limiting
all depend on them being configured for a real, public launch.

`vercel.json` schedules a daily cron (`/api/cron/abandoned-orders`) that
emails a reminder for stale pending orders and then cancels/releases stock
for ones older still — set `CRON_SECRET` so Vercel's cron caller can
authenticate to it (see `.env.example`).

## Notes

- Product images aren't uploaded through the app — paste an already-hosted
  image URL (Admin → Products) from whatever host/CDN you use.
- "Murano glass" is descriptive of a material/style; the certified **Vetro
  Artistico® Murano** mark is a separate, protected designation that only
  applies to glass genuinely made in authorized Murano furnaces — don't
  imply certification in product copy unless that's actually true of your
  supply chain.
