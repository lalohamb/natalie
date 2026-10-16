import { test, expect } from "playwright/test";

test.describe("Navigation", () => {
  test("main nav links all resolve without 404", async ({ page }) => {
    await page.goto("/");

    const navLinks = page.locator("header nav a");
    const count = await navLinks.count();
    expect(count, "main nav should have links").toBeGreaterThan(0);

    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/")) hrefs.push(href);
    }

    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status(), `${href} should return 200`).toBe(200);
    }
  });

  test("footer nav links all resolve without 404", async ({ page }) => {
    await page.goto("/");

    const footerLinks = page.locator("footer a[href^='/']");
    const count = await footerLinks.count();
    expect(count, "footer should have internal links").toBeGreaterThan(0);

    const hrefs = new Set<string>();
    for (let i = 0; i < count; i++) {
      const href = await footerLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("/#")) hrefs.add(href);
    }

    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status(), `footer link ${href} should return 200`).toBe(200);
    }
  });

  test("skip link is present and navigates to #main", async ({ page }) => {
    await page.goto("/");

    // Tab once to reveal the skip link
    await page.keyboard.press("Tab");
    const skipLink = page.locator("a[href='#main']");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await skipLink.click();
    const main = page.locator("#main");
    await expect(main).toBeFocused();
  });

  test("Give CTA in header links to /donate", async ({ page }) => {
    await page.goto("/");
    // The Give CTA is desktop-only (lg:inline-flex hidden on mobile).
    // Check the href directly without requiring visibility.
    const giveCta = page.locator("header a[href='/donate']").first();
    const href = await giveCta.getAttribute("href");
    expect(href).toBe("/donate");
  });

  test("legacy /booking redirect resolves to /events", async ({ page }) => {
    const response = await page.goto("/booking");
    expect(page.url()).toContain("/events");
    expect(response?.status()).toBe(200);
  });
});
