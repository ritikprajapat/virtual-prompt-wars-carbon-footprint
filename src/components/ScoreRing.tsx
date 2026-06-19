"use client";
import { useEffect, useState } from "react";
import { computeGrade, NATIONAL_AVERAGE_WEEKLY_KG, clamp } from "@/lib/utils";

interface ScoreRingProps {
  weeklyKg: number;
}

const SIZE = 180;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated SVG ring showing the week's footprint as a fraction of the national
 * average, with the letter grade at its centre. Exposed to assistive tech as a
 * single labelled `img`; the animation honours `prefers-reduced-motion`.
 */
export function ScoreRing({ weeklyKg }: ScoreRingProps) {
  const grade = computeGrade(weeklyKg);
  // Fraction of national average filled (lower is better, so invert for "headroom").
  const ratio = clamp(weeklyKg / NATIONAL_AVERAGE_WEEKLY_KG, 0, 1.2);
  const filled = clamp(ratio, 0, 1);

  const target = CIRCUMFERENCE * (1 - filled);
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  useEffect(() => {
    // Animate the ring fill on mount. Users with `prefers-reduced-motion` get no
    // animation because the CSS transition is disabled for them in globals.css.
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const color = ratio <= 0.65 ? "var(--green)" : ratio <= 0.95 ? "var(--amber)" : "var(--red)";

  return (
    <div
      role="img"
      aria-label={`Weekly carbon footprint ${weeklyKg} kg CO2, ${Math.round(
        ratio * 100
      )} percent of the national average of ${NATIONAL_AVERAGE_WEEKLY_KG} kg. Grade ${grade}.`}
      style={{ position: "relative", width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--surface2)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-syne)", fontSize: 40, fontWeight: 700, color }}>
          {grade}
        </span>
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 14, color: "var(--text2)" }}>
          {weeklyKg} kg
        </span>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>this week</span>
      </div>
    </div>
  );
}
