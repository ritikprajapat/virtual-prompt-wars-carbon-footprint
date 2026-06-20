import { describe, it, expect } from "vitest";
import { topCategory } from "@/lib/utils";
import type { WeeklyStats } from "@/types";

function stats(partial: Partial<WeeklyStats>): WeeklyStats {
  return { transport: 0, food: 0, energy: 0, shopping: 0, total: 0, ...partial };
}

describe("topCategory", () => {
  it("returns the category with the highest weekly total", () => {
    expect(topCategory(stats({ transport: 5, food: 12, energy: 3 }))).toBe("food");
    expect(topCategory(stats({ shopping: 99 }))).toBe("shopping");
  });

  it("resolves ties to the earliest category in display order", () => {
    expect(topCategory(stats({ transport: 4, food: 4 }))).toBe("transport");
  });

  it("returns the first category when all totals are zero", () => {
    expect(topCategory(stats({}))).toBe("transport");
  });
});
