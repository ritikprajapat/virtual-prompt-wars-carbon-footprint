import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { KeyboardEvent } from "react";
import { useRovingSelection } from "@/lib/useRovingSelection";

function keyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

describe("useRovingSelection", () => {
  it("selects the next index on ArrowDown and focuses it", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useRovingSelection<HTMLDivElement>(3, onSelect));

    const el = { focus: vi.fn() } as unknown as HTMLDivElement;
    result.current.setRef(1)(el);

    const event = keyEvent("ArrowDown");
    result.current.handleKeyDown(event, 0);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(el.focus).toHaveBeenCalled();
  });

  it("wraps to the last index on ArrowUp from the first", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useRovingSelection<HTMLDivElement>(3, onSelect));
    result.current.handleKeyDown(keyEvent("ArrowUp"), 0);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("activates the current index on Enter without moving focus", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useRovingSelection<HTMLDivElement>(3, onSelect));
    result.current.handleKeyDown(keyEvent("Enter"), 2);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("ignores non-navigation, non-activation keys", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useRovingSelection<HTMLDivElement>(3, onSelect));
    result.current.handleKeyDown(keyEvent("Tab"), 1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("tolerates a missing ref for the target index", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useRovingSelection<HTMLDivElement>(2, onSelect));
    expect(() => result.current.handleKeyDown(keyEvent("End"), 0)).not.toThrow();
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
