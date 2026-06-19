import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryPicker } from "@/components/logger/CategoryPicker";

describe("CategoryPicker (roving tabindex)", () => {
  it("given no selection, when rendered, then only the first radio is in the tab order", () => {
    render(<CategoryPicker selected={null} onSelect={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
  });

  it("given focus on the first radio, when ArrowRight is pressed, then the next category is selected", async () => {
    const onSelect = vi.fn();
    render(<CategoryPicker selected="transport" onSelect={onSelect} />);
    const radios = screen.getAllByRole("radio");
    radios[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenCalledWith("food");
  });

  it("given focus on the first radio, when ArrowLeft is pressed, then it wraps to the last category", async () => {
    const onSelect = vi.fn();
    render(<CategoryPicker selected="transport" onSelect={onSelect} />);
    screen.getAllByRole("radio")[0]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onSelect).toHaveBeenCalledWith("shopping");
  });

  it("given focus on a radio, when Enter is pressed, then that category is selected", async () => {
    const onSelect = vi.fn();
    render(<CategoryPicker selected={null} onSelect={onSelect} />);
    screen.getAllByRole("radio")[0]!.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("transport");
  });
});
