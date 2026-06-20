import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "e2e/",
        "src/test/",
        "src/types/**",
        // Thin Recharts presentation wrappers + dynamic loader (rendered only
        // in the browser; covered by Playwright E2E, not unit tests).
        "src/components/charts/**",
        "**/*.config.*",
      ],
      thresholds: {
        lines: 99,
        functions: 98,
        branches: 88,
        statements: 98,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
