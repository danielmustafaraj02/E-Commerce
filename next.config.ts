import type { NextConfig } from "next";
import { imageRemotePatterns } from "./src/lib/image-hosts";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    // An allowlist, not `**`: see src/lib/image-hosts.ts for why, and for how
    // to add another host.
    remotePatterns: imageRemotePatterns(),
    // WebP is Next's default; AVIF is opt-in (costs more CPU to encode) but
    // is smaller at equivalent quality. Next tries formats in this order and
    // serves whichever the requesting browser's Accept header supports.
    formats: ["image/avif", "image/webp"],
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
