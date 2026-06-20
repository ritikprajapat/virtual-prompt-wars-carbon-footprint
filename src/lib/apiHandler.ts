import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimiter";

/**
 * Configuration for a JSON POST endpoint that is rate-limited, validates its
 * body against a Zod schema, and delegates the domain work to `handle`.
 */
export interface PostHandlerConfig<T> {
  /** Rate-limit bucket prefix, combined with the caller IP (e.g. `"tip"`). */
  rateLimitKey: string;
  /** Sustained spacing between allowed requests for this endpoint, in ms. */
  windowMs: number;
  /**
   * Maximum burst of back-to-back requests tolerated before throttling kicks
   * in (token-bucket capacity). Defaults to `1` — strict one-per-`windowMs`.
   */
  burst?: number;
  /** Schema the request body must satisfy. */
  schema: z.ZodType<T>;
  /**
   * Domain logic for the validated request. Its resolved value is serialized
   * as the 200 response body; throwing yields a 503 ("AI unavailable").
   */
  handle: (data: T) => Promise<unknown>;
}

/**
 * Build a Next.js route POST handler that centralizes the cross-cutting
 * concerns shared by every AI endpoint — rate limiting, body parsing, schema
 * validation, and uniform error responses — so each route only declares its
 * schema and domain logic (single responsibility, open for extension).
 *
 * Responses: 429 when rate-limited, 400 on invalid input, 503 when `handle`
 * throws, otherwise 200 with the handler's result as JSON.
 */
export function createPostHandler<T>({
  rateLimitKey,
  windowMs,
  burst = 1,
  schema,
  handle,
}: PostHandlerConfig<T>) {
  return async function POST(req: NextRequest): Promise<NextResponse> {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(`${rateLimitKey}:${ip}`, windowMs, burst)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body: unknown = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    try {
      const result = await handle(parsed.data);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
    }
  };
}
