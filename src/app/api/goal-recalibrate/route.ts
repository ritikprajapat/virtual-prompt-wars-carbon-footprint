import { GoalRecalibrateSchema, GoalRecalibrateResponseSchema } from "@/lib/validators";
import { callGemini } from "@/lib/gemini";
import { createPostHandler } from "@/lib/apiHandler";

export const POST = createPostHandler({
  rateLimitKey: "goal",
  windowMs: 5000,
  schema: GoalRecalibrateSchema,
  handle: async ({ currentKg, targetKg, topCategory }) => {
    const prompt = `The user's current monthly CO₂ is ${currentKg} kg, their target is ${targetKg} kg, and their biggest category is ${topCategory}. Suggest one specific, realistic adjusted monthly goal in kg and explain why in 2 sentences. Respond as JSON: {"suggestedKg": number, "reason": "string"}. No markdown.`;
    const raw = await callGemini(prompt, 200);
    const clean = raw.replace(/```json|```/g, "").trim();
    // The model output is untrusted: validate its shape before returning it.
    return GoalRecalibrateResponseSchema.parse(JSON.parse(clean));
  },
});
