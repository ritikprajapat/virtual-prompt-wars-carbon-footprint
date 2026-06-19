import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionPicker } from "@/components/logger/ActionPicker";
import { EMISSION_ACTIONS } from "@/lib/emissions";

describe("ActionPicker (roving tabindex)", () => {
  it("given a category, when rendered, then it lists that category's actions as options", () => {
    render(<ActionPicker category="transport" selectedKey={null} onSelect={() => {}} />);
    expect(screen.getAllByRole("option").length).toBe(EMISSION_ACTIONS.transport.length);
  });

  it("given no selection, when rendered, then only the first option is tabbable", () => {
    render(<ActionPicker category="food" selectedKey={null} onSelect={() => {}} />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[1]).toHaveAttribute("tabindex", "-1");
  });

  it("given focus on the first option, when ArrowDown is pressed, then the next action is selected", async () => {
    const onSelect = vi.fn();
    const first = EMISSION_ACTIONS.transport[0]!.key;
    render(<ActionPicker category="transport" selectedKey={first} onSelect={onSelect} />);
    screen.getAllByRole("option")[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onSelect).toHaveBeenCalledWith(EMISSION_ACTIONS.transport[1]);
  });

  it("given focus on an option, when Enter is pressed, then that action is selected", async () => {
    const onSelect = vi.fn();
    render(<ActionPicker category="energy" selectedKey={null} onSelect={onSelect} />);
    screen.getAllByRole("option")[0]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(EMISSION_ACTIONS.energy[0]);
  });

  it("given End is pressed, when navigating, then focus jumps to the last action", async () => {
    const onSelect = vi.fn();
    render(<ActionPicker category="shopping" selectedKey={null} onSelect={onSelect} />);
    screen.getAllByRole("option")[0]!.focus();
    await userEvent.keyboard("{End}");
    const last = EMISSION_ACTIONS.shopping[EMISSION_ACTIONS.shopping.length - 1];
    expect(onSelect).toHaveBeenCalledWith(last);
  });
});
