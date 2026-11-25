import "server-only";

/*
 * Contact-form delivery. This is the provider boundary: callers get
 * "sent" | "not-configured" | "error" and never see a provider response.
 *
 *   CONTACT_EMAIL_PROVIDER=resend   enables delivery through Resend
 *   RESEND_API_KEY                  Resend API key
 *   CONTACT_EMAIL_FROM              sender; must be on a domain verified in Resend
 *   CONTACT_EMAIL_TO                recipient inbox
 */

export type ContactMessage = {
  name: string;
  email: string;
  organization?: string;
  /** Human-readable subject label, e.g. "Booking Inquiry". */
  subject: string;
  message: string;
};

export type ContactDeliveryResult = "sent" | "not-configured" | "error";

/** Resend's shared test sender. It only delivers to the Resend account owner's own address. */
const DEFAULT_FROM = "Natalie Flemons Ministries <onboarding@resend.dev>";
const DEFAULT_TO = "info@natalieflemons.com";

export async function deliverContactMessage(data: ContactMessage): Promise<ContactDeliveryResult> {
  const provider = process.env.CONTACT_EMAIL_PROVIDER;
  if (!provider) return "not-configured";

  if (provider !== "resend") {
    console.error(`[contact] Unsupported CONTACT_EMAIL_PROVIDER "${provider}"`);
    return "error";
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return "error";
  }

  // Header values are single-line; collapse anything a visitor typed across lines.
  const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_EMAIL_FROM || DEFAULT_FROM,
      to: [process.env.CONTACT_EMAIL_TO || DEFAULT_TO],
      reply_to: data.email,
      subject: `[Contact] ${oneLine(data.subject)} — ${oneLine(data.name)}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        ...(data.organization ? [`Organization: ${data.organization}`] : []),
        `Subject: ${data.subject}`,
        "",
        data.message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text());
    return "error";
  }
  return "sent";
}
