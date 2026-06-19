"use client";
import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

function CategoryPieChartImpl({ data }: { data: PieDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Memoised pie chart of CO₂ split by category. */
export const CategoryPieChart = memo(CategoryPieChartImpl);
