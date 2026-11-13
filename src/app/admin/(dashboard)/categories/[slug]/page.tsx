import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { CategoryEditorForm } from "@/components/admin/category-editor-form";
import { EmbedCodePanel } from "@/components/admin/embed-code-panel";
import { getAdminCategoryBySlug } from "@/lib/data-access";

import { saveCategoryAction } from "../../actions";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ slug }, { saved, error }, requestHeaders] = await Promise.all([params, searchParams, headers()]);
  const category = await getAdminCategoryBySlug(slug);

  // Adresse publique du site, telle que le navigateur l'a demandée.
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "rdv.mathieucerenzia.fr";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  if (!category) {
    notFound();
  }

  return (
    <CategoryEditorForm
      action={saveCategoryAction}
      category={category}
      title={`Modifier ${category.title}`}
      returnPath={`/admin/categories/${category.slug}`}
      saved={saved === "1"}
      error={error}
      aside={<EmbedCodePanel slug={category.slug} origin={origin} />}
    />
  );
}
