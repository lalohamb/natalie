"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { deliverContactMessage } from "@/lib/contact-email";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export type ContactState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

const schema = z.object({
  name: z.string().min(1, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(254),
  organization: z.string().max(200).optional(),
  subject: z.enum(["booking", "general", "other"], {
    error: "Please select a subject.",
  }),
  message: z.string().min(10, "Please enter a message (at least 10 characters).").max(4000),
  nfm_hp: z.string().max(0).optional(),
});

const SUBJECT_LABELS: Record<string, string> = {
  booking: "Booking Inquiry",
  general: "General Question",
  other: "Other",
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    organization: String(formData.get("organization") ?? "").trim() || undefined,
    subject: formData.get("subject"),
    message: String(formData.get("message") ?? "").trim(),
    nfm_hp: String(formData.get("nfm_hp") ?? ""),
  });

  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "nfm_hp")) {
      return { status: "success", message: "Thank you for your message." };
    }
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please correct the errors below.", fieldErrors };
  }

  if (!limiter.hit(clientIp(await headers()))) {
    return { status: "error", message: "Too many requests. Please try again in a few minutes." };
  }

  const result = await deliverContactMessage({
    ...parsed.data,
    subject: SUBJECT_LABELS[parsed.data.subject] ?? parsed.data.subject,
  });

  switch (result) {
    case "sent":
      return {
        status: "success",
        message: "Thank you! Your message has been sent. We'll be in touch soon.",
      };
    case "not-configured":
      return {
        status: "error",
        message:
          "Our contact form isn't available just yet. Please email us directly at info@natalieflemons.com and we'll respond as soon as possible.",
      };
    default:
      return {
        status: "error",
        message: "Something went wrong sending your message. Please email info@natalieflemons.com directly.",
      };
  }
}
