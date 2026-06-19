import { describe, it, expect } from "vitest";
import { bucketByDay, weekdayLabel, monthDayLabel } from "@/lib/buckets";
import { MS_PER_DAY } from "@/lib/utils";
import type { LogEntry } from "@/types";

const makeEntry = (co2Total: number, daysAgo = 0): LogEntry => ({
  id: String(Math.random()),
  category: "transport",
  actionKey: "test",
  actionName: "Test",
  quantity: 1,
  co2Total,
  timestamp: new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString(),
});

describe("bucketByDay", () => {
  it("given a day count, when bucketed, then returns exactly that many buckets oldest-first", () => {
    const buckets = bucketByDay([], 7, weekdayLabel);
    expect(buckets.length).toBe(7);
    expect(buckets.every((b) => b.co2 === 0)).toBe(true);
  });
  it("given entries within the window, when bucketed, then sums them into the newest bucket", () => {
    const buckets = bucketByDay([makeEntry(2), makeEntry(3)], 7, weekdayLabel);
    expect(buckets[buckets.length - 1]!.co2).toBe(5);
  });
  it("given an entry N days ago, when bucketed, then it lands in the correct bucket", () => {
    const buckets = bucketByDay([makeEntry(4, 2)], 7, weekdayLabel);
    // 2 days ago → index 6 - 2 = 4
    expect(buckets[4]!.co2).toBe(4);
  });
  it("given an entry older than the window, when bucketed, then it is excluded", () => {
    const buckets = bucketByDay([makeEntry(99, 40)], 30, monthDayLabel);
    expect(buckets.every((b) => b.co2 === 0)).toBe(true);
  });
  it("given many fractional entries, when summed, then the bucket is rounded once to 2dp", () => {
    const buckets = bucketByDay([makeEntry(0.1), makeEntry(0.2)], 1, weekdayLabel);
    expect(buckets[0]!.co2).toBe(0.3);
  });
});

describe("weekdayLabel", () => {
  it("given a Sunday, when labelled, then returns 'Sun'", () => {
    expect(weekdayLabel(new Date("2026-06-21T12:00:00"))).toBe("Sun");
  });
});

describe("monthDayLabel", () => {
  it("given a date, when labelled, then returns month/day", () => {
    expect(monthDayLabel(new Date("2026-06-19T12:00:00"))).toBe("6/19");
  });
});
