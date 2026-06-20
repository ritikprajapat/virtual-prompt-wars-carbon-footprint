import { describe, it, expect, beforeEach } from "vitest";
import { useCarbonStore } from "@/store/carbonStore";

describe("carbonStore", () => {
  beforeEach(() => {
    useCarbonStore.getState().clearAll();
  });

  it("starts with empty entries and goals and default challenges", () => {
    const s = useCarbonStore.getState();
    expect(s.logEntries).toEqual([]);
    expect(s.goals).toEqual([]);
    expect(s.challenges.length).toBe(5);
    expect(s.challenges.every((c) => !c.completed)).toBe(true);
  });

  it("addEntry prepends an entry with generated id and timestamp", () => {
    useCarbonStore.getState().addEntry({
      category: "transport",
      actionKey: "car_10km",
      actionName: "Drove car",
      quantity: 2,
      co2Total: 4.6,
    });
    const [entry] = useCarbonStore.getState().logEntries;
    expect(entry).toBeDefined();
    expect(entry!.id).toMatch(/^entry_/);
    expect(entry!.timestamp).toBeTruthy();
    expect(entry!.co2Total).toBe(4.6);
  });

  it("addEntry keeps newest first", () => {
    const { addEntry } = useCarbonStore.getState();
    addEntry({ category: "food", actionKey: "a", actionName: "First", quantity: 1, co2Total: 1 });
    addEntry({ category: "food", actionKey: "b", actionName: "Second", quantity: 1, co2Total: 2 });
    const entries = useCarbonStore.getState().logEntries;
    expect(entries[0]!.actionName).toBe("Second");
  });

  it("addGoal prepends and caps the list at 10", () => {
    const { addGoal } = useCarbonStore.getState();
    for (let i = 0; i < 12; i++) {
      addGoal({ targetKg: 100 + i, focusArea: "all", currentKg: 0, month: "m" });
    }
    expect(useCarbonStore.getState().goals.length).toBe(10);
  });

  it("toggleChallenge flips completion", () => {
    const { toggleChallenge } = useCarbonStore.getState();
    const id = useCarbonStore.getState().challenges[0]!.id;
    toggleChallenge(id);
    expect(useCarbonStore.getState().challenges.find((c) => c.id === id)!.completed).toBe(true);
    toggleChallenge(id);
    expect(useCarbonStore.getState().challenges.find((c) => c.id === id)!.completed).toBe(false);
  });

  it("toggleChallenge is a no-op for an unknown id", () => {
    const before = useCarbonStore.getState().challenges.map((c) => c.completed);
    useCarbonStore.getState().toggleChallenge("does-not-exist");
    expect(useCarbonStore.getState().challenges.map((c) => c.completed)).toEqual(before);
  });

  it("clearAll resets entries, goals, and challenges", () => {
    const s = useCarbonStore.getState();
    s.addEntry({ category: "energy", actionKey: "x", actionName: "X", quantity: 1, co2Total: 1 });
    s.toggleChallenge(s.challenges[0]!.id);
    s.clearAll();
    const after = useCarbonStore.getState();
    expect(after.logEntries).toEqual([]);
    expect(after.goals).toEqual([]);
    expect(after.challenges.every((c) => !c.completed)).toBe(true);
  });
});
