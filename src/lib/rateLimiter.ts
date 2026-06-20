/**
 * Simple in-memory token-bucket rate limiter.
 *
 * Each key owns a bucket that holds up to `capacity` tokens and refills one
 * token every `refillMs`. A request spends one token; it is allowed when a
 * whole token is available and rejected otherwise. This permits short bursts
 * (up to `capacity` back-to-back requests) while bounding the sustained rate to
 * one request per `refillMs` — strictly more flexible than the previous
 * fixed-window "one request per window" guard, which is just the `capacity = 1`
 * case of this bucket.
 *
 * Limitations (by design — this is a single-instance guard, not a distributed
 * limiter): state lives in process memory, so it resets on restart and is not
 * shared across serverless instances or replicas. For multi-instance
 * enforcement, back this with a shared store (e.g. Redis) keyed on an
 * authenticated identity. Stale (fully-refilled) buckets are evicted on access
 * and the map is capped to bound memory, preventing unbounded growth from
 * unique keys.
 */
interface Bucket {
  /** Current token count; fractional between whole-token refills. */
  tokens: number;
  /** Timestamp (ms) the token count was last brought up to date. */
  updated: number;
}

const store = new Map<string, Bucket>();

/** Hard cap on tracked keys; oldest entries are pruned past this. */
const MAX_KEYS = 10_000;

/**
 * Remove buckets that have fully refilled (so re-creating them is equivalent to
 * keeping them), then enforce {@link MAX_KEYS}.
 */
function evictStale(now: number, refillMs: number, capacity: number): void {
  for (const [key, bucket] of store) {
    const refilled = bucket.tokens + (now - bucket.updated) / refillMs;
    if (refilled >= capacity) store.delete(key);
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
 * Pure token-bucket arithmetic: refill for elapsed time and attempt to spend one
 * token. No store access and no side effects, so it is trivially unit-testable in
 * isolation. Returns the next bucket state and whether the request is allowed.
 * @param bucket - the caller's current bucket state
 * @param now - current time in ms
 * @param refillMs - time to regenerate one token, in ms
 * @param capacity - bucket size (maximum burst)
 */
function consumeToken(
  bucket: Bucket,
  now: number,
  refillMs: number,
  capacity: number
): { bucket: Bucket; allowed: boolean } {
  // Refill for elapsed time, capped at capacity.
  const tokens = Math.min(capacity, bucket.tokens + (now - bucket.updated) / refillMs);
  if (tokens < 1) return { bucket: { tokens, updated: now }, allowed: false };
  return { bucket: { tokens: tokens - 1, updated: now }, allowed: true };
}

/**
 * Check and record a request against the rate limit. Orchestrates store I/O and
 * map maintenance around the pure {@link consumeToken} decision.
 * @param key - identifier for the caller (e.g. `"tip:<ip>"`)
 * @param refillMs - time to regenerate one token, in ms (the sustained spacing)
 * @param capacity - bucket size, i.e. the maximum burst of back-to-back
 *   requests; defaults to `1`, which reproduces the old fixed-window behaviour
 * @returns `true` if the request is allowed, `false` if it is rate-limited
 */
export function checkRateLimit(key: string, refillMs = 3000, capacity = 1): boolean {
  const now = Date.now();
  // A fresh caller starts with a full bucket.
  const current = store.get(key) ?? { tokens: capacity, updated: now };

  const { bucket, allowed } = consumeToken(current, now, refillMs, capacity);
  store.set(key, bucket);
  if (allowed) evictStale(now, refillMs, capacity);
  return allowed;
}
