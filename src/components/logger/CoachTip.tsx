"use client";

interface CoachTipProps {
  loading: boolean;
  tip: string | null;
}

/**
 * Live region that shows the AI coach's loading state and generated tip after
 * an activity is logged.
 */
export function CoachTip({ loading, tip }: CoachTipProps) {
  return (
    <section
      className="card"
      role="status"
      aria-live="polite"
      aria-busy={loading}
      style={{ borderColor: "var(--border2)" }}
    >
      <h2 className="section-title" style={{ color: "var(--green)" }}>
        AI Coach
      </h2>
      {loading ? (
        <p style={{ color: "var(--text2)" }}>Generating a personalised tip…</p>
      ) : (
        <p style={{ color: "var(--text)", lineHeight: 1.6 }}>{tip}</p>
      )}
    </section>
  );
}
