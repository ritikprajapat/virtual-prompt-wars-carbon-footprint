"use client";
import type { LogEntry } from "@/types";

interface TodayLogProps {
  entries: LogEntry[];
}

/**
 * Read-only list of the activities logged so far today.
 */
export function TodayLog({ entries }: TodayLogProps) {
  if (entries.length === 0) {
    return <p style={{ color: "var(--text3)", fontSize: 13 }}>No activities logged yet today.</p>;
  }
  return (
    <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map((e) => (
        <li
          key={e.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--surface2)",
            fontSize: 13,
          }}
        >
          <span>
            {e.actionName} ×{e.quantity}
          </span>
          <span style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text2)" }}>
            {e.co2Total} kg
          </span>
        </li>
      ))}
    </ul>
  );
}
