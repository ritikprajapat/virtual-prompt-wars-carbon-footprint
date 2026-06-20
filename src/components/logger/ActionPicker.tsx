"use client";
import { EMISSION_ACTIONS } from "@/lib/emissions";
import { useRovingSelection } from "@/lib/useRovingSelection";
import type { ActionItem, Category } from "@/types";

interface ActionPickerProps {
  category: Category;
  selectedKey: string | null;
  onSelect: (action: ActionItem) => void;
}

/**
 * Accessible action selector implementing the ARIA listbox pattern with roving
 * tabindex: only one option is tabbable, and Arrow/Home/End keys move focus and
 * selection (selection follows focus) through the actions for a category.
 */
export function ActionPicker({ category, selectedKey, onSelect }: ActionPickerProps) {
  const actions = EMISSION_ACTIONS[category];
  const selectedIndex = actions.findIndex((a) => a.key === selectedKey);
  const activeIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const { setRef, handleKeyDown } = useRovingSelection<HTMLDivElement>(actions.length, (i) =>
    onSelect(actions[i]!)
  );

  return (
    <ul
      role="listbox"
      aria-label="Available actions"
      style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}
    >
      {actions.map((a, i) => {
        const isSelected = selectedKey === a.key;
        return (
          <li key={a.key} role="none">
            <div
              ref={setRef(i)}
              role="option"
              aria-selected={isSelected}
              tabIndex={i === activeIndex ? 0 : -1}
              onClick={() => onSelect(a)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${isSelected ? "var(--green)" : "var(--border)"}`,
                background: isSelected ? "var(--green-dim)" : "transparent",
                color: isSelected ? "var(--green)" : "var(--text)",
              }}
            >
              <span style={{ fontSize: 13 }}>{a.name}</span>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 12,
                  color: "var(--text3)",
                }}
              >
                {a.co2PerUnit} kg / {a.unit}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
