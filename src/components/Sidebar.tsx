"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarbonStore } from "@/store/carbonStore";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared stroke-icon wrapper (Lucide-style, 1.75 stroke) for visual consistency. */
function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const DashboardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
);
const LogIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Icon>
);
const InsightsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-4 3 3 4-6" />
  </Icon>
);
const GoalsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" />
  </Icon>
);
const FlameIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.5.8-2.7 1.5-3.5C9.8 9 9 7 12 3z" />
  </Icon>
);

const NAV_ITEMS: { href: string; label: string; Icon: ComponentType<IconProps> }[] = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/log", label: "Log Activity", Icon: LogIcon },
  { href: "/insights", label: "Insights", Icon: InsightsIcon },
  { href: "/goals", label: "Goals", Icon: GoalsIcon },
];

/** Primary navigation. Renders as a fixed left rail on desktop and a fixed
 * bottom tab bar on mobile, with active-route highlighting and the current
 * logging streak read from the carbon store. */
export function Sidebar() {
  const pathname = usePathname();
  const streak = useCarbonStore((s) => s.streak);

  return (
    <nav aria-label="Main navigation" className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true">
          <FlameIcon width={18} height={18} />
        </span>
        <div>
          <div className="sidebar-name">CarbonTrace</div>
          <div className="sidebar-tag">footprint tracker</div>
        </div>
      </div>

      <ul role="list" className="sidebar-list">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div role="status" aria-label={`Current streak: ${streak} days`} className="streak-card">
          <span className="streak-flame" aria-hidden="true">
            <FlameIcon />
          </span>
          <div>
            <div className="streak-count mono">{streak} days</div>
            <div className="streak-sub">keep going!</div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </nav>
  );
}

const css = `
.sidebar {
  width: var(--sidebar-w);
  background: linear-gradient(180deg, var(--bg2), var(--bg));
  border-right: 1px solid var(--border);
  position: fixed;
  inset: 0 auto 0 0;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 22px 0;
  z-index: 40;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 20px 22px;
  border-bottom: 1px solid var(--border);
}
.sidebar-logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--green);
  background: var(--green-dim);
  border: 1px solid var(--border2);
}
.sidebar-name {
  font-family: var(--font-syne), sans-serif;
  font-size: 16px;
  font-weight: 700;
}
.sidebar-tag {
  font-size: 11px;
  color: var(--text3);
  font-family: var(--font-dm-mono), monospace;
  margin-top: 1px;
}
.sidebar-list {
  list-style: none;
  padding: 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  color: var(--text2);
  position: relative;
  transition: background 0.16s ease, color 0.16s ease;
}
.nav-link:hover {
  background: var(--surface);
  color: var(--text);
}
.nav-link-active {
  background: var(--green-dim);
  color: var(--green);
}
.nav-link-active::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--green);
}
.nav-icon { flex-shrink: 0; }
.sidebar-footer {
  padding: 16px 16px 0;
  border-top: 1px solid var(--border);
}
.streak-card {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 11px;
}
.streak-flame {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  color: var(--amber);
  background: rgba(251, 191, 36, 0.12);
}
.streak-count {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.streak-sub {
  font-size: 11px;
  color: var(--text3);
}

/* Mobile: bottom tab bar */
@media (max-width: 860px) {
  .sidebar {
    flex-direction: row;
    width: 100%;
    height: auto;
    inset: auto 0 0 0;
    padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
    border-right: none;
    border-top: 1px solid var(--border2);
    background: rgba(15, 23, 18, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 -8px 24px -8px rgba(0, 0, 0, 0.5);
  }
  .sidebar-brand,
  .sidebar-footer {
    display: none;
  }
  .sidebar-list {
    flex-direction: row;
    padding: 0;
    gap: 0;
    width: 100%;
    justify-content: space-around;
  }
  .nav-link {
    flex-direction: column;
    gap: 4px;
    padding: 8px 4px;
    min-width: 64px;
    min-height: 52px;
    justify-content: center;
    border-radius: 12px;
  }
  .nav-link-active::before {
    display: none;
  }
  .nav-label {
    font-size: 11px;
    font-weight: 500;
  }
}
`;
