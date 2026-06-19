import { describe, it, expect } from "vitest";
import { calcCo2, EMISSION_ACTIONS, findAction } from "@/lib/emissions";

describe("calcCo2", () => {
  it("returns co2PerUnit * quantity rounded to 2dp", () => {
    expect(calcCo2(2.3, 1)).toBe(2.3);
    expect(calcCo2(2.3, 3)).toBe(6.9);
    expect(calcCo2(0.45, 7)).toBe(3.15);
  });
  it("returns 0 for zero quantity", () => {
    expect(calcCo2(2.3, 0)).toBe(0);
  });
  it("returns 0 for negative quantity", () => {
    expect(calcCo2(2.3, -1)).toBe(0);
  });
  it("handles zero co2PerUnit (walking)", () => {
    expect(calcCo2(0, 5)).toBe(0);
  });
  it("handles negative co2PerUnit (LED savings)", () => {
    expect(calcCo2(-0.3, 1)).toBe(-0.3);
    expect(calcCo2(-0.3, 3)).toBe(-0.9);
  });
  it("handles large quantity (international flight * 10)", () => {
    expect(calcCo2(920, 10)).toBe(9200);
  });
  it("rounds to 2 decimal places", () => {
    expect(calcCo2(0.45, 3)).toBe(1.35);
    expect(calcCo2(6.8, 3)).toBe(20.4);
  });
  it("all 25 actions have valid co2PerUnit numbers", () => {
    for (const [, actions] of Object.entries(EMISSION_ACTIONS)) {
      for (const action of actions) {
        expect(typeof action.co2PerUnit).toBe("number");
        expect(isNaN(action.co2PerUnit)).toBe(false);
        expect(action.co2PerUnit).toBeGreaterThanOrEqual(-100);
      }
    }
  });
  it("calcCo2 with decimal quantity", () => {
    expect(calcCo2(2.3, 0.5)).toBe(1.15);
    expect(calcCo2(0.45, 2.5)).toBe(1.13);
  });
});

describe("EMISSION_ACTIONS structure", () => {
  it("has all 4 categories", () => {
    expect(EMISSION_ACTIONS).toHaveProperty("transport");
    expect(EMISSION_ACTIONS).toHaveProperty("food");
    expect(EMISSION_ACTIONS).toHaveProperty("energy");
    expect(EMISSION_ACTIONS).toHaveProperty("shopping");
  });
  it("each action has required fields", () => {
    for (const [, actions] of Object.entries(EMISSION_ACTIONS)) {
      for (const action of actions) {
        expect(action.key).toBeTruthy();
        expect(action.name).toBeTruthy();
        expect(action.unit).toBeTruthy();
      }
    }
  });
  it("has at least 5 actions per category", () => {
    for (const [, actions] of Object.entries(EMISSION_ACTIONS)) {
      expect(actions.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("findAction", () => {
  it("given a known category and key, when looked up, then returns the action", () => {
    const action = findAction("transport", "car_10km");
    expect(action).toBeDefined();
    expect(action?.name).toBe("Drove car (per 10 km)");
  });
  it("given an unknown key, when looked up, then returns undefined", () => {
    expect(findAction("transport", "does_not_exist")).toBeUndefined();
  });
  it("given a key from another category, when looked up, then returns undefined", () => {
    // beef_meal exists in food, not transport
    expect(findAction("transport", "beef_meal")).toBeUndefined();
    expect(findAction("food", "beef_meal")).toBeDefined();
  });
  it("given every defined action, when looked up by its own key, then it is found", () => {
    for (const [category, actions] of Object.entries(EMISSION_ACTIONS)) {
      for (const action of actions) {
        expect(findAction(category as keyof typeof EMISSION_ACTIONS, action.key)).toBe(action);
      }
    }
  });
});
