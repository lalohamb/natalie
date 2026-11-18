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
  nfm_hp: z.string().max(0).optional(),
});

const SUBJECT_LABELS: Record<string, string> = {
  booking: "Booking Inquiry",
  general: "General Question",
  other: "Other",
};

async function sendViaResend(data: {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
}): Promise<"ok" | "error"> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return "error";
  }

  const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject;
  const orgLine = data.organization ? `\nOrganization: ${data.organization}` : "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Natalie Flemons Ministries <onboarding@resend.dev>",
      to: ["info@natalieflemons.com"],
      reply_to: data.email,
      subject: `[Contact] ${subjectLabel} — ${data.name}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        orgLine,
        `Subject: ${subjectLabel}`,
        "",
        data.message,
      ].filter((l) => l !== undefined).join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text());
    return "error";
  }
  return "ok";
}

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

  const provider = process.env.CONTACT_EMAIL_PROVIDER;

  if (!provider) {
    return {
      status: "error",
      message:
        "Our contact form isn't available just yet. Please email us directly at info@natalieflemons.com and we'll respond as soon as possible.",
    };
  }

  if (provider === "resend") {
    const result = await sendViaResend(parsed.data);
    if (result === "ok") {
      return {
        status: "success",
        message: "Thank you! Your message has been sent. We'll be in touch soon.",
      };
    }
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email info@natalieflemons.com directly.",
    };
  }

  console.error(`[contact] Unsupported CONTACT_EMAIL_PROVIDER "${provider}"`);
  return {
    status: "error",
    message: "Something went wrong. Please email info@natalieflemons.com directly.",
  };
}
