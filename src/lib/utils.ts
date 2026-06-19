import type { LogEntry, WeeklyStats } from "@/types";

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
 * Calculate total CO₂ per category for the last 7 days.
 *
 * Sums are accumulated at full precision and rounded once at the end so that
 * per-entry rounding cannot compound into a drifting total.
 * @param entries - all log entries (any age; older than 7 days are ignored)
 * @returns per-category and total kg CO₂e for the trailing week
 */
export function calcWeeklyStats(entries: LogEntry[]): WeeklyStats {
  const oneWeekAgo = Date.now() - DAYS_PER_WEEK * MS_PER_DAY;
  const recent = entries.filter((e) => new Date(e.timestamp).getTime() > oneWeekAgo);
  const stats: WeeklyStats = { transport: 0, food: 0, energy: 0, shopping: 0, total: 0 };
  for (const e of recent) {
    stats[e.category] += e.co2Total;
    stats.total += e.co2Total;
  }
  stats.transport = round2(stats.transport);
  stats.food = round2(stats.food);
  stats.energy = round2(stats.energy);
  stats.shopping = round2(stats.shopping);
  stats.total = round2(stats.total);
  return stats;
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
 * Build a plain-text summary of recent log entries for AI context.
 */
export function buildLogSummary(entries: LogEntry[]): string {
  const stats = calcWeeklyStats(entries);
  return (
    `Transport: ${stats.transport} kg, Food: ${stats.food} kg, ` +
    `Energy: ${stats.energy} kg, Shopping: ${stats.shopping} kg. ` +
    `Total entries: ${entries.length}.`
  );
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
