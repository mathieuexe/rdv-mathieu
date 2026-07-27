import { notFound } from "next/navigation";

import { CategoryEditorForm } from "@/components/admin/category-editor-form";
import { getCategoryById } from "@/lib/data-access";

import { saveCategoryAction } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryEditorForm action={saveCategoryAction} category={category} title={`Modifier ${category.title}`} />;
}
