import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { readLegal } from "@/lib/legal-store";
import { AdminPageHeader } from "../../_components/admin-ui";
import { LegalForm } from "./legal-form";

export const metadata: Metadata = { title: "Legal" };
export const instant = false;

export default async function AdminLegalPage() {
  await requireAdmin();
  const data = await readLegal();

  return (
    <>
      <AdminPageHeader
        title="Legal"
        description="Edit the Privacy Policy and Terms of Use pages."
      />
      <LegalForm data={data} />
    </>
  );
}
