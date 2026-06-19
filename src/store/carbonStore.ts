import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { LogEntry, Goal, Challenge } from "@/types";

interface CarbonState {
  logEntries: LogEntry[];
  goals: Goal[];
  challenges: Challenge[];
  streak: number;
  addEntry: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  toggleChallenge: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    name: "3 meatless meals this week",
    description: "Skip beef for plant-based alternatives",
    points: 50,
    completed: false,
  },
  {
    id: "c2",
    name: "Commute by public transit twice",
    description: "Bus or subway instead of driving",
    points: 30,
    completed: false,
  },
  {
    id: "c3",
    name: "Take a cold shower",
    description: "Reduces water heating energy",
    points: 20,
    completed: false,
  },
  {
    id: "c4",
    name: "No impulse online purchases",
    description: "Wait 48 h before buying anything non-essential",
    points: 40,
    completed: false,
  },
  {
    id: "c5",
    name: "Buy local produce today",
    description: "Shorter supply chain = lower footprint",
    points: 25,
    completed: false,
  },
];

export const useCarbonStore = create<CarbonState>()(
  persist(
    immer((set) => ({
      logEntries: [],
      goals: [],
      challenges: DEFAULT_CHALLENGES,
      streak: 7,

      addEntry: (entry) =>
        set((state) => {
          state.logEntries.unshift({
            ...entry,
            id: `entry_${crypto.randomUUID()}`,
            timestamp: new Date().toISOString(),
          });
        }),

      addGoal: (goal) =>
        set((state) => {
          state.goals.unshift({
            ...goal,
            id: `goal_${crypto.randomUUID()}`,
            createdAt: new Date().toISOString(),
          });
          if (state.goals.length > 10) state.goals = state.goals.slice(0, 10);
        }),

      toggleChallenge: (id) =>
        set((state) => {
          const challenge = state.challenges.find((c) => c.id === id);
          if (challenge) challenge.completed = !challenge.completed;
        }),

      clearAll: () =>
        set((state) => {
          state.logEntries = [];
          state.goals = [];
          state.challenges = DEFAULT_CHALLENGES;
        }),
    })),
    {
      name: "carbontrace-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
