import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChallengeList } from "@/components/ChallengeList";
import { useCarbonStore } from "@/store/carbonStore";

describe("ChallengeList", () => {
  beforeEach(() => {
    useCarbonStore.getState().clearAll();
  });

  it("renders all challenges as checkboxes", () => {
    render(<ChallengeList />);
    expect(screen.getAllByRole("checkbox").length).toBe(5);
  });

  it("toggles a challenge on click", async () => {
    const user = userEvent.setup();
    render(<ChallengeList />);
    const first = screen.getAllByRole("checkbox")[0]!;
    expect(first).toHaveAttribute("aria-checked", "false");
    await user.click(first);
    expect(first).toHaveAttribute("aria-checked", "true");
  });

  it("toggles a challenge with the keyboard (Space)", async () => {
    const user = userEvent.setup();
    render(<ChallengeList />);
    const first = screen.getAllByRole("checkbox")[0]!;
    first.focus();
    await user.keyboard(" ");
    expect(first).toHaveAttribute("aria-checked", "true");
  });
});
