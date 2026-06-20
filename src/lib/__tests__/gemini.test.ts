import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { callGemini } from "@/lib/gemini";

function okResponse(text: string): Response {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("callGemini", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete process.env.GEMINI_API_KEY;
  });

  it("given a missing API key, when called, then it throws", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(callGemini("hi")).rejects.toThrow(/GEMINI_API_KEY/);
  });

  it("given a successful response, when called, then it returns trimmed text and sends the key as a header", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(okResponse("  Hello world  "));
    const result = await callGemini("prompt");
    expect(result).toBe("Hello world");
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["x-goog-api-key"]).toBe("test-key");
  });

  it("given the URL, when called, then the key is not embedded in the query string", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(okResponse("ok"));
    await callGemini("prompt");
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).not.toContain("test-key");
  });

  it("given a 503 then success, when called, then it retries and returns the text", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(okResponse("recovered"));
    const promise = callGemini("prompt");
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe("recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("given persistent non-OK responses, when called, then it throws after exhausting retries", async () => {
    vi.useFakeTimers();
    // Fresh Response per attempt — a body can only be consumed once.
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(new Response("nope", { status: 400 }))
    );
    const promise = callGemini("prompt");
    const assertion = expect(promise).rejects.toThrow(/Gemini API error: 400/);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("given fetch rejects with a non-Error value, when called, then it wraps and rethrows it", async () => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockRejectedValue("network down");
    const promise = callGemini("prompt");
    const assertion = expect(promise).rejects.toThrow(/network down/);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("given an empty candidate body, when called, then it throws", async () => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(okResponse("")));
    const promise = callGemini("prompt");
    const assertion = expect(promise).rejects.toThrow(/Empty response/);
    await vi.runAllTimersAsync();
    await assertion;
  });
});
