import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreRing } from "@/components/ScoreRing";

describe("ScoreRing", () => {
  it("renders an accessible image with grade and value in the label", () => {
    render(<ScoreRing weeklyKg={20} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("aria-label", expect.stringContaining("20 kg"));
    expect(img.getAttribute("aria-label")).toMatch(/Grade A\+/);
  });

  it("shows the computed grade text for an average footprint", () => {
    render(<ScoreRing weeklyKg={101} />);
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("101 kg")).toBeInTheDocument();
  });

  it("uses the amber ring between 65% and 95% of the national average", () => {
    // 80 / 101 ≈ 0.79 of the national average → amber band.
    render(<ScoreRing weeklyKg={80} />);
    const grade = screen.getByText(/^[A-F][+-]?$/);
    expect((grade as HTMLElement).style.color).toBe("var(--amber)");
  });

  it("uses the red ring once at or above 95% of the national average", () => {
    render(<ScoreRing weeklyKg={101} />);
    const grade = screen.getByText("C");
    expect((grade as HTMLElement).style.color).toBe("var(--red)");
  });

  it("reports percentage of the national average", () => {
    render(<ScoreRing weeklyKg={101} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/100 percent/);
  });
});
