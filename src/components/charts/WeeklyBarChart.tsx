"use client";
import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface DailyDatum {
  day: string;
  co2: number;
}

function WeeklyBarChartImpl({ data }: { data: DailyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" stroke="var(--text3)" fontSize={12} />
        <YAxis stroke="var(--text3)" fontSize={12} />
        <Tooltip />
        <Bar dataKey="co2" fill="var(--green2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Memoised bar chart of daily CO₂ totals for the current week. */
export const WeeklyBarChart = memo(WeeklyBarChartImpl);
