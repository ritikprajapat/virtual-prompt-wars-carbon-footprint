import { describe, it, expect } from "vitest";
import { LogActivitySchema, GoalSchema, TipRequestSchema } from "@/lib/validators";

describe("LogActivitySchema", () => {
  const valid = {
    category: "transport",
    actionKey: "car_10km",
    actionName: "Drove car",
    quantity: 2,
    co2PerUnit: 2.3,
  };
  it("accepts valid input", () => {
    expect(LogActivitySchema.safeParse(valid).success).toBe(true);
  });
  it("rejects invalid category", () => {
    expect(LogActivitySchema.safeParse({ ...valid, category: "flying" }).success).toBe(false);
  });
  it("rejects zero quantity", () => {
    expect(LogActivitySchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false);
  });
  it("rejects negative quantity", () => {
    expect(LogActivitySchema.safeParse({ ...valid, quantity: -1 }).success).toBe(false);
  });
  it("rejects quantity over 10000", () => {
    expect(LogActivitySchema.safeParse({ ...valid, quantity: 10001 }).success).toBe(false);
  });
  it("rejects empty actionKey", () => {
    expect(LogActivitySchema.safeParse({ ...valid, actionKey: "" }).success).toBe(false);
  });
});

describe("GoalSchema", () => {
  it("accepts valid goal", () => {
    expect(GoalSchema.safeParse({ targetKg: 200, focusArea: "all" }).success).toBe(true);
  });
  it("accepts category focusArea", () => {
    expect(GoalSchema.safeParse({ targetKg: 100, focusArea: "food" }).success).toBe(true);
  });
  it("rejects targetKg below 10", () => {
    expect(GoalSchema.safeParse({ targetKg: 5, focusArea: "all" }).success).toBe(false);
  });
  it("rejects targetKg above 5000", () => {
    expect(GoalSchema.safeParse({ targetKg: 6000, focusArea: "all" }).success).toBe(false);
  });
});

describe("TipRequestSchema", () => {
  const valid = { actionName: "Drove car", quantity: 1, co2Total: 2.3, category: "transport" };
  it("accepts valid tip request", () => {
    expect(TipRequestSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty actionName", () => {
    expect(TipRequestSchema.safeParse({ ...valid, actionName: "" }).success).toBe(false);
  });
});
