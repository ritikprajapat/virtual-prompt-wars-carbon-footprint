"use client";
import { useRef, type KeyboardEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { onActivateKey, nextRovingIndex } from "@/lib/a11y";
import type { Category } from "@/types";

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

/**
 * Accessible category selector implementing the ARIA radiogroup pattern with
 * roving tabindex: only one option is in the tab order, and Arrow/Home/End keys
 * move focus and selection between options.
 */
export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndex = CATEGORIES.findIndex((c) => c.key === selected);
  const activeIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const next = nextRovingIndex(event.key, index, CATEGORIES.length);
    if (next !== null) {
      event.preventDefault();
      const category = CATEGORIES[next];
      if (category) {
        onSelect(category.key);
        refs.current[next]?.focus();
      }
      return;
    }
    onActivateKey(event, () => onSelect(CATEGORIES[index]!.key));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Activity category"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 12,
      }}
    >
      {CATEGORIES.map((c, i) => {
        const isSelected = selected === c.key;
        return (
          <div
            key={c.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="radio"
            aria-checked={isSelected}
            aria-label={c.label}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => onSelect(c.key)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              cursor: "pointer",
              padding: "16px 12px",
              borderRadius: 10,
              textAlign: "center",
              border: `1px solid ${isSelected ? "var(--green)" : "var(--border)"}`,
              background: isSelected ? "var(--green-dim)" : "var(--surface2)",
              color: isSelected ? "var(--green)" : "var(--text)",
            }}
          >
            <div aria-hidden="true" style={{ fontSize: 24 }}>
              {c.icon}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}
