import { useCallback, useRef, type KeyboardEvent } from "react";
import { onActivateKey, nextRovingIndex } from "@/lib/a11y";

/**
 * Shared keyboard behaviour for ARIA composite widgets (radiogroup, listbox)
 * that use the roving-tabindex pattern, where selection follows focus.
 *
 * Centralizes the focus-management and activation logic so each picker only
 * declares *what* selecting an index means, not *how* arrow/Home/End/Enter/Space
 * navigation works.
 *
 * @param count - number of options in the widget
 * @param onSelectIndex - called with the index to select on navigation/activation
 * @returns `setRef(index)` to register each option element, and `handleKeyDown`
 *   to wire onto each option's `onKeyDown`
 */
export function useRovingSelection<E extends HTMLElement>(
  count: number,
  onSelectIndex: (index: number) => void
) {
  const refs = useRef<(E | null)[]>([]);

  const setRef = useCallback(
    (index: number) => (el: E | null) => {
      refs.current[index] = el;
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, index: number) => {
      const next = nextRovingIndex(event.key, index, count);
      if (next !== null) {
        event.preventDefault();
        onSelectIndex(next);
        refs.current[next]?.focus();
        return;
      }
      onActivateKey(event, () => onSelectIndex(index));
    },
    [count, onSelectIndex]
  );

  return { setRef, handleKeyDown };
}
