import { describe, it, expect, vi } from "vitest";
import type { KeyboardEvent } from "react";
import { nextRovingIndex, onActivateKey } from "@/lib/a11y";

function keyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

describe("nextRovingIndex", () => {
  it("returns null when there are no items to navigate", () => {
    expect(nextRovingIndex("ArrowDown", 0, 0)).toBeNull();
  });

  it("returns null for keys that should not move focus", () => {
    expect(nextRovingIndex("Tab", 1, 3)).toBeNull();
  });

  it("wraps forward and backward and jumps to the ends", () => {
    expect(nextRovingIndex("ArrowRight", 2, 3)).toBe(0);
    expect(nextRovingIndex("ArrowLeft", 0, 3)).toBe(2);
    expect(nextRovingIndex("Home", 2, 3)).toBe(0);
    expect(nextRovingIndex("End", 0, 3)).toBe(2);
  });
});

describe("onActivateKey", () => {
  it("runs the action and prevents default on Enter and Space", () => {
    for (const key of ["Enter", " "]) {
      const action = vi.fn();
      const event = keyEvent(key);
      onActivateKey(event, action);
      expect(action).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalled();
    }
  });

  it("ignores other keys", () => {
    const action = vi.fn();
    onActivateKey(keyEvent("a"), action);
    expect(action).not.toHaveBeenCalled();
  });
});
