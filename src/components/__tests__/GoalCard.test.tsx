import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoalCard } from "@/components/GoalCard";
import type { Goal } from "@/types";

const goal: Goal = {
  id: "g1",
  targetKg: 200,
  focusArea: "all",
  currentKg: 80,
  month: "Jun 2026",
  createdAt: "",
};

describe("GoalCard", () => {
  it("renders a progressbar with the correct aria values", () => {
    render(
      <ul>
        <GoalCard goal={goal} />
      </ul>
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("fills the progress bar to 40%", () => {
    render(
      <ul>
        <GoalCard goal={goal} />
      </ul>
    );
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("40%");
  });

  it("uses the green fill while under 80% of budget", () => {
    render(
      <ul>
        <GoalCard goal={goal} />
      </ul>
    );
    const fill = (screen.getByRole("progressbar").firstElementChild as HTMLElement).style;
    expect(fill.background).toBe("var(--green2)");
  });

  it("uses the amber fill between 80% and 100% of budget", () => {
    render(
      <ul>
        <GoalCard goal={{ ...goal, currentKg: 180 }} />
      </ul>
    );
    const fill = (screen.getByRole("progressbar").firstElementChild as HTMLElement).style;
    expect(fill.background).toBe("var(--amber)");
  });

  it("uses the red fill and clamps to 100% once the budget is exceeded", () => {
    render(
      <ul>
        <GoalCard goal={{ ...goal, currentKg: 250 }} />
      </ul>
    );
    const bar = screen.getByRole("progressbar");
    const fill = (bar.firstElementChild as HTMLElement).style;
    expect(fill.background).toBe("var(--red)");
    expect(fill.width).toBe("100%");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("renders goal details", () => {
    render(
      <ul>
        <GoalCard goal={goal} />
      </ul>
    );
    expect(screen.getByText(/all categories/i)).toBeInTheDocument();
    expect(screen.getByText(/80 \/ 200 kg/)).toBeInTheDocument();
    expect(screen.getByText(/40% of budget used/)).toBeInTheDocument();
  });

  it("shows the raw focus area when it is not 'all'", () => {
    render(
      <ul>
        <GoalCard goal={{ ...goal, focusArea: "transport" }} />
      </ul>
    );
    expect(screen.getByText("transport")).toBeInTheDocument();
  });
});
