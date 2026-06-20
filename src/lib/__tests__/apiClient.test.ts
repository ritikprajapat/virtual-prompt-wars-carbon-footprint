import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { postJson } from "@/lib/apiClient";

describe("postJson", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs JSON with the correct method, headers, and body", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    await postJson("/api/thing", { a: 1 });
    expect(fetchSpy).toHaveBeenCalledWith("/api/thing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it("returns the parsed body on a 2xx response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ tip: "reuse bags" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(await postJson<{ tip: string }>("/api/tip", {})).toEqual({ tip: "reuse bags" });
  });

  it("returns null for a non-ok response (degraded service)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("busy", { status: 503 }));
    expect(await postJson("/api/tip", {})).toBeNull();
  });

  it("rejects when the network is unreachable", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));
    await expect(postJson("/api/tip", {})).rejects.toThrow("offline");
  });
});
