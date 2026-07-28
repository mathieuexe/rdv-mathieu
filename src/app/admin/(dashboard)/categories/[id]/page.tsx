import { notFound } from "next/navigation";

import { CategoryEditorForm } from "@/components/admin/category-editor-form";
import { getCategoryById } from "@/lib/data-access";

import { saveCategoryAction } from "../../actions";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <CategoryEditorForm
      action={saveCategoryAction}
      category={category}
      title={`Modifier ${category.title}`}
      returnPath={`/admin/categories/${category.id}`}
      saved={saved === "1"}
      error={error}
    />
  );
}
