"use client";
import { useCarbonStore } from "@/store/carbonStore";
import { onActivateKey } from "@/lib/a11y";

/**
 * Renders the weekly challenges as keyboard-operable checkboxes backed by the
 * carbon store. Each item toggles its completed state on click or Enter/Space.
 */
export function ChallengeList() {
  const challenges = useCarbonStore((s) => s.challenges);
  const toggleChallenge = useCarbonStore((s) => s.toggleChallenge);

  return (
    <ul role="list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {challenges.map((c) => (
        <li key={c.id}>
          <div
            role="checkbox"
            aria-checked={c.completed}
            aria-label={`${c.name}, worth ${c.points} points`}
            tabIndex={0}
            onClick={() => toggleChallenge(c.id)}
            onKeyDown={(e) => onActivateKey(e, () => toggleChallenge(c.id))}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${c.completed ? "var(--green)" : "var(--border)"}`,
              background: c.completed ? "var(--green-dim)" : "var(--surface2)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                border: `2px solid ${c.completed ? "var(--green)" : "var(--text3)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--green)",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {c.completed ? "✓" : ""}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13.5,
                  color: c.completed ? "var(--green)" : "var(--text)",
                  textDecoration: c.completed ? "line-through" : "none",
                }}
              >
                {c.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.description}</div>
            </div>
            <span
              style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "var(--amber)" }}
            >
              +{c.points}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
