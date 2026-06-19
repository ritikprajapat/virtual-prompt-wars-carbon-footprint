"use client";
import dynamic from "next/dynamic";

function ChartFallback({ height }: { height: number }) {
  return <div className="skeleton" style={{ height, width: "100%" }} aria-hidden="true" />;
}

/**
 * Recharts is heavy (~100 kB). These dynamic wrappers code-split it out of the
 * initial route bundle and render only on the client, with a skeleton fallback.
 */
export const WeeklyBarChart = dynamic(
  () => import("./WeeklyBarChart").then((m) => m.WeeklyBarChart),
  { ssr: false, loading: () => <ChartFallback height={200} /> }
);

export const CategoryPieChart = dynamic(
  () => import("./CategoryPieChart").then((m) => m.CategoryPieChart),
  { ssr: false, loading: () => <ChartFallback height={180} /> }
);

export const TrendAreaChart = dynamic(
  () => import("./TrendAreaChart").then((m) => m.TrendAreaChart),
  { ssr: false, loading: () => <ChartFallback height={220} /> }
);
