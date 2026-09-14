import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getStoreSettings } from "@/lib/store-settings";

// In-memory fixed-window limiter — fine for a single dev/small-prod
// instance, but resets on every redeploy and isn't shared across serverless
// instances. Used automatically when Upstash isn't configured.
const memoryHits = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryHits.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

// Cached by URL so a credential change in Admin > Settings > Integrations
// (or an env var change) creates a fresh client instead of reusing a stale
// one — same pattern as the Stripe client cache.
let cachedRedis: { url: string; client: Redis } | null = null;
const limiters = new Map<string, Ratelimit>();

async function getLimiter(limit: number, windowMs: number) {
  const settings = await getStoreSettings();
  const url = settings.upstashRedisUrl || process.env.UPSTASH_REDIS_REST_URL;
  const token = settings.upstashRedisToken || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (cachedRedis?.url !== url) {
    cachedRedis = { url, client: new Redis({ url, token }) };
    limiters.clear();
  }

  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: cachedRedis.client,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "ratelimit",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const limiter = await getLimiter(limit, windowMs);
  if (!limiter) return memoryRateLimit(key, limit, windowMs);

  const result = await limiter.limit(key);
  return { success: result.success, remaining: result.remaining };
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
