# Local administration and public storefront

Admin, customer accounts, sign-in, registration, password recovery and their API routes are local-only: they live in ignored source paths during development and move into `.local-only/` before public builds. Keep a private backup of these files; a public clone intentionally cannot recreate it. Local admin access uses an existing admin record for audit ownership, with no login or MFA prompt on the loopback development server. Customer authentication remains available locally. No customer records are deleted.

`npm run dev` (or `npm run dev:turbo`) restores real local route files automatically. Open `/admin` directly; no login is needed on localhost. A clone without `.local-only/` runs the guest storefront without local account links.

Use the address printed by Next, normally `http://127.0.0.1:3000`. Proxy preserves the incoming loopback hostname, and `skipProxyUrlNormalize` prevents Next's response adapter from changing a rewrite to `localhost`. This keeps translated paths such as `/en/login` as internal rewrites instead of creating a redirect loop. Restart the dev server after changing this configuration.

`npm run build` moves those files into ignored private storage before compiling. The public authentication implementation always returns no session, so guest checkout and browser wishlists remain available without exposing customer or staff sign-in. Account links and sign-in prompts are omitted. The postbuild check rejects private routes and private files in deployment traces. Both production and preview deployments use this public build. Direct production builds with local routes still present fail with an instruction to use `npm run build`.

After this separation is first installed, run:

```sh
npm run local:untrack
```

This stages removal of the old private files from Git without deleting the local originals. It moves private files into storage, verifies every tracked file is preserved, stages their Git removal, then restores the real local files. Commit those removals together with the public code and configuration changes. `.gitignore` excludes private storage and local source paths; `.vercelignore` excludes them from CLI uploads. Ignoring files alone does not remove previously tracked files.

These changes do not erase private source from earlier Git commits. They exclude it from future pushes after the removal commit. No repository history is rewritten.

Use `npm run local:isolate` only when importing a new private source directory into this workspace. It moves private files into storage and refuses to overwrite duplicate copies or alter unrelated symlinks.

After a public build, `npm run dev` restores the local pages for continued administration and template screenshot review:

```sh
npm run visual:review -- --login
```

The no-login admin implementation is stored in `.local-only/src/admin-session.ts`, excluded from Git and deployment uploads. Its public module is an inert stub. Development uses the ignored `.local-only/tsconfig.json` to map the session and sign-in modules to their private implementations; production uses the public `tsconfig.json`. Admin access without credentials is enabled only in development with private source present and a loopback Host (`localhost`, `127.0.0.1`, or `::1`). Public builds still reject private route files before compilation and have no local session implementation.

## Deploying

Vercel builds every push to `main`; there is no other step. The build (`npm run build`) applies pending Prisma migrations to the production database first, then compiles the public storefront and fails if any admin or account file got into it.

1. Commit everything the change needs, including new files under `prisma/migrations/`. A migration left uncommitted deploys code that expects database columns that don't exist yet.
2. `git push`.

Orders, customers and everything else in `/admin` are read from the live database, so the local admin shows the same orders as the production site once its migrations are applied. If an admin page errors with "column ... does not exist", run `npx prisma migrate deploy` (it targets the database in `.env.local`) or push, and let the build apply it.

Never commit database dumps, `.env*` files or internal reports; `.gitignore` excludes them.
