"use client";

import { useActionState, useState } from "react";
import { Copy, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { AdminUserActionState } from "@/app/admin/(dashboard)/actions";

interface CategoryActionsProps {
  categoryId: string;
  duplicateAction: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
  deleteAction: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
}

export function CategoryActions({ categoryId, duplicateAction, deleteAction }: CategoryActionsProps) {
  const router = useRouter();
  const [duplicateState, duplicateFormAction, isDuplicatePending] = useActionState(duplicateAction, { status: "idle" });
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteAction, { status: "idle" });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // If duplication succeeds, redirect to the new category
  if (duplicateState.status === "success" && duplicateState.message) {
    router.push(`/admin/categories/${duplicateState.message}`);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <form action={duplicateFormAction}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <button
            type="submit"
            disabled={isDuplicatePending}
            title="Dupliquer la catégorie"
            className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50"
          >
            {isDuplicatePending ? <LoaderCircle className="size-4 animate-spin" /> : <Copy className="size-4" />}
          </button>
        </form>

        {showDeleteConfirm ? (
          <form action={deleteFormAction} className="flex items-center gap-2">
            <input type="hidden" name="categoryId" value={categoryId} />
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeletePending}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isDeletePending}
              className="flex items-center justify-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              {isDeletePending ? <LoaderCircle className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Confirmer
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Supprimer la catégorie"
            className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {deleteState.status === "error" && (
        <div className="w-full rounded-md bg-rose-50 p-2 text-xs text-rose-600 border border-rose-200">
          {deleteState.message}
        </div>
      )}
      
      {duplicateState.status === "error" && (
        <div className="w-full rounded-md bg-rose-50 p-2 text-xs text-rose-600 border border-rose-200">
          {duplicateState.message}
        </div>
      )}
    </div>
  );
}