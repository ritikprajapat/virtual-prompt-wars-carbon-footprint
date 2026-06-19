import { NextRequest, NextResponse } from "next/server";
import { GoalRecalibrateSchema, GoalRecalibrateResponseSchema } from "@/lib/validators";
import { callGemini } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`goal:${ip}`, 5000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = GoalRecalibrateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { currentKg, targetKg, topCategory } = parsed.data;
  const prompt = `The user's current monthly CO₂ is ${currentKg} kg, their target is ${targetKg} kg, and their biggest category is ${topCategory}. Suggest one specific, realistic adjusted monthly goal in kg and explain why in 2 sentences. Respond as JSON: {"suggestedKg": number, "reason": "string"}. No markdown.`;

  try {
    const raw = await callGemini(prompt, 200);
    const clean = raw.replace(/```json|```/g, "").trim();
    // The model output is untrusted: validate its shape before returning it.
    const suggestion = GoalRecalibrateResponseSchema.parse(JSON.parse(clean));
    return NextResponse.json(suggestion);
  } catch {
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }
}
