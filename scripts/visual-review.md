# Review template screenshots

Start `npm run dev`, wait for Ready, then run in a separate terminal:

```sh
npm run visual:review -- --url http://127.0.0.1:3000
```

Private local admin source must be available. If Chromium is missing:

```sh
npm exec --yes --package=playwright -- playwright install chromium
```

The script captures individual templates, saved designs, Looks and article openings at desktop (1440 px) and phone (390 px) widths. It does not save storefront changes. Store requests other than GET/HEAD are blocked after optional sign-in.

## Useful options

- `--section article/head`: capture one section.
- `--url http://127.0.0.1:3001`: use another server address.
- `--login`: sign in when the environment requires it; local admin does not.
- `--headed`: show the browser.

## Check the result

Open `reports/visual-review/<timestamp>/index.html`. The gallery and `manifest.json` show screenshots, broken images, overflow and failures. Inspect the images; a successful script exit is not a visual approval.

Reports, screenshots and the browser profile are ignored by Git. If the browser cannot launch in a sandbox, capture from a normal terminal. If navigation times out, check that the server is ready and responsive.
