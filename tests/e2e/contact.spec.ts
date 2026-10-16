import { test, expect } from "playwright/test";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("valid submission shows honest unavailable message, never success", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test Person");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('select[name="subject"]').selectOption("general");
    await page.locator('textarea[name="message"]').fill("This is a test message with enough characters.");

    await page.locator('button[type="submit"]').click();

    // Must NOT show a success state (no email provider configured)
    const successBlock = page.locator('[role="status"]');
    await expect(successBlock).not.toBeVisible();

    // Must show the honest unavailable message directing to email
    const errorBlock = page.locator('section[aria-labelledby] [role="alert"]').first();
    await expect(errorBlock).toContainText(/info@natalieflemons\.com/i);
  });

  test("missing required fields show field-level errors", async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    // Name error
    const nameError = page.locator("text=/enter your name/i");
    await expect(nameError).toBeVisible();

    // Email error
    const emailError = page.locator("text=/valid email/i");
    await expect(emailError).toBeVisible();
  });

  test("message too short shows field-level error", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test Person");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('select[name="subject"]').selectOption("general");
    await page.locator('textarea[name="message"]').fill("Too short");

    await page.locator('button[type="submit"]').click();

    const msgError = page.locator("text=/at least 10 characters/i");
    await expect(msgError).toBeVisible();
  });
});
