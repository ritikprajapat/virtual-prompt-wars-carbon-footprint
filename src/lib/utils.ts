import type { Category, LogEntry, WeeklyStats } from "@/types";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@/lib/categories";

const NATIONAL_AVERAGE_WEEKLY_KG = 101;

/** Average number of weeks in a calendar month (365.25 / 12 / 7). */
const WEEKS_PER_MONTH = 4.345;

/** Milliseconds in one day. */
export const MS_PER_DAY = 86_400_000;

/** Days in one week. */
export const DAYS_PER_WEEK = 7;

/**
 * Round a number to two decimal places.
 * @param value - the number to round
 * @returns the value rounded to 2 decimals
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Project a weekly CO₂ figure to an estimated monthly total.
 * @param weeklyKg - kg CO₂e accumulated over a week
 * @returns kg CO₂e per month, rounded to 2 decimals
 */
export function toMonthlyEstimate(weeklyKg: number): number {
  return round2(weeklyKg * WEEKS_PER_MONTH);
}

/**
 * Select the log entries that fall within the trailing `days` window.
 *
 * Single responsibility: time-window selection (no aggregation). Reused wherever
 * a recent-entries slice is needed, so the cutoff math lives in one place.
 * @param entries - all log entries, any age
 * @param days - size of the trailing window in days
 * @returns the entries newer than the cutoff
 */
export function filterWithinDays(entries: LogEntry[], days: number): LogEntry[] {
  const cutoff = Date.now() - days * MS_PER_DAY;
  return entries.filter((e) => new Date(e.timestamp).getTime() > cutoff);
}

/**
 * Sum CO₂ per category (and overall) for the given entries.
 *
 * Single responsibility: aggregation only — it does not select a time window.
 * Category-agnostic: it iterates {@link CATEGORY_KEYS}, so a new category needs
 * no change here (open for extension). Sums accumulate at full precision and are
 * rounded once at the end so per-entry rounding cannot compound.
 * @param entries - the entries to aggregate
 * @returns per-category and total kg CO₂e
 */
export function aggregateByCategory(entries: LogEntry[]): WeeklyStats {
  const stats: WeeklyStats = { transport: 0, food: 0, energy: 0, shopping: 0, total: 0 };
  for (const e of entries) {
    stats[e.category] += e.co2Total;
    stats.total += e.co2Total;
  }
  for (const key of CATEGORY_KEYS) stats[key] = round2(stats[key]);
  stats.total = round2(stats.total);
  return stats;
}

/**
 * Calculate total CO₂ per category for the last 7 days. Composition of
 * {@link filterWithinDays} and {@link aggregateByCategory}.
 * @param entries - all log entries (any age; older than 7 days are ignored)
 * @returns per-category and total kg CO₂e for the trailing week
 */
export function calcWeeklyStats(entries: LogEntry[]): WeeklyStats {
  return aggregateByCategory(filterWithinDays(entries, DAYS_PER_WEEK));
}

/**
 * Timestamp (ms since epoch) for the start of the current local day.
 * @returns midnight today, in milliseconds
 */
export function startOfTodayMs(): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/**
 * Compute letter grade relative to national average.
 */
export function computeGrade(weeklyKg: number): string {
  const ratio = weeklyKg / NATIONAL_AVERAGE_WEEKLY_KG;
  if (ratio <= 0.3) return "A+";
  if (ratio <= 0.5) return "A";
  if (ratio <= 0.65) return "B+";
  if (ratio <= 0.8) return "B";
  if (ratio <= 0.95) return "C+";
  if (ratio <= 1.1) return "C";
  return "D";
}

/**
 * Determine the category with the highest weekly emissions. Ties resolve to the
 * earliest category in display order.
 * @param stats - per-category weekly totals
 * @returns the dominant category key
 */
export function topCategory(stats: WeeklyStats): Category {
  return [...CATEGORY_KEYS].reduce((a, b) => (stats[a] >= stats[b] ? a : b));
}

/**
 * Format a stats object as plain-text prompt context.
 *
 * Single responsibility: presentation only (no computation). Category-driven via
 * {@link CATEGORY_LABELS}, so labels never drift from the rest of the UI.
 * @param stats - per-category weekly totals
 * @param entryCount - number of entries the stats were derived from
 * @returns a single-line summary string
 */
export function formatStatsSummary(stats: WeeklyStats, entryCount: number): string {
  const parts = CATEGORY_KEYS.map((key) => `${CATEGORY_LABELS[key]}: ${stats[key]} kg`);
  return `${parts.join(", ")}. Total entries: ${entryCount}.`;
}

/**
 * Build a plain-text summary of recent log entries for AI context. Composition
 * of {@link calcWeeklyStats} and {@link formatStatsSummary}.
 */
export function buildLogSummary(entries: LogEntry[]): string {
  return formatStatsSummary(calcWeeklyStats(entries), entries.length);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function by ms milliseconds.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export { NATIONAL_AVERAGE_WEEKLY_KG, WEEKS_PER_MONTH };
