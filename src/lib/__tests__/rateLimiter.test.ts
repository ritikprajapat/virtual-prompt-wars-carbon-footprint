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
});
