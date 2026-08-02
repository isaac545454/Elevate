import { defineConfig, devices } from "@playwright/test";

/**
 * Specs em `./e2e` (hardlinks). testDir na raiz do monorepo / em `modules/`
 * faz o UI Mode ficar em Loading (watcher sobe até node_modules).
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3030",
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
          url: "http://localhost:3030",
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
