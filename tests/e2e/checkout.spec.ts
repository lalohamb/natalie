import { test, expect } from "playwright/test";

/**
 * Regression tests for the checkout endpoint (docs/KNOWN-GAPS.md G-31).
 *
 * The endpoint must only ever sell a published catalog book at the price the
 * server looks up. These run with STRIPE_SECRET_KEY blanked (see
 * playwright.config.ts), so no Checkout Session can be created.
 */

const NO_REDIRECT = { maxRedirects: 0 };

test.describe("POST /api/checkout", () => {
  test("GET cannot start a checkout — links, crawlers and prefetchers are refused", async ({ request }) => {
    const byPrice = await request.get("/api/checkout?priceId=price_anything", NO_REDIRECT);
    expect(byPrice.status()).toBe(405);

    const bySlug = await request.get("/api/checkout?slug=anything", NO_REDIRECT);
    expect(bySlug.status()).toBe(405);
  });

  test("a price id from the browser is ignored — a slug is required", async ({ request }) => {
    const response = await request.post("/api/checkout", { ...NO_REDIRECT, form: { priceId: "price_anything" } });
    expect(response.status()).toBe(400);
  });

  test("a book that is not in the catalog cannot be bought", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      ...NO_REDIRECT,
      form: { slug: "no-such-book", priceId: "price_anything" },
    });
    expect(response.status()).toBe(404);
  });

  test("malformed slugs are rejected", async ({ request }) => {
    for (const slug of ["", "../admin", "a b", "UPPER", "x".repeat(200)]) {
      const response = await request.post("/api/checkout", { ...NO_REDIRECT, form: { slug } });
      expect(response.status(), `slug ${JSON.stringify(slug.slice(0, 20))}`).toBe(400);
    }
  });

});

/** Opens the first catalog book that has a Stripe Checkout purchase form, or returns false. */
async function openPurchasableBook(page: import("playwright/test").Page) {
  await page.goto("/books");
  const hrefs = await page.locator('main a[href^="/books/"]').evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href")!)),
  ]);
  for (const href of hrefs) {
    await page.goto(href);
    if ((await page.locator('form[action="/api/checkout"]').count()) > 0) return true;
  }
  return false;
}

test.describe("purchase UI", () => {
  test("purchase is a form POST carrying only the slug; nothing links to the endpoint", async ({ page }) => {
    await page.goto("/books");
    await expect(page.locator('a[href*="/api/checkout"]')).toHaveCount(0);

    test.skip(!(await openPurchasableBook(page)), "no book in the catalog is set up for Stripe Checkout");
    await expect(page.locator('a[href*="/api/checkout"]')).toHaveCount(0);

    const form = page.locator('form[action="/api/checkout"]').first();
    await expect(form).toHaveAttribute("method", /post/i);
    await expect(form.locator('input[name="slug"]')).toHaveCount(1);
    await expect(form.locator('input[name="priceId"]')).toHaveCount(0);
    // The page source must not advertise the endpoint to crawlers either.
    expect(await page.content()).not.toContain("api/checkout?");
  });

  test("when Stripe is unavailable the buyer is returned to the book with an honest message", async ({ page }) => {
    test.skip(!(await openPurchasableBook(page)), "no book in the catalog is set up for Stripe Checkout");

    await page.locator('form[action="/api/checkout"] button[type="submit"]').first().click();
    await page.waitForURL(/\/books\/[^/?]+\?checkout=unavailable/);
    await expect(page.locator('main [role="alert"]')).toContainText(/not been charged/i);
  });
});
