import type { Category } from "@/types";

/**
 * Presentation metadata for an emission category.
 */
export interface CategoryMeta {
  key: Category;
  label: string;
  /** Emoji shown in pickers; always rendered with `aria-hidden`. */
  icon: string;
  /** Chart fill colour (hex; mirrors the matching CSS custom property). */
  color: string;
}

/**
 * Single source of truth for category labels, icons, and chart colours.
 * Every list of categories in the UI derives from this array so labels and
 * colours never drift between screens.
 */
export const CATEGORIES: readonly CategoryMeta[] = [
  { key: "transport", label: "Transport", icon: "🚗", color: "#4ade80" },
  { key: "food", label: "Food", icon: "🍽️", color: "#fbbf24" },
  { key: "energy", label: "Energy", icon: "⚡", color: "#22d3ee" },
  { key: "shopping", label: "Shopping", icon: "🛍️", color: "#f87171" },
] as const;

/** All category keys, in display order. */
export const CATEGORY_KEYS: readonly Category[] = CATEGORIES.map((c) => c.key);

/**
 * Focus-area options for goal setting: every category plus an "all" aggregate.
 */
export const FOCUS_OPTIONS: readonly { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All categories" },
  ...CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];
