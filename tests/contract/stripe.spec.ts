import { test, expect } from "playwright/test";
import { donationLinkFromEnv } from "@/lib/giving";
import { checkoutFulfilment, createCheckoutSession, getPrice, listCheckoutOrders, listPaymentIntents } from "@/lib/stripe";
import { fixture, muteConsoleError, stubFetch, withEnv } from "./helpers";

/**
 * Stripe: Checkout Session creation, the read calls used by the admin
 * dashboard, and the donation-link rule.
 *
 * Which book may be bought (published + Stripe Checkout, price resolved on the
 * server) is enforced by the route and covered in tests/e2e/checkout.spec.ts.
 */

const CHECKOUT = {
  priceId: "price_test_book",
  successUrl: "https://site.test/books?purchased=1",
  cancelUrl: "https://site.test/books/sample-book",
  bookSlug: "sample-book",
  fulfilment: { shippingCountries: ["US", "CA"], automaticTax: false },
};

test.describe("Stripe Checkout Session creation", () => {
  let cleanup: (() => void)[] = [];
  test.beforeEach(() => {
    cleanup.push(withEnv({ STRIPE_SECRET_KEY: "sk_test_contract" }));
  });
  test.afterEach(() => {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  });

  test("success → Stripe URL; one unit of the given price and no amount is sent", async () => {
    const http = stubFetch([fixture("stripe/checkout-session-created.json")]);
    cleanup.push(http.restore);

    expect(await createCheckoutSession(CHECKOUT)).toEqual({ ok: true, url: "https://checkout.stripe.com/c/pay/cs_test_new" });

    const [call] = http.calls;
    expect(call.url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(call.method).toBe("POST");
    expect(call.headers["authorization"]).toBe("Bearer sk_test_contract");
    expect(call.headers["content-type"]).toBe("application/x-www-form-urlencoded");

    const sent = Object.fromEntries(new URLSearchParams(call.body!));
    expect(sent).toEqual({
      mode: "payment",
      "line_items[0][price]": "price_test_book",
      "line_items[0][quantity]": "1",
      success_url: CHECKOUT.successUrl,
      cancel_url: CHECKOUT.cancelUrl,
      "metadata[book_slug]": "sample-book",
      // A delivery address is always collected (docs/KNOWN-GAPS.md G-32).
      "shipping_address_collection[allowed_countries][0]": "US",
      "shipping_address_collection[allowed_countries][1]": "CA",
    });
    // The amount charged must come from the Stripe Price alone.
    expect(Object.keys(sent).some((key) => /amount|price_data/.test(key))).toBe(false);
  });

  test("shipping rate and Stripe Tax are sent only when configured", async () => {
    const http = stubFetch([fixture("stripe/checkout-session-created.json")]);
    cleanup.push(http.restore);

    await createCheckoutSession({
      ...CHECKOUT,
      fulfilment: { shippingCountries: ["US"], shippingRateId: "shr_test_flat", automaticTax: true },
    });
    const sent = Object.fromEntries(new URLSearchParams(http.calls[0].body!));
    expect(sent["shipping_options[0][shipping_rate]"]).toBe("shr_test_flat");
    expect(sent["automatic_tax[enabled]"]).toBe("true");
    expect(sent["shipping_address_collection[allowed_countries][0]"]).toBe("US");
    expect(sent["shipping_address_collection[allowed_countries][1]"]).toBeUndefined();
  });

  test("fulfilment settings: defaults, overrides, and bad values never switch the address off", () => {
    const env = (values: Record<string, string | undefined>) => {
      cleanup.push(withEnv({ CHECKOUT_SHIPPING_COUNTRIES: undefined, STRIPE_SHIPPING_RATE_ID: undefined, STRIPE_AUTOMATIC_TAX: undefined, ...values }));
      return checkoutFulfilment();
    };
    cleanup.push(muteConsoleError());

    expect(env({})).toEqual({ shippingCountries: ["US", "CA"], shippingRateId: undefined, automaticTax: false });
    expect(env({ CHECKOUT_SHIPPING_COUNTRIES: "us, gb ,US" }).shippingCountries).toEqual(["US", "GB"]);
    expect(env({ CHECKOUT_SHIPPING_COUNTRIES: "" }).shippingCountries).toEqual(["US", "CA"]);
    expect(env({ CHECKOUT_SHIPPING_COUNTRIES: "everywhere, 12" }).shippingCountries).toEqual(["US", "CA"]);
    expect(env({ STRIPE_SHIPPING_RATE_ID: "shr_1Abc" }).shippingRateId).toBe("shr_1Abc");
    expect(env({ STRIPE_SHIPPING_RATE_ID: "price_1Abc" }).shippingRateId).toBeUndefined();
    expect(env({ STRIPE_AUTOMATIC_TAX: "TRUE" }).automaticTax).toBe(true);
    expect(env({ STRIPE_AUTOMATIC_TAX: "yes" }).automaticTax).toBe(false);
  });

  test("checkout orders expose the delivery address wherever Stripe reports it", async () => {
    const address = { line1: "1 Main St", line2: null, city: "Dallas", state: "TX", postal_code: "75001", country: "US" };
    const session = (id: string, extra: object) => ({ id, payment_intent: null, line_items: { data: [] }, ...extra });
    const http = stubFetch([
      {
        _source: "inline",
        status: 200,
        body: {
          has_more: false,
          data: [
            session("cs_a", { payment_intent: { id: "pi_a", shipping: { name: "A Buyer", address } } }),
            session("cs_b", { collected_information: { shipping_details: { name: "B Buyer", address } } }),
            session("cs_c", { shipping_details: { name: "C Buyer", address } }),
            session("cs_d", {}),
          ],
        },
      },
    ]);
    cleanup.push(http.restore);

    const { data } = await listCheckoutOrders();
    expect(data.map((order) => order.shipping?.name ?? null)).toEqual(["A Buyer", "B Buyer", "C Buyer", null]);
    expect(data[0].shipping?.address?.postal_code).toBe("75001");
  });

  test("Stripe rejection → stripe-error, and Stripe's message is not returned", async () => {
    cleanup.push(muteConsoleError());
    const http = stubFetch([fixture("stripe/checkout-session-error.json")]);
    cleanup.push(http.restore);

    const result = await createCheckoutSession(CHECKOUT);
    expect(result).toEqual({ ok: false, reason: "stripe-error" });
    expect(JSON.stringify(result)).not.toContain("No such price");
  });

  test("a session without a URL is an error, not a redirect to nowhere", async () => {
    cleanup.push(muteConsoleError());
    const http = stubFetch([{ _source: "inline", status: 200, body: { id: "cs_test_x", url: null } }]);
    cleanup.push(http.restore);

    expect(await createCheckoutSession(CHECKOUT)).toEqual({ ok: false, reason: "stripe-error" });
  });
});


test.describe("Stripe admin reads", () => {
  let cleanup: (() => void)[] = [];
  test.beforeEach(() => {
    cleanup.push(withEnv({ STRIPE_SECRET_KEY: "sk_test_contract" }));
  });
  test.afterEach(() => {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  });

  test("payment intents: follows has_more with starting_after", async () => {
    const http = stubFetch([fixture("stripe/payment-intents-page-1.json"), fixture("stripe/payment-intents-page-2.json")]);
    cleanup.push(http.restore);

    const result = await listPaymentIntents();

    expect(result.truncated).toBe(false);
    expect(result.data.map((pi) => pi.id)).toEqual(["pi_test_001", "pi_test_002", "pi_test_003"]);
    expect(http.calls).toHaveLength(2);
    expect(http.calls[0].url).toContain("https://api.stripe.com/v1/payment_intents?limit=100");
    expect(http.calls[0].url).not.toContain("starting_after");
    expect(http.calls[1].url).toContain("starting_after=pi_test_002");
    expect(http.calls[0].headers["authorization"]).toBe("Bearer sk_test_contract");
  });

  test("checkout sessions: normalized to payment intent + product and price ids", async () => {
    const http = stubFetch([fixture("stripe/checkout-sessions.json")]);
    cleanup.push(http.restore);

    const { data, truncated } = await listCheckoutOrders();

    expect(truncated).toBe(false);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({ sessionId: "cs_test_a", productIds: ["prod_test_book"], priceIds: ["price_test_book"] });
    expect(data[0].paymentIntent?.id).toBe("pi_test_001");
    // An abandoned session has no payment intent; it must stay null, not be invented.
    expect(data[1].paymentIntent).toBeNull();
    expect(data[2].productIds).toEqual(["prod_test_donation"]);
  });

  test("price lookup: found, and 404 → null", async () => {
    const http = stubFetch([fixture("stripe/price.json"), fixture("stripe/price-not-found.json")]);
    cleanup.push(http.restore);

    const price = await getPrice("price_test_book");
    expect(price).toMatchObject({ id: "price_test_book", unit_amount: 1499, currency: "usd", active: true });
    expect(http.calls[0].url).toBe("https://api.stripe.com/v1/prices/price_test_book");

    expect(await getPrice("price_missing")).toBeNull();
  });

  test("a Stripe error is thrown, not swallowed", async () => {
    const http = stubFetch([{ _source: "inline", status: 401, body: { error: { message: "Invalid API Key provided" } } }]);
    cleanup.push(http.restore);

    await expect(listPaymentIntents()).rejects.toThrow(/Stripe \/payment_intents error 401/);
  });

  test("no secret key → throws before any request", async () => {
    cleanup.push(withEnv({ STRIPE_SECRET_KEY: "" }));
    const http = stubFetch([]);
    cleanup.push(http.restore);

    await expect(listPaymentIntents()).rejects.toThrow(/STRIPE_SECRET_KEY/);
    expect(http.calls).toHaveLength(0);
  });
});

test.describe("donation Payment Link", () => {
  let restore = () => {};
  test.afterEach(() => restore());

  const cases: [string, string | undefined, string | null][] = [
    ["donate.stripe.com link", "https://donate.stripe.com/abc123", "https://donate.stripe.com/abc123"],
    ["buy.stripe.com link", "https://buy.stripe.com/abc123", "https://buy.stripe.com/abc123"],
    ["unset", undefined, null],
    ["empty", "", null],
    ["another host", "https://example.com/give", null],
    ["look-alike host", "https://donate.stripe.com.example.com/abc", null],
    ["http", "http://donate.stripe.com/abc123", null],
    ["javascript: URL", "javascript:alert(1)", null],
    ["not a URL", "donate here", null],
  ];

  for (const [name, value, expected] of cases) {
    test(`${name} → ${expected ?? "ignored"}`, () => {
      const unmute = muteConsoleError();
      const resetEnv = withEnv({ STRIPE_DONATION_PAYMENT_LINK: value });
      restore = () => {
        resetEnv();
        unmute();
      };
      expect(donationLinkFromEnv()).toBe(expected);
    });
  }
});
