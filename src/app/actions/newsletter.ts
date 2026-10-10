"use server";

import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/newsletter";

export type NewsletterState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldError?: string };

const schema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
  // Honeypot: real visitors never see or fill this field.
  nfm_hp: z.string().max(0).optional(),
});

export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    nfm_hp: String(formData.get("nfm_hp") ?? ""),
  });

  if (!parsed.success) {
    const honeypotTripped = parsed.error.issues.some((issue) => issue.path[0] === "nfm_hp");
    if (honeypotTripped) {
      // Respond neutrally to bots without subscribing anyone.
      return { status: "success", message: "Thank you." };
    }
    const fieldError = parsed.error.issues.find((issue) => issue.path[0] === "email")?.message;
    return { status: "error", message: "Please check your email address.", fieldError };
  }

  const result = await subscribeToNewsletter(parsed.data.email);

  switch (result) {
    case "subscribed":
      return { status: "success", message: "Thank you! You’re subscribed to ministry news and updates." };
    case "already-subscribed":
      return { status: "success", message: "You’re already on the list — thank you for staying connected." };
    case "not-configured":
      return {
        status: "error",
        message:
          "Newsletter sign-up isn’t available just yet. Please email info@natalieflemons.com and we’ll add you to the list.",
      };
    default:
      return {
        status: "error",
        message: "Something went wrong and you were not subscribed. Please try again in a moment.",
      };
  }
}
