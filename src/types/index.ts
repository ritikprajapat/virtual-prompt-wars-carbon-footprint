export type Category = "transport" | "food" | "energy" | "shopping";

export interface ActionItem {
  key: string;
  name: string;
  /** kg CO₂e per unit. Source: IPCC AR6, UK DEFRA 2023 */
  co2PerUnit: number;
  unit: string;
}

export interface LogEntry {
  id: string;
  category: Category;
  actionKey: string;
  actionName: string;
  quantity: number;
  co2Total: number;
  timestamp: string; // ISO 8601
}

export interface Goal {
  id: string;
  targetKg: number;
  focusArea: Category | "all";
  currentKg: number;
  month: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  points: number;
  completed: boolean;
}

export interface SimScenario {
  key: string;
  label: string;
  savesKgPerMonth: number;
  description: string;
}

export interface WeeklyStats {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  total: number;
}
