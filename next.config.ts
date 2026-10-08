import type { NextConfig } from "next";
import { imageRemotePatterns } from "./src/lib/image-hosts";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { privatePaths } from "./scripts/private-paths.mjs";

const isProd = process.env.NODE_ENV === "production";
const localAuth = resolve(process.cwd(), ".local-only/src/auth.ts");
const localAccounts = !isProd && existsSync(localAuth);
if (isProd && privatePaths.some((path) => existsSync(resolve(process.cwd(), path)))) {
  throw new Error(
    "Private local routes are present. Use npm run build to exclude them before compiling production."
  );
}

const nextConfig: NextConfig = {
  // Prevent the response adapter from changing preserved 127.0.0.1 rewrite
  // targets back to localhost and turning them into external requests.
  skipProxyUrlNormalize: true,
  env: { NEXT_PUBLIC_LOCAL_ACCOUNTS: String(localAccounts) },
  typescript: {
    // Next resolves TypeScript paths before webpack aliases. Keep the exact
    // local mappings in the private tsconfig so both bundlers select them.
    tsconfigPath: localAccounts ? ".local-only/tsconfig.json" : "tsconfig.json",
  },
  images: {
    // An allowlist, not `**`: see src/lib/image-hosts.ts for why, and for how
    // to add another host.
    remotePatterns: imageRemotePatterns(),
    // WebP is Next's default; AVIF is opt-in (costs more CPU to encode) but
    // is smaller at equivalent quality. Next tries formats in this order and
    // serves whichever the requesting browser's Accept header supports.
    formats: ["image/avif", "image/webp"],
    // Next 16 requires every quality a caller uses to be allowlisted here,
    // otherwise it logs a warning and falls back to the default. The app uses
    // 70 (carousel thumbs) and 90 (catalog/hero), plus 75 as the default, and
    // 95 for the small nav-dropdown thumbnails, which are scaled *up* on
    // retina and would look soft at 90.
    qualities: [70, 75, 90, 95],
  },
  // Renamed images keep working at their old addresses (search engines may
  // have indexed them).
  async redirects() {
    return [
      {
        source: "/hero/perla-viola-murano.jpg",
        destination: "/hero/handmade-red-murano-glass-necklace.jpg",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Baseline headers for every response, including API routes (proxy.ts
        // sets these too, plus a per-request nonce-based CSP, for page routes).
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
