import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import type { NextRequest } from "next/server";

vi.mock("@/lib/rateLimiter", () => ({ checkRateLimit: vi.fn() }));
import { checkRateLimit } from "@/lib/rateLimiter";
import { createPostHandler } from "@/lib/apiHandler";

const mockRate = vi.mocked(checkRateLimit);
const schema = z.object({ name: z.string().min(1) });

function makeReq(rawBody: string): NextRequest {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "9.9.9.9" },
    body: rawBody,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRate.mockReturnValue(true);
});

describe("createPostHandler", () => {
  it("returns 200 with the handler result for valid input", async () => {
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async ({ name }) => ({ greeting: `hi ${name}` }),
    });
    const res = await POST(makeReq(JSON.stringify({ name: "ada" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ greeting: "hi ada" });
  });

  it("returns 429 when rate-limited", async () => {
    mockRate.mockReturnValue(false);
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async () => ({ ok: true }),
    });
    expect((await POST(makeReq(JSON.stringify({ name: "x" })))).status).toBe(429);
  });

  it("returns 400 for malformed JSON body", async () => {
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async () => ({ ok: true }),
    });
    expect((await POST(makeReq("{not json"))).status).toBe(400);
  });

  it("returns 400 when the body fails schema validation", async () => {
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async () => ({ ok: true }),
    });
    expect((await POST(makeReq(JSON.stringify({ name: "" })))).status).toBe(400);
  });

  it("returns 503 when the handler throws", async () => {
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async () => {
        throw new Error("boom");
      },
    });
    expect((await POST(makeReq(JSON.stringify({ name: "x" })))).status).toBe(503);
  });

  it("passes the IP into the rate-limit key", async () => {
    const POST = createPostHandler({
      rateLimitKey: "test",
      windowMs: 1000,
      schema,
      handle: async () => ({ ok: true }),
    });
    await POST(makeReq(JSON.stringify({ name: "x" })));
    expect(mockRate).toHaveBeenCalledWith("test:9.9.9.9", 1000);
  });
});
