import { test, expect } from "playwright/test";
import { deliverContactMessage } from "@/lib/contact-email";
import { fixture, muteConsoleError, stubFetch, withEnv } from "./helpers";

/**
 * Resend `POST /emails` → ContactDeliveryResult.
 * The rule under test: the form may only report success when Resend accepted
 * the message.
 */

const CONFIGURED = {
  CONTACT_EMAIL_PROVIDER: "resend",
  RESEND_API_KEY: "test-key",
  CONTACT_EMAIL_FROM: undefined,
  CONTACT_EMAIL_TO: undefined,
};

const MESSAGE = {
  name: "Test Person",
  email: "visitor@example.com",
  organization: "Example Church",
  subject: "Booking Inquiry",
  message: "We would love to invite Natalie to speak.",
};

test.describe("contact email (Resend)", () => {
  let cleanup: (() => void)[] = [];
  test.afterEach(() => {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  });

  test("2xx → sent, with the documented request", async () => {
    cleanup.push(withEnv(CONFIGURED));
    const http = stubFetch([fixture("resend/email-sent.json")]);
    cleanup.push(http.restore);

    expect(await deliverContactMessage(MESSAGE)).toBe("sent");

    const [call] = http.calls;
    expect(call.url).toBe("https://api.resend.com/emails");
    expect(call.method).toBe("POST");
    expect(call.headers["authorization"]).toBe("Bearer test-key");

    const body = JSON.parse(call.body!);
    expect(body.to).toEqual(["info@natalieflemons.com"]);
    expect(body.from).toContain("onboarding@resend.dev");
    expect(body.reply_to).toBe("visitor@example.com");
    expect(body.subject).toBe("[Contact] Booking Inquiry — Test Person");
    expect(body.text).toContain("Organization: Example Church");
    expect(body.text).toContain("We would love to invite Natalie to speak.");
  });

  test("sender and recipient come from configuration when set", async () => {
    cleanup.push(
      withEnv({ ...CONFIGURED, CONTACT_EMAIL_FROM: "Website <website@example.org>", CONTACT_EMAIL_TO: "inbox@example.org" }),
    );
    const http = stubFetch([fixture("resend/email-sent.json")]);
    cleanup.push(http.restore);

    await deliverContactMessage(MESSAGE);
    const body = JSON.parse(http.calls[0].body!);
    expect(body.from).toBe("Website <website@example.org>");
    expect(body.to).toEqual(["inbox@example.org"]);
  });

  test("a name typed across lines cannot break the subject line", async () => {
    cleanup.push(withEnv(CONFIGURED));
    const http = stubFetch([fixture("resend/email-sent.json")]);
    cleanup.push(http.restore);

    await deliverContactMessage({ ...MESSAGE, name: "Test\r\nBcc: someone@example.com" });
    expect(JSON.parse(http.calls[0].body!).subject).toBe("[Contact] Booking Inquiry — Test Bcc: someone@example.com");
  });

  test("provider rejection → error, never sent", async () => {
    cleanup.push(withEnv(CONFIGURED), muteConsoleError());
    const http = stubFetch([fixture("resend/domain-not-verified.json")]);
    cleanup.push(http.restore);

    expect(await deliverContactMessage(MESSAGE)).toBe("error");
  });

  test("provider unset → not-configured, and no request is made", async () => {
    cleanup.push(withEnv({ ...CONFIGURED, CONTACT_EMAIL_PROVIDER: "" }));
    const http = stubFetch([]);
    cleanup.push(http.restore);

    expect(await deliverContactMessage(MESSAGE)).toBe("not-configured");
    expect(http.calls).toHaveLength(0);
  });

  test("missing API key or unknown provider → error, and no request is made", async () => {
    cleanup.push(muteConsoleError());
    const http = stubFetch([]);
    cleanup.push(http.restore);

    cleanup.push(withEnv({ ...CONFIGURED, RESEND_API_KEY: "" }));
    expect(await deliverContactMessage(MESSAGE)).toBe("error");

    cleanup.push(withEnv({ ...CONFIGURED, CONTACT_EMAIL_PROVIDER: "smtp" }));
    expect(await deliverContactMessage(MESSAGE)).toBe("error");

    expect(http.calls).toHaveLength(0);
  });
});
