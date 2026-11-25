import { test, expect } from "playwright/test";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { fixture, muteConsoleError, stubFetch, withEnv } from "./helpers";

/**
 * MailerLite `POST /api/subscribers` → SubscribeResult.
 * The rule under test: only a provider-confirmed result is ever reported as
 * success; everything else is "error" or "not-configured".
 */

const CONFIGURED = { NEWSLETTER_PROVIDER: "mailerlite", MAILERLITE_API_KEY: "test-key", MAILERLITE_GROUP_ID: undefined };

test.describe("newsletter provider (MailerLite)", () => {
  let cleanup: (() => void)[] = [];
  test.afterEach(() => {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  });

  test("201 → subscribed, with the documented request", async () => {
    cleanup.push(withEnv(CONFIGURED));
    const http = stubFetch([fixture("mailerlite/subscriber-created.json")]);
    cleanup.push(http.restore);

    expect(await subscribeToNewsletter("new.subscriber@example.com")).toBe("subscribed");

    expect(http.calls).toHaveLength(1);
    const [call] = http.calls;
    expect(call.url).toBe("https://connect.mailerlite.com/api/subscribers");
    expect(call.method).toBe("POST");
    expect(call.headers["authorization"]).toBe("Bearer test-key");
    expect(call.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(call.body!)).toEqual({ email: "new.subscriber@example.com" });
  });

  test("200 → already-subscribed", async () => {
    cleanup.push(withEnv(CONFIGURED));
    const http = stubFetch([fixture("mailerlite/subscriber-exists.json")]);
    cleanup.push(http.restore);

    expect(await subscribeToNewsletter("new.subscriber@example.com")).toBe("already-subscribed");
  });

  test("MAILERLITE_GROUP_ID adds the subscriber to that group", async () => {
    cleanup.push(withEnv({ ...CONFIGURED, MAILERLITE_GROUP_ID: "123456" }));
    const http = stubFetch([fixture("mailerlite/subscriber-created.json")]);
    cleanup.push(http.restore);

    await subscribeToNewsletter("new.subscriber@example.com");
    expect(JSON.parse(http.calls[0].body!)).toEqual({ email: "new.subscriber@example.com", groups: ["123456"] });
  });

  for (const name of ["validation-error", "unauthenticated"]) {
    test(`${name} → error, never success`, async () => {
      cleanup.push(withEnv(CONFIGURED), muteConsoleError());
      const http = stubFetch([fixture(`mailerlite/${name}.json`)]);
      cleanup.push(http.restore);

      expect(await subscribeToNewsletter("someone@example.com")).toBe("error");
    });
  }

  test("provider unset → not-configured, and no request is made", async () => {
    cleanup.push(withEnv({ ...CONFIGURED, NEWSLETTER_PROVIDER: "" }));
    const http = stubFetch([]);
    cleanup.push(http.restore);

    expect(await subscribeToNewsletter("someone@example.com")).toBe("not-configured");
    expect(http.calls).toHaveLength(0);
  });

  test("missing API key or unknown provider → error, and no request is made", async () => {
    cleanup.push(muteConsoleError());
    const http = stubFetch([]);
    cleanup.push(http.restore);

    cleanup.push(withEnv({ ...CONFIGURED, MAILERLITE_API_KEY: "" }));
    expect(await subscribeToNewsletter("someone@example.com")).toBe("error");

    cleanup.push(withEnv({ ...CONFIGURED, NEWSLETTER_PROVIDER: "something-else" }));
    expect(await subscribeToNewsletter("someone@example.com")).toBe("error");

    expect(http.calls).toHaveLength(0);
  });
});
