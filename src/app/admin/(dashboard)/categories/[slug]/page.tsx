import { notFound } from "next/navigation";

import { CategoryEditorForm } from "@/components/admin/category-editor-form";
import { getAdminCategoryBySlug } from "@/lib/data-access";

import { saveCategoryAction } from "../../actions";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ slug }, { saved, error }] = await Promise.all([params, searchParams]);
  const category = await getAdminCategoryBySlug(slug);

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
    />
  );
}
