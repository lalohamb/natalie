import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Give",
  description: "Partner with Natalie Flemons Ministries.",
  alternates: { canonical: "/partnerships" },
};

/**
 * /donate is preserved for backward compatibility with existing links and
 * the legacy Squarespace site. It redirects to /partnerships which is the
 * canonical giving page on the new site.
 */
export default function DonatePage() {
  redirect("/partnerships");
}
