/**
 * Simple in-memory fixed-window rate limiter: at most one request per
 * `windowMs` per key.
 *
 * Limitations (by design — this is a single-instance guard, not a distributed
 * limiter): state lives in process memory, so it resets on restart and is not
 * shared across serverless instances or replicas. For multi-instance
 * enforcement, back this with a shared store (e.g. Redis) keyed on an
 * authenticated identity. Stale keys are evicted on access and the map is
 * capped to bound memory, preventing unbounded growth from unique keys.
 */
const store = new Map<string, number>();

/** Hard cap on tracked keys; oldest entries are pruned past this. */
const MAX_KEYS = 10_000;

/** Remove entries whose window has fully elapsed, then enforce {@link MAX_KEYS}. */
function evictStale(now: number, windowMs: number): void {
  for (const [key, last] of store) {
    if (now - last >= windowMs) store.delete(key);
  }
  if (store.size > MAX_KEYS) {
    // Map preserves insertion order; drop the oldest surplus keys.
    const surplus = store.size - MAX_KEYS;
    let removed = 0;
    for (const key of store.keys()) {
      if (removed++ >= surplus) break;
      store.delete(key);
    }
  }
}

/**
 * Check and record a request against the rate limit.
 * @param key - identifier for the caller (e.g. `"tip:<ip>"`)
 * @param windowMs - minimum spacing between allowed requests, in ms
 * @returns `true` if the request is allowed, `false` if it is rate-limited
 */
export function checkRateLimit(key: string, windowMs = 3000): boolean {
  const now = Date.now();
  const last = store.get(key);
  if (last !== undefined && now - last < windowMs) return false;
  evictStale(now, windowMs);
  store.set(key, now);
  return true;
}
