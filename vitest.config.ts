import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: process.env.RUN_INTEGRATION_TESTS === "true" ? [] : ["src/**/*.integration.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
