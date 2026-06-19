import type { KeyboardEvent } from "react";

/**
 * Invoke `action` when the user presses Enter or Space on a custom widget
 * (e.g. an element with `role="radio"`/`"option"`/`"checkbox"`), preventing the
 * default scroll-on-Space behaviour. Mirrors native control activation.
 * @param event - the React keyboard event
 * @param action - callback to run on activation
 */
export function onActivateKey(event: KeyboardEvent, action: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

/**
 * Compute the next index for arrow-key navigation within a composite widget
 * (radiogroup, listbox) implementing the roving-tabindex pattern. Returns
 * `null` for keys that should not move focus.
 *
 * Home/End jump to the first/last item; ArrowUp/Left and ArrowDown/Right move
 * one step and wrap around the ends.
 * @param key - the pressed key (`event.key`)
 * @param current - the currently focused item index
 * @param count - total number of items
 * @returns the next index, or `null` if the key is not a navigation key
 */
export function nextRovingIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowUp":
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
