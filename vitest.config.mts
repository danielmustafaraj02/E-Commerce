import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Replaced by the Next compiler in the app; tests need a stand-in.
      "next/root-params": path.resolve(import.meta.dirname, "src/test/root-params-stub.ts"),
    },
  },
});
