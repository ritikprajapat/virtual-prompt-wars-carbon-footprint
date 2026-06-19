"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarbonStore } from "@/store/carbonStore";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/log", label: "Log Activity", icon: "+" },
  { href: "/insights", label: "Insights", icon: "∿" },
  { href: "/goals", label: "Goals", icon: "◎" },
];

/** Fixed primary navigation sidebar with active-route highlighting and the
 * current logging streak read from the carbon store. */
export function Sidebar() {
  const pathname = usePathname();
  const streak = useCarbonStore((s) => s.streak);
  return (
    <nav
      aria-label="Main navigation"
      style={{
        width: "var(--sidebar-w)",
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        position: "fixed",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700 }}>
          CarbonTrace
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontFamily: "var(--font-dm-mono)",
            marginTop: 2,
          }}
        >
          footprint tracker
        </div>
      </div>
      <ul role="list" style={{ listStyle: "none", padding: "16px 12px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  textDecoration: "none",
                  marginBottom: 2,
                  fontWeight: active ? 500 : 400,
                  background: active ? "var(--green-dim)" : "transparent",
                  color: active ? "var(--green)" : "var(--text2)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 16, width: 16, textAlign: "center" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <div
          role="status"
          aria-label={`Current streak: ${streak} days`}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            aria-hidden="true"
            style={{ fontFamily: "var(--font-dm-mono)", fontSize: 20, color: "var(--amber)" }}
          >
            {streak}
          </span>
          <div>
            <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 500 }}>day streak</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>keep going!</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
