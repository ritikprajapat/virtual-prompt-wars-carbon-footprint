"use client";
import { clamp } from "@/lib/utils";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
}

/** Progress card for a single monthly goal, with an accessible progress bar. */
export function GoalCard({ goal }: GoalCardProps) {
  const pct = Math.round(clamp((goal.currentKg / goal.targetKg) * 100, 0, 100));
  const focusLabel = goal.focusArea === "all" ? "All categories" : goal.focusArea;

  return (
    <li role="listitem" className="card" style={{ listStyle: "none" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>
            {focusLabel}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>{goal.month}</div>
        </div>
        <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, color: "var(--text2)" }}>
          {goal.currentKg} / {goal.targetKg} kg
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress towards ${goal.targetKg} kg goal`}
        style={{
          height: 10,
          background: "var(--surface2)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: pct < 80 ? "var(--green2)" : pct < 100 ? "var(--amber)" : "var(--red)",
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{pct}% of budget used</div>
    </li>
  );
}
