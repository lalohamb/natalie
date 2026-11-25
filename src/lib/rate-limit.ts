/*
 * Small in-memory request throttles, keyed by client IP. Good enough for a
 * single server instance; counters reset on restart. No framework imports, so
 * it can be used from Route Handlers, Server Actions and tests alike.
 */

/**
 * The client address as reported by the reverse proxy in front of the app.
 *
 * `X-Forwarded-For` is a list each proxy appends to, so only the entries added
 * by our own proxies can be trusted — the left-hand ones are whatever the
 * client sent. TRUSTED_PROXY_HOPS (default 1) is how many proxies sit in front
 * of the app; the address that many entries from the right is the client.
 *
 * With no proxy at all the header is fully client-controlled, so production
 * must run behind one that appends to (or overwrites) `X-Forwarded-For`.
 */
export function clientIp(headers: Headers) {
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
  const chain = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return chain[chain.length - hops] ?? chain[0] ?? "unknown";
}

/**
 * A fixed-window limiter: at most `limit` hits per key in each `windowMs`.
 * `hit(key)` records an attempt and returns whether it is allowed.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, { count: number; start: number }>();

  return {
    hit(key: string, now = Date.now()) {
      // Forget expired windows so the map can't grow without bound.
      if (windows.size > 5000) {
        for (const [k, w] of windows) if (now - w.start > windowMs) windows.delete(k);
      }
      const current = windows.get(key);
      if (!current || now - current.start > windowMs) {
        windows.set(key, { count: 1, start: now });
        return true;
      }
      current.count++;
      return current.count <= limit;
    },
  };
}
