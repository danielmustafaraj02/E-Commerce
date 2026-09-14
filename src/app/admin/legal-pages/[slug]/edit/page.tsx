import { db } from "@/lib/db";
import { updateLegalPage } from "../../actions";
import { EditLegalPageForm } from "./edit-form";

const TITLES: Record<string, string> = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  returns: "Return & Refund Policy",
  cookies: "Cookie Policy",
};

export default async function EditLegalPagePage({
  params,
}: PageProps<"/admin/legal-pages/[slug]/edit">) {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });

  const boundUpdate = updateLegalPage.bind(null, slug);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit {TITLES[slug] ?? slug}</h1>
      <EditLegalPageForm
        action={boundUpdate}
        initial={{
          title: page?.title ?? TITLES[slug] ?? slug,
          content: page?.content ?? "",
        }}
      />
    </div>
  );
}
