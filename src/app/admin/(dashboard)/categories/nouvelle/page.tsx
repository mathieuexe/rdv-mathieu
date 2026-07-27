import { CategoryEditorForm } from "@/components/admin/category-editor-form";

import { saveCategoryAction } from "../../actions";

export default function NewCategoryPage() {
  return <CategoryEditorForm action={saveCategoryAction} title="Créer une catégorie de rendez-vous" />;
}
