"use client";
import { useMemo } from "react";
import { WeeklyBarChart, CategoryPieChart } from "@/components/charts/lazy";
import { useCarbonStore } from "@/store/carbonStore";
import { calcWeeklyStats, DAYS_PER_WEEK, NATIONAL_AVERAGE_WEEKLY_KG } from "@/lib/utils";
import { bucketByDay, weekdayLabel } from "@/lib/buckets";
import { calcCo2, findAction } from "@/lib/emissions";
import { CATEGORIES } from "@/lib/categories";
import { ScoreRing } from "@/components/ScoreRing";
import type { Category } from "@/types";

const QUICK_ACTIONS: { category: Category; actionKey: string }[] = [
  { category: "transport", actionKey: "car_10km" },
  { category: "food", actionKey: "beef_meal" },
  { category: "food", actionKey: "veggie_meal" },
  { category: "energy", actionKey: "electricity_kwh" },
  { category: "shopping", actionKey: "delivery_std" },
];

/** Dashboard route: weekly score ring, category breakdown, daily chart, and quick-log shortcuts. */
export default function DashboardPage() {
  const logEntries = useCarbonStore((s) => s.logEntries);
  const addEntry = useCarbonStore((s) => s.addEntry);

  const stats = useMemo(() => calcWeeklyStats(logEntries), [logEntries]);
  const daily = useMemo(() => bucketByDay(logEntries, DAYS_PER_WEEK, weekdayLabel), [logEntries]);
  const pieData = useMemo(
    () =>
      CATEGORIES.map((c) => ({ name: c.label, value: stats[c.key], color: c.color })).filter(
        (d) => d.value > 0
      ),
    [stats]
  );

  const quickLog = (category: Category, actionKey: string) => {
    const action = findAction(category, actionKey);
    if (!action) return;
    addEntry({
      category,
      actionKey: action.key,
      actionName: action.name,
      quantity: 1,
      co2Total: calcCo2(action.co2PerUnit, 1),
    });
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Your carbon footprint at a glance</p>

      <section
        aria-label="Weekly score and category breakdown"
        style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}
      >
        <div
          className="card"
          style={{ display: "flex", alignItems: "center", gap: 24, flex: "1 1 320px" }}
        >
          <ScoreRing weeklyKg={stats.total} />
          <div aria-live="polite">
            <div style={{ fontSize: 13, color: "var(--text2)" }}>Total this week</div>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 28, color: "var(--text)" }}>
              {stats.total} kg
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              National avg: {NATIONAL_AVERAGE_WEEKLY_KG} kg / week
            </div>
          </div>
        </div>

        <div
          className="card"
          role="region"
          aria-label="Category breakdown chart"
          style={{ flex: "1 1 320px", minWidth: 280 }}
        >
          <h2 className="section-title">Category breakdown</h2>
          {pieData.length === 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 13 }}>
              No data yet — log an activity to see your breakdown.
            </p>
          ) : (
            <div
              role="img"
              aria-label={`Category breakdown: ${pieData
                .map((d) => `${d.name} ${d.value} kg`)
                .join(", ")}`}
            >
              <CategoryPieChart data={pieData} />
            </div>
          )}
        </div>
      </section>

      <section
        aria-label="Category statistics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {CATEGORIES.map((c) => (
          <div key={c.key} className="card">
            <div style={{ fontSize: 13, color: "var(--text2)" }}>{c.label}</div>
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 24,
                color: c.color,
                marginTop: 4,
              }}
            >
              {stats[c.key]} kg
            </div>
          </div>
        ))}
      </section>

      <section
        className="card"
        role="region"
        aria-label="Daily CO2 this week"
        style={{ marginBottom: 24 }}
      >
        <h2 className="section-title">Daily CO₂ this week</h2>
        <div
          role="img"
          aria-label={`Daily CO2 emissions: ${daily.map((d) => `${d.day} ${d.co2} kg`).join(", ")}`}
        >
          <WeeklyBarChart data={daily} />
        </div>
      </section>

      <section className="card" role="region" aria-label="Quick log common actions">
        <h2 className="section-title">Quick log</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {QUICK_ACTIONS.map(({ category, actionKey }) => {
            const action = findAction(category, actionKey);
            if (!action) return null;
            return (
              <button
                key={`${category}-${actionKey}`}
                className="chip"
                onClick={() => quickLog(category, actionKey)}
                aria-label={`Quick log: ${action.name}, ${calcCo2(action.co2PerUnit, 1)} kg CO2`}
              >
                + {action.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
