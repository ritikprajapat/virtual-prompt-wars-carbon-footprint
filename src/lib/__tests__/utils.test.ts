import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calcWeeklyStats,
  computeGrade,
  clamp,
  debounce,
  buildLogSummary,
  toMonthlyEstimate,
  round2,
  startOfTodayMs,
} from "@/lib/utils";
import type { LogEntry } from "@/types";

const makeEntry = (category: LogEntry["category"], co2Total: number, daysAgo = 0): LogEntry => ({
  id: String(Math.random()),
  category,
  actionKey: "test",
  actionName: "Test",
  quantity: 1,
  co2Total,
  timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
});

describe("calcWeeklyStats", () => {
  it("sums entries from last 7 days by category", () => {
    const entries = [makeEntry("transport", 10), makeEntry("food", 5), makeEntry("energy", 3)];
    const stats = calcWeeklyStats(entries);
    expect(stats.transport).toBe(10);
    expect(stats.food).toBe(5);
    expect(stats.energy).toBe(3);
    expect(stats.total).toBe(18);
  });
  it("excludes entries older than 7 days", () => {
    const entries = [makeEntry("transport", 10, 0), makeEntry("transport", 99, 8)];
    const stats = calcWeeklyStats(entries);
    expect(stats.transport).toBe(10);
  });
  it("returns zeros for empty entries", () => {
    const stats = calcWeeklyStats([]);
    expect(stats.total).toBe(0);
  });
});

describe("computeGrade", () => {
  it("returns A+ for very low emissions", () => {
    expect(computeGrade(20)).toBe("A+");
  });
  it("returns A for low emissions", () => {
    expect(computeGrade(45)).toBe("A");
  });
  it("returns B+ for below average", () => {
    expect(computeGrade(60)).toBe("B+");
  });
  it("returns C for near average", () => {
    expect(computeGrade(100)).toBe("C");
  });
  it("returns D for above average", () => {
    expect(computeGrade(120)).toBe("D");
  });
  it("returns B at the upper edge of the B band", () => {
    expect(computeGrade(80)).toBe("B");
  });
  it("returns C+ in the C+ band", () => {
    expect(computeGrade(90)).toBe("C+");
  });
});

describe("buildLogSummary", () => {
  it("summarises per-category totals and entry count", () => {
    const entries = [makeEntry("transport", 10), makeEntry("food", 5)];
    const summary = buildLogSummary(entries);
    expect(summary).toContain("Transport: 10 kg");
    expect(summary).toContain("Food: 5 kg");
    expect(summary).toContain("Total entries: 2");
  });
  it("handles empty entries", () => {
    const summary = buildLogSummary([]);
    expect(summary).toContain("Transport: 0 kg");
    expect(summary).toContain("Total entries: 0");
  });
});

describe("round2", () => {
  it("given a long decimal, when rounded, then returns 2 decimals", () => {
    expect(round2(1.23456)).toBe(1.23);
  });
  it("given an integer, when rounded, then returns it unchanged", () => {
    expect(round2(5)).toBe(5);
  });
  it("given accumulated floats, when summed then rounded once, then avoids drift", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe("startOfTodayMs", () => {
  it("given now, when computed, then returns midnight today at or before now", () => {
    const start = startOfTodayMs();
    expect(start).toBeLessThanOrEqual(Date.now());
    expect(new Date(start).getHours()).toBe(0);
    expect(new Date(start).getMinutes()).toBe(0);
  });
});

describe("toMonthlyEstimate", () => {
  it("given a weekly figure, when projected, then multiplies by weeks per month", () => {
    expect(toMonthlyEstimate(100)).toBe(434.5);
  });
  it("given zero, when projected, then returns zero", () => {
    expect(toMonthlyEstimate(0)).toBe(0);
  });
  it("given a fractional result, when projected, then rounds to 2 decimals", () => {
    expect(toMonthlyEstimate(10.123)).toBe(43.98);
  });
});

describe("clamp", () => {
  it("returns value within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it("clamps to max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("delays function call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("resets timer on repeated calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
