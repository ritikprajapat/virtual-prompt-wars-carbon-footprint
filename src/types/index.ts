export type Category = "transport" | "food" | "energy" | "shopping";

export interface ActionItem {
  readonly key: string;
  readonly name: string;
  /** kg CO₂e per unit. Source: IPCC AR6, UK DEFRA 2023 */
  readonly co2PerUnit: number;
  readonly unit: string;
}

export interface LogEntry {
  readonly id: string;
  readonly category: Category;
  readonly actionKey: string;
  readonly actionName: string;
  readonly quantity: number;
  readonly co2Total: number;
  readonly timestamp: string; // ISO 8601
}

export interface Goal {
  readonly id: string;
  readonly targetKg: number;
  readonly focusArea: Category | "all";
  readonly currentKg: number;
  readonly month: string;
  readonly createdAt: string;
}

export interface Challenge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly points: number;
  readonly completed: boolean;
}

export interface SimScenario {
  readonly key: string;
  readonly label: string;
  readonly savesKgPerMonth: number;
  readonly description: string;
}

export interface WeeklyStats {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  total: number;
}
