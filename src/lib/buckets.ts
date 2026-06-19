import type { LogEntry } from "@/types";
import { MS_PER_DAY, round2 } from "@/lib/utils";

/** A single day's aggregated emissions, ready for charting. */
export interface DayBucket {
  day: string;
  co2: number;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Short weekday label for a date, e.g. "Mon". */
export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()] ?? "";
}

/** Month/day label for a date, e.g. "6/19". */
export function monthDayLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Bucket log entries into the trailing `dayCount` days (oldest first), summing
 * `co2Total` per day. Entries outside the window are ignored. Each bucket is
 * rounded once, after summing, to avoid compounding rounding error.
 * @param entries - log entries of any age
 * @param dayCount - number of trailing days to include (e.g. 7 or 30)
 * @param formatLabel - maps each bucket's date to its display label
 * @returns one bucket per day, oldest to newest
 */
export function bucketByDay(
  entries: LogEntry[],
  dayCount: number,
  formatLabel: (date: Date) => string
): DayBucket[] {
  const now = Date.now();
  const buckets: DayBucket[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    buckets.push({ day: formatLabel(new Date(now - i * MS_PER_DAY)), co2: 0 });
  }
  for (const e of entries) {
    const diffDays = Math.floor((now - new Date(e.timestamp).getTime()) / MS_PER_DAY);
    if (diffDays >= 0 && diffDays < dayCount) {
      const bucket = buckets[dayCount - 1 - diffDays];
      if (bucket) bucket.co2 += e.co2Total;
    }
  }
  for (const b of buckets) b.co2 = round2(b.co2);
  return buckets;
}
