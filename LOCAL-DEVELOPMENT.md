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
