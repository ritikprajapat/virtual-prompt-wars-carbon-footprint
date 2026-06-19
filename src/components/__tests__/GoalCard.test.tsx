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
});
