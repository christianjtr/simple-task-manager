import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      globals: true,
      css: true,
      restoreMocks: true,
      testTimeout: 10000,
    },
  }),
);
