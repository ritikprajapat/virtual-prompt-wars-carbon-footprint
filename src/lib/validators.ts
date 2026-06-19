import { z } from "zod";

export const CategorySchema = z.enum(["transport", "food", "energy", "shopping"]);

export const LogActivitySchema = z.object({
  category: CategorySchema,
  actionKey: z.string().min(1).max(50),
  actionName: z.string().min(1).max(100),
  quantity: z.number().positive().max(10000),
  co2PerUnit: z.number().min(-100).max(10000),
});

export const GoalSchema = z.object({
  targetKg: z.number().min(10).max(5000),
  focusArea: z.union([CategorySchema, z.literal("all")]),
});

export const TipRequestSchema = z.object({
  actionName: z.string().min(1).max(100),
  quantity: z.number().positive().max(10000),
  co2Total: z.number().min(-100).max(100000),
  category: CategorySchema,
});

export const InsightsRequestSchema = z.object({
  summary: z.string().min(1).max(500),
});

export const GoalRecalibrateSchema = z.object({
  currentKg: z.number().min(0).max(100000),
  targetKg: z.number().min(10).max(5000),
  topCategory: CategorySchema,
});

/**
 * Shape the AI must return for a goal recalibration. The model output is
 * untrusted, so it is validated against this schema before being sent to the
 * client.
 */
export const GoalRecalibrateResponseSchema = z.object({
  suggestedKg: z.number().min(0).max(100000),
  reason: z.string().min(1).max(1000),
});
