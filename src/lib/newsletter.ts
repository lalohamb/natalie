import "server-only";

export type SubscribeResult = "subscribed" | "already-subscribed" | "not-configured" | "error";

/**
 * Single integration point for the email-list provider. The provider has not
 * been chosen yet (IMPLEMENTATION-PLAN.md §9, decision 4), so this reports
 * `not-configured` and the form tells visitors honestly that sign-up is
 * unavailable — it never pretends a subscription succeeded.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used once a provider adapter is added
export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const provider = process.env.NEWSLETTER_PROVIDER;

  if (!provider) {
    return "not-configured";
  }

  console.error(`[newsletter] Unsupported NEWSLETTER_PROVIDER "${provider}"`);
  return "error";
}
