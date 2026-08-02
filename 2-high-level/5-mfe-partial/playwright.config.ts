import { defineConfig, devices } from '@playwright/test'

/**
 * Um único project: o UI Mode do Playwright, com vários projects, seleciona
 * só o primeiro por padrão (aí só o Vue aparecia). Cada spec define o baseURL.
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['**/tests-e2e/**/*.spec.ts'],
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    ...(process.env.CI ? {} : { channel: 'chrome' as const }),
    video: process.env.PW_RECORD_VIDEO === '1' ? 'on' : 'off',
    trace: 'on-first-retry',
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
  },
  ...(process.env.E2E_EXTERNAL_SERVER === '1'
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://127.0.0.1:5000',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
})
