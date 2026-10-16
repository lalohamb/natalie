import { defineConfig, devices } from "playwright/test";

/**
 * Playwright configuration.
 *
 * Tests run against the production build (`next start`) to match the
 * deployed environment as closely as possible.
 *
 * Run:
 *   npm run build && npm test          # full suite
 *   npm run test:ui                    # interactive UI mode
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // Respect reduced-motion — tests must pass with motion disabled too
    reducedMotion: "reduce",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  // Start the production server before tests; reuse if already running
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
