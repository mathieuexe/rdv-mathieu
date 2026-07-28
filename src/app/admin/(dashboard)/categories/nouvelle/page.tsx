import { CategoryEditorForm } from "@/components/admin/category-editor-form";

import { saveCategoryAction } from "../../actions";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  return (
    <CategoryEditorForm
      action={saveCategoryAction}
      title="Créer une catégorie de rendez-vous"
      returnPath="/admin/categories/nouvelle"
      saved={saved === "1"}
      error={error}
    />
  );
}
