import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  testMatch: ["**/tests-e2e/**/*.spec.ts"],
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3020",
    /** `PW_RECORD_VIDEO=1 pnpm test:e2e` grava `.webm` em `test-results/`. */
    video: process.env.PW_RECORD_VIDEO === "1" ? "on" : "off",
    trace: "on-first-retry",
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
      },
    },
  ],
  ...(process.env.E2E_EXTERNAL_SERVER === "1"
    ? {}
    : {
        webServer: {
          command: "pnpm dev",
          url: "http://localhost:3020",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            CONSOLE_NINJA_DISABLE: "1",
            DISABLE_CONSOLE_NINJA: "1",
          },
        },
      }),
});
