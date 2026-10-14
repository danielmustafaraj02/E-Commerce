# Local development

## Start the shop

```sh
npm run dev
```

Open the address printed by Next, normally `http://127.0.0.1:3000`. Use `npm run dev:turbo` for Turbopack development.

Private admin and account routes are restored automatically from `.local-only/`. Local admin access needs private source, an existing admin record and a loopback address. A public clone has no private admin source. Back up private files separately: Git does not contain them.

The database comes from your environment settings. Local admin changes can affect live data if you use the production connection. Use a separate development database for testing.

## Photos

JPG/PNG photos convert to WebP at startup, while the dev server runs, and before builds. This covers nested folders under `public/products`, `public/hero`, `public/about`, `public/blog`, `public/gift-card` and `public/decor`. Restart the dev server after changing the runner.

Conversion preserves transparency, removes metadata and limits the longest edge to 2560 pixels. Originals stay available. Run `npm run images:webp` to archive them in ignored `originals/public/`. Root logos and the social preview stay PNG. Hosted image URLs are outside this folder converter.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npx tsc --noEmit -p .local-only/tsconfig.json
```

The last command checks private source too. For template screenshots, see [visual review](scripts/visual-review.md).

## Deploy

1. Commit the complete change, including any new `prisma/migrations/` files.
2. Push to the linked `main` branch. Vercel builds it when the integration and account are available.
3. Check deployment success and the public storefront.

`npm run build` first moves private routes into `.local-only/`, converts photos, then runs database migrations and compiles. The postbuild check rejects private routes and private files. Public checkout is guest-only; admin and account sign-in are not deployed. Run `npm run dev` to restore private routes afterwards.

Vercel previews skip migrations unless `MIGRATE_PREVIEWS=1`. Previews that share production data may fail when new code requires unapplied columns. Use a separate preview database before enabling preview migrations.

If admin reports a missing database column, check the database and pending migrations before running `npx prisma migrate deploy`. Never commit `.env*` secrets, dumps or customer data.

## Private source maintenance

- `npm run local:untrack`: stages removal of old tracked private files while preserving their local copies. Use only when those files are still tracked.
- `npm run local:isolate`: imports private source into local storage; it refuses duplicate copies and unmanaged symlinks.

Neither command removes sensitive data from old Git commits.
