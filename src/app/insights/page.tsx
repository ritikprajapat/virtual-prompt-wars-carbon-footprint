"use client";
import { useMemo, useState } from "react";
import { TrendAreaChart } from "@/components/charts/lazy";
import { useCarbonStore } from "@/store/carbonStore";
import { buildLogSummary } from "@/lib/utils";
import { bucketByDay, monthDayLabel } from "@/lib/buckets";
import { postJson } from "@/lib/apiClient";
import { SIM_SCENARIOS } from "@/lib/emissions";
import type { SimScenario } from "@/types";

/** Number of trailing days shown in the insights trend chart. */
const TREND_DAYS = 30;

/** Insights route: 30-day trend chart, on-demand AI analysis, and a what-if savings simulator. */
export default function InsightsPage() {
  const logEntries = useCarbonStore((s) => s.logEntries);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<SimScenario | null>(null);

  const trend = useMemo(() => bucketByDay(logEntries, TREND_DAYS, monthDayLabel), [logEntries]);

  const refresh = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const data = await postJson<{ insights?: string }>("/api/insights", {
        summary: buildLogSummary(logEntries),
      });
      setAnalysis(
        data
          ? (data.insights ?? null)
          : "Insights service is busy right now. Please try again shortly."
      );
    } catch {
      setAnalysis("Insights service is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Insights</h1>
      <p className="page-sub">Trends, AI analysis, and what-if scenarios</p>

      <section
        className="card"
        role="region"
        aria-labelledby="trend-heading"
        style={{ marginBottom: 24 }}
      >
        <h2 id="trend-heading" className="section-title">
          30-day trend
        </h2>
        <div
          role="img"
          aria-label={`30 day CO2 trend with ${trend.filter((d) => d.co2 > 0).length} days of data logged`}
        >
          <TrendAreaChart data={trend} />
        </div>
      </section>

      <section
        className="card"
        role="region"
        aria-labelledby="ai-heading"
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="ai-heading" className="section-title" style={{ marginBottom: 0 }}>
            AI analysis
          </h2>
          <button
            className="btn-primary"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh AI analysis"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            {loading ? "Analysing…" : "Refresh analysis"}
          </button>
        </div>
        <div aria-live="polite" aria-busy={loading} style={{ marginTop: 14 }}>
          {loading && <p style={{ color: "var(--text2)" }}>Analysing your weekly footprint…</p>}
          {!loading && !analysis && (
            <p style={{ color: "var(--text3)", fontSize: 13 }}>
              Click &ldquo;Refresh analysis&rdquo; for a personalised AI breakdown.
            </p>
          )}
          {!loading &&
            analysis &&
            analysis
              .split("\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} style={{ color: "var(--text)", lineHeight: 1.7, marginBottom: 12 }}>
                  {para}
                </p>
              ))}
        </div>
      </section>

      <section className="card" role="region" aria-labelledby="sim-heading">
        <h2 id="sim-heading" className="section-title">
          What-if simulator
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {SIM_SCENARIOS.map((s) => {
            const selected = scenario?.key === s.key;
            return (
              <button
                key={s.key}
                className="chip"
                onClick={() => setScenario(s)}
                aria-pressed={selected}
                aria-label={`Simulate: ${s.label}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          {scenario ? (
            <div
              style={{
                background: "var(--surface2)",
                borderRadius: 8,
                padding: 16,
                border: "1px solid var(--border2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 22,
                  color: "var(--green)",
                  marginBottom: 6,
                }}
              >
                −{scenario.savesKgPerMonth} kg CO₂ / month
              </div>
              <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>
                {scenario.description}
              </p>
            </div>
          ) : (
            <p style={{ color: "var(--text3)", fontSize: 13 }}>
              Select a scenario to see your potential savings.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
