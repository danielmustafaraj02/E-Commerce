# Perla Murano Glass

Online shop for Murano glass jewelry, with an 11-language storefront and a local administration area.

## Start here

| You need to…                          | Read                                          |
| ------------------------------------- | --------------------------------------------- |
| Run the shop, manage photos or deploy | [Local development](LOCAL-DEVELOPMENT.md)     |
| Understand the code                   | [Architecture](ARCHITECTURE.md)               |
| Keep the brand consistent             | [Product](PRODUCT.md) and [Design](DESIGN.md) |
| See what still needs doing            | [Roadmap](docs/implementation-roadmap.md)     |
| Change the site's look                | [Builder](docs/builder-architecture.md)       |
| Check speed                           | [Performance](docs/performance-baseline.md)   |

## Run locally

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in the required settings. Use a development database and test payment keys for testing.
3. Run `npm run dev` and open the address printed by Next, normally `http://127.0.0.1:3000`.

Admin and account files are private local source. A public clone runs the guest storefront but cannot recreate those files.

## Check changes

```sh
npm test
npm run lint
npm run typecheck
```

`npm run build` prepares the public storefront and applies database migrations, except on Vercel previews by default. Check the target database before running it. See [deployment instructions](LOCAL-DEVELOPMENT.md#deploy).

## Documentation rules

Keep each subject in one guide. Add actionable work to the roadmap; remove it when complete. Record the date and method beside measurements. Keep credentials, customer data and detailed security findings in ignored local files.

Older audits and the 500-item idea list were archived under ignored `originals/documentation/`. They are historical evidence, not the current task list. Agent instructions remain in `AGENTS.md` and `CLAUDE.md`.
