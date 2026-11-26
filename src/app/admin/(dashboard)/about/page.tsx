import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { readAbout } from "@/lib/about-store";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../_components/admin-ui";
import { AboutForm } from "./about-form";

export const metadata: Metadata = { title: "About" };
export const instant = false;

export default async function AdminAboutPage() {
  await requireAdmin();
  const [data, files] = await Promise.all([readAbout(), listFiles()]);
  const imageFiles = files.filter((f) => f.kind === "image");

  return (
    <>
      <AdminPageHeader
        title="About"
        description="Edit the portrait image and bio tab content shown on the About page."
      />
      <AboutForm data={data} imageFiles={imageFiles} />
    </>
  );
}
