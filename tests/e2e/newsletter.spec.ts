import { test, expect } from "playwright/test";

test.describe("Newsletter form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the newsletter section to be present in the DOM
    await page.waitForSelector("#newsletter", { timeout: 10_000 });
    await page.locator("#newsletter").scrollIntoViewIfNeeded();
  });

  test("valid email shows honest not-configured message, never success", async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitBtn = page.locator('button[type="submit"]', { hasText: /sign up/i });

    await emailInput.fill("test@example.com");
    await submitBtn.click();

    // Must show an error message — never a success state
    const status = page.locator('[role="status"]');
    const errorMsg = page.locator('[aria-live="polite"]');

    // The form should NOT show a success/subscribed message
    await expect(status).not.toBeVisible();

    // Should show the honest "not available" error
    await expect(errorMsg).toContainText(/isn't available|email.*info@natalieflemons/i);
  });

  test("invalid email shows field-level error", async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitBtn = page.locator('button[type="submit"]', { hasText: /sign up/i });

    await emailInput.fill("not-an-email");
    await submitBtn.click();

    const errorRegion = page.locator('[aria-live="polite"]');
    await expect(errorRegion).toContainText(/valid email/i);

    // aria-invalid must be set on the field
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("empty email shows field-level error", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]', { hasText: /sign up/i });
    await submitBtn.click();

    const errorRegion = page.locator('[aria-live="polite"]');
    await expect(errorRegion).toContainText(/valid email/i);
  });
});
