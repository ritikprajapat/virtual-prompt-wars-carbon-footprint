/**
 * Client-side transport for the app's JSON POST endpoints.
 *
 * Centralizes the single HTTP concern shared by every AI call site — method,
 * `Content-Type`, body serialization, the ok-check, and JSON parsing — so UI
 * components depend on this abstraction instead of constructing `fetch`
 * requests and re-implementing parsing at each call site (dependency
 * inversion + single responsibility).
 *
 * @param url - the endpoint path (e.g. `"/api/tip"`)
 * @param body - the request payload, serialized as JSON
 * @returns the parsed response body on 2xx, or `null` for a non-ok response.
 *   Network/transport failures reject, so callers can distinguish a degraded
 *   service (`null`) from an unreachable one (throw).
 */
export async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}
