# Template screenshot review

Start `npm run dev` in a separate terminal, wait for Ready, and open `http://localhost:3000/admin/settings/page-layout` before capturing. Run capture from a normal terminal while the store is running. The Codex sandbox currently cannot launch Chromium (`Operation not permitted`), so screenshots must first be captured outside that restriction.

```sh
npm run visual:review -- --url http://127.0.0.1:3000
```

The browser reads the local admin Page layout controls to select designs, then renders **one template at a time** in a separate capture page at `/api/admin/template-capture`. Only the template is photographed: no admin navigation, editor controls, frame borders, selection handles or page header/footer. The command captures:

- Every section's ten designs with the actual page's content and colours, including custom sections.
- Desktop (1440 px) and mobile (390 px) PNGs of each template.
- Existing section templates and saved templates, captured once each.
- All native Looks compositions.
- All eight native article openings, including the blended headline.

It never clicks Save or submits a store form. Requests other than GET/HEAD are blocked during capture (after optional sign-in). Existing template choices and article opening selections change only the isolated browser's draft; the storefront is not changed.

If the app runs elsewhere:

```sh
npm run visual:review -- --login --url http://localhost:3001
```

If the Playwright browser needs installing:

```sh
npm exec --yes --package=playwright -- playwright install chromium
```

Local capture does not need `--login`. That option remains available for an authenticated environment. To inspect a targeted fix quickly:

```sh
npm run visual:review -- --section article/head
```

A report and `manifest.json` are now created before the browser starts. The terminal and report show whether capture is waiting for login, discovering sections, or rendering templates. If it stops before the first screenshot, the report records the failure instead of leaving an empty folder.

The template-only screenshots and filterable `index.html` gallery are written to `reports/visual-review/<timestamp>/`. `manifest.json` records each capture, detected broken images, horizontal overflow and failures. The browser waits for the exact current preview document, fonts and image decoding before capture. Failed captures stay visible in the gallery rather than being reported as reviewed.

Preview snapshots exclude executable scripts and editing overlays before replay so Next hydration cannot restart in the capture page. Images load eagerly, fonts finish loading, and the template element itself is cropped to its rendered height. Native Looks use the same independent renderer, so the admin sidebar cannot reduce the recorded desktop canvas width. If either browser page closes, capture stops and marks the report failed immediately; it does not continue recording failures for sections it could no longer inspect.

The local browser profile stays in `reports/visual-review/profile/`; the existing `/reports/` ignore rule excludes both the profile and screenshots from Git.

Once captured, Codex can inspect the PNGs with its image viewer, compare desktop and mobile compositions, and fix specific visual problems. Repeat the capture after those fixes; a successful script exit alone does not mean the screenshots have been visually reviewed.

Implementation references: [Playwright screenshots](https://playwright.dev/docs/screenshots), [authenticated browser state](https://playwright.dev/docs/auth).

Navigation allows 60 seconds for the first development compilation. A navigation timeout is an app startup or response problem; it does not mean Chromium is missing. Restart `npm run dev` after changing the local-only route setup. The local routes use real files because Next development does not discover the previous route-directory symlinks.
