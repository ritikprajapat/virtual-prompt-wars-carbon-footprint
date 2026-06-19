"use client";
import { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface TrendDatum {
  day: string;
  co2: number;
}

function TrendAreaChartImpl({ data }: { data: TrendDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green2)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--green2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" stroke="var(--text3)" fontSize={10} interval={4} />
        <YAxis stroke="var(--text3)" fontSize={12} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="co2"
          stroke="var(--green)"
          fill="url(#co2grad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Memoised area chart of the 30-day CO₂ trend. */
export const TrendAreaChart = memo(TrendAreaChartImpl);
