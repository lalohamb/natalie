"use server";

import { z } from "zod";

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
  // Honeypot — must be empty
  nfm_hp: z.string().max(0).optional(),
});

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
    // Honeypot tripped — respond neutrally
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

  // Email delivery is not yet configured (no RESEND_API_KEY / email provider).
  // Return an honest message — never claim the inquiry was delivered.
  const provider = process.env.CONTACT_EMAIL_PROVIDER;
  if (!provider) {
    return {
      status: "error",
      message:
        "Our contact form isn't available just yet. Please email us directly at info@natalieflemons.com and we'll respond as soon as possible.",
    };
  }

  // Placeholder for future Resend / email provider integration
  console.error(`[contact] Unsupported CONTACT_EMAIL_PROVIDER "${provider}"`);
  return {
    status: "error",
    message: "Something went wrong. Please email info@natalieflemons.com directly.",
  };
}
