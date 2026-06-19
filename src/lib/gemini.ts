const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/** Number of attempts before giving up (covers transient 503s). */
const MAX_ATTEMPTS = 3;

/** Base backoff between retries, multiplied by the attempt number, in ms. */
const RETRY_BASE_MS = 1000;

/**
 * Call Gemini 1.5 Flash and return the generated text.
 *
 * The API key is read from the server-only `GEMINI_API_KEY` env var and sent in
 * the `x-goog-api-key` header (not the URL query string, which can leak into
 * access logs). Never import this from a client component.
 * @param prompt - the fully-assembled prompt text
 * @param maxTokens - maximum output tokens
 * @returns the trimmed model response text
 * @throws if the key is missing or all attempts fail
 */
export async function callGemini(prompt: string, maxTokens = 400): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      });

      if (res.status === 503) {
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * (attempt + 1)));
        continue;
      }

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text.trim();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error("Gemini request failed");
}
