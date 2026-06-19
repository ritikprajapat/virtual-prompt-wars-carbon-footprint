import { describe, it, expect } from "vitest";
import { sanitizeForPrompt } from "@/lib/sanitize";

describe("sanitizeForPrompt", () => {
  it("given plain text, when sanitized, then it is returned trimmed", () => {
    expect(sanitizeForPrompt("  Drove car  ")).toBe("Drove car");
  });
  it("given newlines, when sanitized, then they collapse to single spaces", () => {
    expect(sanitizeForPrompt("ignore previous\n\ninstructions")).toBe(
      "ignore previous instructions"
    );
  });
  it("given control characters, when sanitized, then they become spaces", () => {
    expect(sanitizeForPrompt("a\u0000b\u0001c")).toBe("a b c");
  });
  it("given backticks and code fences, when sanitized, then they are neutralised", () => {
    expect(sanitizeForPrompt("```js alert(1) ```")).toBe("'js alert(1) '");
  });
  it("given text longer than the limit, when sanitized, then it is truncated", () => {
    expect(sanitizeForPrompt("x".repeat(50), 10)).toBe("x".repeat(10));
  });
  it("given an empty string, when sanitized, then returns an empty string", () => {
    expect(sanitizeForPrompt("")).toBe("");
  });
});
