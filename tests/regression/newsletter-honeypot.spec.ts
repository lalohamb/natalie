import { test, expect } from "playwright/test";

/**
 * Regression: newsletter honeypot field behavior.
 *
 * The honeypot field (nfm_hp) is hidden from real users.
 * When filled by a bot, the server action returns a neutral "Thank you."
 * response — intentional deception so bots don't know they were blocked.
 * The real subscriber is never added to the list.
 *
 * The honeypot field itself must not be reachable by keyboard (tabIndex -1)
 * and must not be visible to real users (hidden attribute).
 */
test.describe("Newsletter honeypot regression", () => {
  test("honeypot field is not visible or reachable by keyboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#newsletter", { timeout: 10_000 });
    await page.locator("#newsletter").scrollIntoViewIfNeeded();

    const honeypot = page.locator('input[name="nfm_hp"]');

    // Must not be visible to real users (hidden attribute on container)
    await expect(honeypot).not.toBeVisible();

    // tabIndex must be -1 so keyboard users cannot reach it
    const tabIndex = await honeypot.getAttribute("tabindex");
    expect(tabIndex).toBe("-1");
  });

  test("filling the honeypot returns a neutral response, never a real subscription", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#newsletter", { timeout: 10_000 });
    await page.locator("#newsletter").scrollIntoViewIfNeeded();

    // Fill the visible email field
    await page.locator('input[name="email"]').fill("bot@example.com");

    // Directly set the honeypot field value (simulates a bot)
    await page.evaluate(() => {
      const hp = document.querySelector<HTMLInputElement>('input[name="nfm_hp"]');
      if (hp) hp.value = "i-am-a-bot";
    });

    await page.locator('button[type="submit"]', { hasText: /sign up/i }).click();

    // The action returns a neutral "Thank you." to bots — intentional deception.
    // The real subscriber is never added. We verify the neutral message appears
    // (not a real subscription confirmation with "subscribed" language).
    const statusMsg = page.locator('[role="status"]');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toHaveText("Thank you.");
    await expect(statusMsg).not.toContainText(/subscribed/i);
  });
});
