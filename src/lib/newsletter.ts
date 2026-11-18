import "server-only";

export type SubscribeResult = "subscribed" | "already-subscribed" | "not-configured" | "error";

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const provider = process.env.NEWSLETTER_PROVIDER;

  if (!provider) return "not-configured";

  if (provider === "mailerlite") {
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error("[newsletter] MAILERLITE_API_KEY is not set");
      return "error";
    }

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email }),
    });

    if (res.status === 200) return "already-subscribed";
    if (res.status === 201) return "subscribed";

    console.error(`[newsletter] MailerLite error ${res.status}`, await res.text());
    return "error";
  }

  console.error(`[newsletter] Unsupported NEWSLETTER_PROVIDER "${provider}"`);
  return "error";
}
