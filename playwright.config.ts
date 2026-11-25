import { defineConfig, devices } from "playwright/test";

/**
 * Playwright configuration — end-to-end tests.
 *
 * Tests run against the production build (`next start`) to match the
 * deployed environment as closely as possible.
 *
 * Run:
 *   npm run build && npm test          # end-to-end suite
 *   npm run test:contract              # provider contract tests (no server, no network)
 *   npm run test:ui                    # interactive UI mode
 *
 * SAFETY: the suite starts its own server on a dedicated port with every
 * provider credential blanked, so no test can reach Stripe, MailerLite,
 * Resend or Google — whatever `.env.local` contains. Variables set in the
 * process environment take precedence over `.env*` files, and an empty value
 * counts as set. It never reuses a server that is already running, because
 * that server may hold live credentials.
 */
const PORT = Number(process.env.TEST_PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

const BLANKED_PROVIDER_ENV = {
  NEWSLETTER_PROVIDER: "",
  MAILERLITE_API_KEY: "",
  MAILERLITE_GROUP_ID: "",
  CONTACT_EMAIL_PROVIDER: "",
  RESEND_API_KEY: "",
  STRIPE_SECRET_KEY: "",
  STRIPE_DONATION_PAYMENT_LINK: "",
  STRIPE_SHIPPING_RATE_ID: "",
  STRIPE_AUTOMATIC_TAX: "",
  CHECKOUT_SHIPPING_COUNTRIES: "",
  GOOGLE_CALENDAR_ICAL_URL: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  ERROR_REPORT_WEBHOOK_URL: "",
};

export default defineConfig({
  testDir: "./tests",
  // Contract tests have their own config (playwright.contract.config.ts).
  testIgnore: "**/contract/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
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

  // Start a dedicated production server for the run. Skipped when BASE_URL
  // points the suite at an environment you have prepared yourself.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: BLANKED_PROVIDER_ENV,
      },
});
