"use client";
import { useMemo, useState } from "react";
import { useCarbonStore } from "@/store/carbonStore";
import { GoalSchema } from "@/lib/validators";
import { calcWeeklyStats, toMonthlyEstimate } from "@/lib/utils";
import { CATEGORY_KEYS, FOCUS_OPTIONS } from "@/lib/categories";
import { GoalCard } from "@/components/GoalCard";
import { ChallengeList } from "@/components/ChallengeList";
import type { Category } from "@/types";

const MONTH_LABEL = "current month";

/** Goals route: set a monthly target, view active goals, and complete weekly challenges. */
export default function GoalsPage() {
  const goals = useCarbonStore((s) => s.goals);
  const addGoal = useCarbonStore((s) => s.addGoal);
  const logEntries = useCarbonStore((s) => s.logEntries);

  const [targetKg, setTargetKg] = useState(150);
  const [focusArea, setFocusArea] = useState<Category | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const stats = useMemo(() => calcWeeklyStats(logEntries), [logEntries]);
  const monthlyEstimate = toMonthlyEstimate(stats.total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuggestion(null);

    const result = GoalSchema.safeParse({ targetKg, focusArea });
    if (!result.success) {
      setError("Target must be between 10 and 5000 kg.");
      return;
    }

    const current = focusArea === "all" ? monthlyEstimate : toMonthlyEstimate(stats[focusArea]);

    addGoal({
      targetKg: result.data.targetKg,
      focusArea: result.data.focusArea,
      currentKg: current,
      month: MONTH_LABEL,
    });

    try {
      const topCategory = [...CATEGORY_KEYS].reduce((a, b) => (stats[a] >= stats[b] ? a : b));
      const res = await fetch("/api/goal-recalibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentKg: monthlyEstimate,
          targetKg: result.data.targetKg,
          topCategory,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { suggestedKg?: number; reason?: string };
        if (data.suggestedKg && data.reason) {
          setSuggestion(`AI suggests ${data.suggestedKg} kg: ${data.reason}`);
        }
      }
    } catch {
      // Non-blocking: AI suggestion is optional.
    }
  };

  return (
    <div>
      <h1 className="page-title">Goals</h1>
      <p className="page-sub">Set monthly targets and take on weekly challenges</p>

      <section
        className="card"
        role="region"
        aria-labelledby="set-goal"
        style={{ marginBottom: 24 }}
      >
        <h2 id="set-goal" className="section-title">
          Set a monthly goal
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="field-label">Target (kg CO₂ / month)</span>
            <input
              type="number"
              className="input"
              aria-label="Target kg CO2 per month"
              min={10}
              max={5000}
              value={targetKg}
              onChange={(e) => setTargetKg(Number(e.target.value))}
              style={{ width: 140 }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="field-label">Focus area</span>
            <select
              className="input"
              aria-label="Goal focus area"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value as Category | "all")}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {FOCUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary" aria-label="Set goal">
            Set Goal
          </button>
        </form>
        {error && (
          <p role="alert" style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>
            {error}
          </p>
        )}
        {suggestion && (
          <p
            role="status"
            aria-live="polite"
            style={{ color: "var(--green)", fontSize: 13, marginTop: 10 }}
          >
            {suggestion}
          </p>
        )}
      </section>

      <section role="region" aria-labelledby="active-goals" style={{ marginBottom: 24 }}>
        <h2 id="active-goals" className="section-title">
          Active goals
        </h2>
        {goals.length === 0 ? (
          <p style={{ color: "var(--text3)", fontSize: 13 }}>No goals yet — set one above.</p>
        ) : (
          <ul
            role="list"
            style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}
          >
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </ul>
        )}
      </section>

      <section className="card" role="region" aria-labelledby="challenges">
        <h2 id="challenges" className="section-title">
          Weekly challenges
        </h2>
        <ChallengeList />
      </section>
    </div>
  );
}
