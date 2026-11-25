import { defineConfig } from "playwright/test";

/**
 * Provider contract tests — `npm run test:contract`.
 *
 * These import the integration modules directly and replace `fetch`, so they
 * need no server, no browser and no network, and cannot reach a live account.
 * The npm script sets NODE_OPTIONS=--conditions=react-server so the modules'
 * `import "server-only"` guard resolves the way it does inside Next.js.
 */
export default defineConfig({
  testDir: "./tests/contract",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
});
