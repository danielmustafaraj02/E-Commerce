# Performance baseline

Measured 11 October 2026 before any phase-1 storefront change. **The live site
could not be measured**: it answers HTTP 402 (`DEPLOYMENT_DISABLED`) from
Vercel. These numbers come from a local production build, so they show what the
code costs, not what visitors on Vercel's CDN get.

## Method

- Production build of exactly what a push contains (`git ls-files`, `npm ci`,
  `npm run build`), served with `next start` on the same machine.
- Data: the **local seed database** (demo products such as "Ceramic coffee
  mug"), not the real catalogue. Image and LCP figures depend on that data.
- Chrome via Playwright, new browser context per run (cold cache), median of 2
  runs. LCP and CLS from `PerformanceObserver`; bytes are transfer sizes
  (gzip/brotli as served).
- **Desktop:** 1350×940, no throttling. **Mobile:** 412×823, DPR 2.6, 4× CPU
  slowdown, 150 ms latency, 1.6 Mbit/s down (close to Lighthouse's mobile
  profile).

## Results

| Page | Profile | TTFB | FCP | LCP | CLS | JS | CSS | Fonts | Images |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Home | desktop | 402 ms | 1.25 s | 1.66 s | 0 | 287 KB | 76 KB | 203 KB | 28 KB (+1.25 MB film) |
| Home | mobile | 152 ms | 2.18 s | **3.59 s** | 0 | 287 KB | 76 KB | 203 KB | 46 KB |
| All products | desktop | 129 ms | 0.83 s | 1.29 s | 0 | 294 KB | 78 KB | 203 KB | 16 KB |
| All products | mobile | 116 ms | 2.27 s | 2.27 s | 0 | 294 KB | 78 KB | 203 KB | 30 KB |
| Product | desktop | 174 ms | 0.98 s | 1.16 s | **0.276** | 302 KB | 77 KB | 203 KB | 26 KB |
| Product | mobile | 137 ms | 2.19 s | **3.35 s** | 0 | 302 KB | 77 KB | 203 KB | 44 KB |
| Category | desktop | 149 ms | 0.91 s | 0.91 s | 0 | 294 KB | 78 KB | 203 KB | 16 KB |
| Category | mobile | 138 ms | 2.17 s | 2.17 s | 0 | 294 KB | 78 KB | 203 KB | 29 KB |
| Journal article | desktop | 121 ms | 0.74 s | 2.11 s | 0 | 284 KB | 80 KB | 203 KB | 87 KB |
| Journal article | mobile | 137 ms | 2.21 s | **4.91 s** | 0 | 284 KB | 80 KB | 203 KB | 126 KB |
| Cart | desktop | 86 ms | 0.90 s | 0.93 s | 0 | 169 KB | 60 KB | 203 KB | 15 KB |
| Cart | mobile | 84 ms | 2.01 s | 2.65 s | 0 | 169 KB | 60 KB | 203 KB | 28 KB |

Targets: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (INP needs real interactions; not
measured).

## What it says

1. **Mobile LCP misses the target** on home (3.6 s), product (3.4 s) and
   articles (4.9 s). FCP alone is ~2.2 s on mobile: render-blocking CSS
   (~80 KB) and JavaScript (~290 KB) on every page dominate before any image.
2. **Fonts: 203 KB on every page.** Several bundled faces plus the admin-chosen
   Google pairing, which also costs two extra connections to Google (and sends
   visitors' IP addresses to Google, a GDPR concern in the EU).
3. **CLS 0.276 on the product page (desktop)** — above the 0.1 limit; the
   gallery or buy box shifts after load.
4. Images are already efficient where `next/image` is used (16–126 KB per
   page). The bundled photo sources were cut from 115 MB to 18 MB (WebP) this
   session.
5. The home film (1.25 MB) loads on desktop only; it is already efficiently
   encoded (re-encoding saved 11% at visible cost, so it was left alone).

## Highest-value improvements, in order

1. Find and fix the product page layout shift (reserve the gallery/buy-box
   space).
2. Self-host the chosen font pairing (same-origin, cached, no Google request)
   and drop unused bundled weights; preload only the LCP face.
3. Cut shared JavaScript: audit the client components every page loads
   (header, cart store, analytics, carousels) and lazy-load what is below the
   fold.
4. Split the two ~145 KB stylesheets (`home.css`, `shop.css`) by route, so a
   product page doesn't download the home page's styles.
5. Article LCP: the hero image should be `preload`ed with correct `sizes`.

Re-measure with the same method after each change, and on the live site once
Vercel serves it again (PageSpeed Insights / CrUX for field data).
