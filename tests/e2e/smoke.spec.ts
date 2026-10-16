import { test, expect } from "playwright/test";

/**
 * Smoke tests — every public route must:
 * 1. Return HTTP 200
 * 2. Render an <h1> element
 * 3. Produce no JS console errors
 *
 * /donate is excluded because it redirects to /partnerships (302 → 200).
 */

const PUBLIC_ROUTES: { path: string; expectedH1: RegExp | string }[] = [
  { path: "/", expectedH1: /shaping destinies/i },
  { path: "/about", expectedH1: /shaping destinies/i },
  { path: "/ministry", expectedH1: /equipping\. restoring\. activating\./i },
  { path: "/books", expectedH1: /books by natalie/i },
  { path: "/books/repairing-the-breach", expectedH1: /repairing the breach/i },
  { path: "/books/repair-the-breach-workbook", expectedH1: /repair the breach workbook/i },
  { path: "/books/the-midwife-to-your-destiny", expectedH1: /midwife to your destiny/i },
  { path: "/books/war-in-the-wait", expectedH1: /war in the wait/i },
  { path: "/books/from-the-chaos-to-the-call", expectedH1: /from the chaos to the call/i },
  { path: "/events", expectedH1: /events & appearances/i },
  { path: "/media", expectedH1: /messages & ministry/i },
  { path: "/store", expectedH1: /spirit · truth · strategy/i },
  { path: "/partnerships", expectedH1: /partner with the vision/i },
  { path: "/contact", expectedH1: /get in touch/i },
  { path: "/privacy", expectedH1: /privacy policy/i },
  { path: "/terms", expectedH1: /terms of use/i },
];

for (const { path, expectedH1 } of PUBLIC_ROUTES) {
  test(`${path} — renders with h1`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto(path);
    expect(response?.status(), `${path} should return 200`).toBe(200);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(expectedH1);

    expect(errors, `${path} should have no JS errors`).toHaveLength(0);
  });
}

test("/donate — redirects to /partnerships", async ({ page }) => {
  // next start follows the redirect server-side; the final response is 200
  // at /partnerships. Use waitForURL to handle the redirect chain.
  await page.goto("/donate", { waitUntil: "commit" });
  await page.waitForURL("**/partnerships", { timeout: 10_000 });
  expect(page.url()).toContain("/partnerships");
});

test("branded 404 — unknown route returns not-found page", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  // The branded not-found page renders the message in a paragraph, not h1
  const body = page.locator("body");
  await expect(body).toContainText(/could not be found/i);
});
