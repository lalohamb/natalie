import { test, expect } from "playwright/test";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  const form = (page: import("playwright/test").Page) => page.locator("#contact-form");

  test("valid submission shows honest unavailable message, never success", async ({ page }) => {
    const f = form(page);
    await f.locator('input[name="name"]').fill("Test Person");
    await f.locator('input[name="email"]').fill("test@example.com");
    await f.locator('select[name="subject"]').selectOption("general");
    await f.locator('textarea[name="message"]').fill("This is a test message with enough characters.");

    await f.locator('button[type="submit"]').click();

    // Must NOT show a success state (no email provider configured)
    const successBlock = page.locator('[role="status"]');
    await expect(successBlock).not.toBeVisible();

    // Must show the honest unavailable message directing to email
    const errorBlock = f.locator('[role="alert"]').first();
    await expect(errorBlock).toContainText(/info@natalieflemons\.com/i);
  });

  test("missing required fields show field-level errors", async ({ page }) => {
    const f = form(page);
    await f.locator('button[type="submit"]').click();

    await expect(f.locator("text=/enter your name/i")).toBeVisible();
    await expect(f.locator("text=/valid email/i")).toBeVisible();
  });

  test("message too short shows field-level error", async ({ page }) => {
    const f = form(page);
    await f.locator('input[name="name"]').fill("Test Person");
    await f.locator('input[name="email"]').fill("test@example.com");
    await f.locator('select[name="subject"]').selectOption("general");
    await f.locator('textarea[name="message"]').fill("Too short");

    await f.locator('button[type="submit"]').click();

    await expect(f.locator("text=/at least 10 characters/i")).toBeVisible();
  });
});
