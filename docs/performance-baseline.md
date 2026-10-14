# Performance notes

These are historical local measurements, not current live-site results. Repeat them after deployment with the real catalog.

## Measurements worth keeping

| Date and method                                                                                                                                                   | Result                                                                             | Limit                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 11 Oct 2026: local production build, seeded catalog, cold browser, median of two runs; mobile at 412×823, 4× CPU slowdown, 150 ms latency and 1.6 Mbit/s download | Mobile LCP: home 3.59 s, product 3.35 s, article 4.91 s; product desktop CLS 0.276 | Demo content; measured before later refactoring           |
| 13 Oct 2026: before/after Next build client entry files plus shared root files, gzip                                                                              | Home JS 322.0 → 211.9 kB; product JS 336.8 → 226.9 kB                              | Bundle bytes, not a measured speed or revenue improvement |

Recent work separated browser helpers from validation code and loaded editor preview code only when needed. Bundled product photos are WebP, with automatic conversion for new JPG/PNG photos in the supported folders.

## Next measurement

Measure home, product, category, article, cart and checkout with real catalog data and the same mobile profile. Record commit, environment and test settings. Inspect layout shifts, fonts, image loading and transferred CSS/JS. Use real interaction data for INP.

Targets: **LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms**. Do not present historical bundle savings as proof these targets are met.

Prioritized work is in the [roadmap](implementation-roadmap.md). Detailed old measurements are archived under local `originals/documentation/`.
