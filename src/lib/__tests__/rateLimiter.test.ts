import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rateLimiter";

describe("checkRateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows first request", () => {
    expect(checkRateLimit("test_key_1", 3000)).toBe(true);
  });
  it("blocks second request within window", () => {
    checkRateLimit("test_key_2", 3000);
    expect(checkRateLimit("test_key_2", 3000)).toBe(false);
  });
  it("allows request after window expires", () => {
    checkRateLimit("test_key_3", 3000);
    vi.advanceTimersByTime(3001);
    expect(checkRateLimit("test_key_3", 3000)).toBe(true);
  });
  it("different keys are independent", () => {
    checkRateLimit("key_a", 3000);
    expect(checkRateLimit("key_b", 3000)).toBe(true);
  });
  it("given the window has elapsed, when other keys arrive, then stale entries are evicted and re-entry is allowed", () => {
    checkRateLimit("evict_target", 1000);
    vi.advanceTimersByTime(1001);
    for (let i = 0; i < 50; i++) checkRateLimit(`evict_other_${i}`, 1000);
    expect(checkRateLimit("evict_target", 1000)).toBe(true);
  });
  it("given thousands of unique keys, when recorded, then the limiter stays bounded and responsive", () => {
    for (let i = 0; i < 12_000; i++) checkRateLimit(`flood_${i}`, 60_000);
    expect(checkRateLimit("post_flood", 60_000)).toBe(true);
  });

  it("given a burst capacity, when called back-to-back, then it allows up to capacity then blocks", () => {
    expect(checkRateLimit("burst", 1000, 3)).toBe(true);
    expect(checkRateLimit("burst", 1000, 3)).toBe(true);
    expect(checkRateLimit("burst", 1000, 3)).toBe(true);
    expect(checkRateLimit("burst", 1000, 3)).toBe(false);
  });

  it("given a drained bucket, when one refill interval elapses, then exactly one more request is allowed", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("refill", 1000, 3);
    expect(checkRateLimit("refill", 1000, 3)).toBe(false);
    vi.advanceTimersByTime(1000); // regenerate one token
    expect(checkRateLimit("refill", 1000, 3)).toBe(true);
    expect(checkRateLimit("refill", 1000, 3)).toBe(false);
  });

  it("given a partly-elapsed interval, when called, then fractional tokens do not yet permit a request", () => {
    expect(checkRateLimit("frac", 1000, 1)).toBe(true);
    vi.advanceTimersByTime(999);
    expect(checkRateLimit("frac", 1000, 1)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(checkRateLimit("frac", 1000, 1)).toBe(true);
  });

  it("given a long idle period, when called, then the bucket does not over-fill beyond capacity", () => {
    for (let i = 0; i < 2; i++) checkRateLimit("cap", 1000, 2);
    expect(checkRateLimit("cap", 1000, 2)).toBe(false);
    vi.advanceTimersByTime(10_000); // 10 tokens' worth of time, but capped at 2
    expect(checkRateLimit("cap", 1000, 2)).toBe(true);
    expect(checkRateLimit("cap", 1000, 2)).toBe(true);
    expect(checkRateLimit("cap", 1000, 2)).toBe(false);
  });
});
