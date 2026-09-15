# Running the server locally

Quick path (see the main [README](../README.md#getting-started) for first-time setup with `.env`, migrations, and seeding):

```bash
npm install
npm run dev
```

Open http://localhost:3000. Uses **Turbopack** (Next.js 16's default dev bundler) — expect `✓ Ready in ~1–8s` in the terminal, then a short per-route "Compiling ..." on first visit to each page (Turbopack compiles routes lazily, on demand).

## Known issue: server prints "Ready" but the site never answers (Turbopack cache corruption)

**Symptom:** `npm run dev` prints `✓ Ready in ...` and looks healthy, but the process then crashes a moment later (or the very first request hangs/refuses), and the terminal shows something like:

```
thread 'tokio-rt-worker' panicked at turbopack/crates/turbo-tasks-backend/.../mod.rs:...:
Failed to restore data for task TaskId 1: ...
  1: Unable to open static sorted file referenced from 0000XXXX.meta
  2: failed to open file `.../.next/dev/cache/turbopack/.../0000XXXX.sst`: No such file or directory (os error 2)

FATAL: An unexpected Turbopack error occurred.
Error [TurbopackInternalError]: Failed to restore data for task TaskId 1
```

**Root cause:** Next.js 16 enables Turbopack's **persistent filesystem cache for dev** by default (`experimental.turbopackFileSystemCacheForDev`, on since v16.1.0 — this is new behavior vs. older Next.js versions and not something you'd know from training data). It stores incremental compile state as paired `.meta`/`.sst` files under `.next/dev/cache/turbopack/`. If that cache is left in an inconsistent state — the dev server was killed mid-write (`kill -9`, OOM, a crashed terminal, a laptop sleep during a save), or `.next` was partially copied/synced — a `.meta` file can end up pointing at an `.sst` file that's missing. Turbopack then panics trying to restore task `TaskId 1` on startup and the whole process dies, even though the initial "Ready" banner already printed.

**Fix — wipe the cache and restart:**

```bash
rm -rf .next
npm run dev
```

This was reproduced and confirmed as the actual cause of a "can't run locally" report on 2026-09-14: deleting `.next` immediately fixed it (clean `✓ Ready in 1376ms`, homepage/`/products`/`/api/health` all returned `200`, `/admin` correctly `307`-redirected to login). `.next` is git-ignored and fully disposable — it only holds build/dev cache, never source or data.

If it recurs often on this machine, two options:
- Always stop the dev server with `Ctrl+C` (not by closing the terminal window or killing the whole process group) so Turbopack gets to flush the cache cleanly.
- Disable the persistent dev cache entirely in `next.config.ts` if the recompiles-are-faster tradeoff isn't worth the occasional corruption:
  ```ts
  const nextConfig: NextConfig = {
    experimental: { turbopackFileSystemCacheForDev: false },
    // ...
  };
  ```

## Other things that block local startup (checklist)

1. **Missing `.env`** — copy it: `cp .env.example .env`. At minimum `DATABASE_URL` (a real Postgres connection string — see [DEPLOYMENT.md](./DEPLOYMENT.md#1-provision-a-production-database-postgres) for the fastest way to get one, `vercel integration add neon`), `AUTH_SECRET`, `NEXTAUTH_URL` must be set or auth/DB calls fail at request time (not at boot, so the server *looks* fine until you click something). Generate a secret with `npx auth secret`.
2. **No database / unapplied migrations** — tables don't exist yet in whatever Postgres `DATABASE_URL` points at: run `npm run db:migrate`, then `npm run db:seed` for the admin login + tax/shipping baseline data, and `npx tsx scripts/seed-murano-catalog.ts` to load the product catalog from the images already under `public/products/`.
3. **Port 3000 already in use** — a previous `next dev` is still running in another terminal/tab. Check with `ss -ltnp | grep 3000` or `lsof -i :3000`, then either kill the stale process or run `npm run dev -- -p 3001`.
4. **Slow-filesystem warning** (`⚠ Slow filesystem detected`) — harmless, just means `.next/dev` sits on a slower disk/mount than ideal; doesn't block startup, only makes cold compiles slower.
5. **Stale Prisma client after a schema change** — if you edited `prisma/schema.prisma` and forgot to re-migrate, `npm run db:migrate` regenerates the client too (`postinstall` also runs `prisma generate`).

## Useful local commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `rm -rf .next && npm run dev` | Hard reset if the dev server is misbehaving (see above) |
| `npm run db:studio` | Prisma Studio — browse/edit the database in a UI |
| `npm run typecheck` | `tsc --noEmit` — catch type errors without a full build |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm test` / `npm run test:watch` | Vitest unit tests |
| `npm run build && npm start` | Run a real production build locally (closer to what Vercel runs than `dev`) |

See [QA_BROWSER_TESTING.md](./QA_BROWSER_TESTING.md) for actually exercising the running site in Firefox.
