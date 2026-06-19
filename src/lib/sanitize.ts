/** Default maximum length for sanitized prompt fragments. */
const DEFAULT_MAX_LENGTH = 500;

// C0 control characters and the DEL character — never needed in prompt data.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/**
 * Neutralise free-text before it is interpolated into an LLM prompt, reducing
 * prompt-injection surface. This strips control characters, collapses all
 * whitespace (so newline-based "ignore previous instructions" payloads can't
 * structure the prompt), replaces code-fence/backtick sequences, and truncates.
 *
 * It is a defence-in-depth measure: callers must additionally wrap the result
 * in clearly delimited data sections and instruct the model to treat it as
 * data, never instructions.
 * @param input - untrusted user-supplied text
 * @param maxLength - maximum length of the returned string
 * @returns sanitized single-line text safe to embed as prompt data
 */
export function sanitizeForPrompt(input: string, maxLength = DEFAULT_MAX_LENGTH): string {
  return input
    .replace(CONTROL_CHARS, " ")
    .replace(/`+/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
