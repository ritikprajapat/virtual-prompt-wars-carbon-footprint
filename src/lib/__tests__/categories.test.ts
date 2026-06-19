import { describe, it, expect } from "vitest";
import { CATEGORIES, CATEGORY_KEYS, FOCUS_OPTIONS } from "@/lib/categories";
import { EMISSION_ACTIONS } from "@/lib/emissions";

describe("categories metadata", () => {
  it("given the category list, when inspected, then it covers exactly the emission categories", () => {
    expect([...CATEGORY_KEYS].sort()).toEqual(Object.keys(EMISSION_ACTIONS).sort());
  });
  it("given each category, when inspected, then it has a label, icon, and hex colour", () => {
    for (const c of CATEGORIES) {
      expect(c.label).toBeTruthy();
      expect(c.icon).toBeTruthy();
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it("given the focus options, when inspected, then they prepend 'all' to every category", () => {
    expect(FOCUS_OPTIONS[0]).toEqual({ value: "all", label: "All categories" });
    expect(FOCUS_OPTIONS.length).toBe(CATEGORIES.length + 1);
  });
});
