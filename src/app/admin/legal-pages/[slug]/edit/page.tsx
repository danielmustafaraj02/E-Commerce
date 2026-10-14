import { loadPageMeta } from "@/lib/page-meta-admin";
import { MetaEditor } from "../../../seo/meta-editor";
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

  const metaKey = `legal:${slug}`;
  const meta = await loadPageMeta([metaKey]);

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
      <section className="border-foreground/10 mt-8 flex flex-col gap-3 border-t pt-6">
        <h2 className="text-lg font-semibold">Search appearance</h2>
        <p className="text-foreground/60 text-sm">
          The title and description Google and social networks show for this page, per language.
        </p>
        <MetaEditor metaKey={metaKey} initial={meta[metaKey] ?? {}} />
      </section>
    </div>
  );
}
