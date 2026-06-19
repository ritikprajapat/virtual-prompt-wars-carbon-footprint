import type { ActionItem, Category, SimScenario } from "@/types";

/**
 * CO₂ emission factors per unit.
 * Sources: IPCC AR6 (2022), UK DEFRA GHG Conversion Factors (2023), EPA (2023).
 */
export const EMISSION_ACTIONS: Record<Category, ActionItem[]> = {
  transport: [
    { key: "car_10km", name: "Drove car (per 10 km)", co2PerUnit: 2.3, unit: "10 km segments" },
    { key: "bus_trip", name: "Took bus or subway", co2PerUnit: 0.4, unit: "trips" },
    { key: "cycle_walk", name: "Cycled or walked", co2PerUnit: 0, unit: "trips" },
    { key: "flight_dom", name: "Domestic flight (one way)", co2PerUnit: 255, unit: "flights" },
    {
      key: "flight_intl",
      name: "International flight (one way)",
      co2PerUnit: 920,
      unit: "flights",
    },
    { key: "wfh", name: "Worked from home", co2PerUnit: 0, unit: "days" },
    { key: "carpool_10km", name: "Carpooled (per 10 km)", co2PerUnit: 1.1, unit: "10 km segments" },
    { key: "ev_trip", name: "Drove EV (per 10 km)", co2PerUnit: 0.5, unit: "10 km segments" },
  ],
  food: [
    { key: "beef_meal", name: "Beef meal", co2PerUnit: 6.8, unit: "meals" },
    { key: "chicken_meal", name: "Chicken meal", co2PerUnit: 1.6, unit: "meals" },
    { key: "veggie_meal", name: "Vegetarian meal", co2PerUnit: 0.5, unit: "meals" },
    { key: "vegan_meal", name: "Vegan meal", co2PerUnit: 0.3, unit: "meals" },
    { key: "dairy", name: "Dairy serving", co2PerUnit: 0.9, unit: "servings" },
    { key: "local_produce", name: "Local produce order", co2PerUnit: 0.2, unit: "orders" },
    { key: "food_waste", name: "Food waste", co2PerUnit: 2.5, unit: "kg wasted" },
  ],
  energy: [
    { key: "hvac_hour", name: "AC / heating", co2PerUnit: 0.8, unit: "hours" },
    { key: "electricity_kwh", name: "Electricity use", co2PerUnit: 0.45, unit: "kWh" },
    { key: "shower_10min", name: "Hot shower (10 min)", co2PerUnit: 0.5, unit: "showers" },
    { key: "led_day", name: "Used LED lighting (full day)", co2PerUnit: -0.3, unit: "days" },
    { key: "ev_charge", name: "Charged EV overnight", co2PerUnit: 1.2, unit: "charges" },
    { key: "laundry", name: "Ran washing machine", co2PerUnit: 0.6, unit: "loads" },
  ],
  shopping: [
    { key: "clothing", name: "Bought new clothing item", co2PerUnit: 10.5, unit: "items" },
    { key: "electronics", name: "Bought electronics", co2PerUnit: 70, unit: "items" },
    { key: "secondhand", name: "Bought second-hand item", co2PerUnit: 0.2, unit: "items" },
    {
      key: "delivery_fast",
      name: "Online delivery (express)",
      co2PerUnit: 2.1,
      unit: "deliveries",
    },
    {
      key: "delivery_std",
      name: "Online delivery (standard)",
      co2PerUnit: 0.8,
      unit: "deliveries",
    },
  ],
};

/**
 * O(1) lookup index: `"<category>:<actionKey>"` → {@link ActionItem}. Built once
 * at module load so per-action lookups don't linearly scan the category arrays.
 */
const ACTION_INDEX: Map<string, ActionItem> = new Map(
  (Object.entries(EMISSION_ACTIONS) as [Category, ActionItem[]][]).flatMap(([category, actions]) =>
    actions.map((action) => [`${category}:${action.key}`, action] as const)
  )
);

/**
 * Find an emission action by category and key in O(1).
 * @param category - the action's category
 * @param actionKey - the action's unique key within the category
 * @returns the matching {@link ActionItem}, or `undefined` if not found
 */
export function findAction(category: Category, actionKey: string): ActionItem | undefined {
  return ACTION_INDEX.get(`${category}:${actionKey}`);
}

/**
 * Calculate CO₂ for a given action and quantity.
 * @param co2PerUnit - kg CO₂e per unit
 * @param quantity - number of units (must be > 0)
 * @returns rounded kg CO₂e total
 */
export function calcCo2(co2PerUnit: number, quantity: number): number {
  if (quantity <= 0) return 0;
  return Math.round(co2PerUnit * quantity * 100) / 100;
}

export const SIM_SCENARIOS: SimScenario[] = [
  {
    key: "veg",
    label: "Go vegetarian (1 month)",
    savesKgPerMonth: 36.4,
    description:
      "Cutting beef and dairy saves ~36.4 kg CO₂/month — equivalent to driving 158 km less.",
  },
  {
    key: "ev",
    label: "Switch to EV",
    savesKgPerMonth: 89,
    description:
      "Switching from petrol to EV saves ~89 kg CO₂/month based on average driving patterns.",
  },
  {
    key: "wfh",
    label: "WFH 3 days/week",
    savesKgPerMonth: 27.6,
    description: "Eliminating 3 commutes/week saves ~27.6 kg CO₂/month.",
  },
  {
    key: "solar",
    label: "Add solar panels",
    savesKgPerMonth: 45,
    description:
      "A 4 kW solar system offsets ~45 kg CO₂/month, covering ~60% of average home electricity.",
  },
  {
    key: "flight",
    label: "Skip 1 flight/year",
    savesKgPerMonth: 42.5,
    description:
      "Skipping one return domestic flight saves ~510 kg CO₂/year (42.5 kg/month annualised).",
  },
];
