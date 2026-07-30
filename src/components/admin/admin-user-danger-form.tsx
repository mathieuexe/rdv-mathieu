"use client";

import { useActionState, useState } from "react";
import { Ban, LoaderCircle, Trash2 } from "lucide-react";

import type { AdminUserActionState } from "@/app/admin/(dashboard)/actions";
import type { UserProfileRecord } from "@/types/domain";

interface AdminUserDangerFormProps {
  user: UserProfileRecord;
  banAction: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
  deleteAction: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
}

export function AdminUserDangerForm({ user, banAction, deleteAction }: AdminUserDangerFormProps) {
  const [banState, banFormAction, isBanPending] = useActionState(banAction, { status: "idle" });
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteAction, { status: "idle" });
  
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Block Ban */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="font-semibold text-slate-900">
            {user.isBanned ? "Débloquer cet utilisateur" : "Bannir cet utilisateur"}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {user.isBanned 
              ? "L'utilisateur pourra de nouveau accéder à son espace client et prendre des rendez-vous." 
              : "L'utilisateur pourra se connecter mais sera redirigé vers une page l'informant que son compte est bloqué."}
          </p>
        </div>
        
        {showBanConfirm ? (
          <form action={banFormAction} className="flex flex-col gap-3 min-w-[250px]">
            <input type="hidden" name="userId" value={user.userId} />
            <input type="hidden" name="isBanned" value={user.isBanned ? "false" : "true"} />
            
            {!user.isBanned && (
              <textarea 
                name="banReason"
                placeholder="Raison du bannissement (optionnel)"
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                rows={2}
              />
            )}
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBanConfirm(false)}
                disabled={isBanPending}
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isBanPending}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white ${user.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {isBanPending ? <LoaderCircle className="size-4 animate-spin" /> : <Ban className="size-4" />}
                {user.isBanned ? "Débloquer" : "Confirmer"}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowBanConfirm(true)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${user.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {user.isBanned ? "Débloquer l'utilisateur" : "Bannir l'utilisateur"}
          </button>
        )}
      </div>

      {banState.message && (
        <div className={`rounded-md p-3 text-sm ${banState.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {banState.message}
        </div>
      )}

      {/* Block Delete */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-rose-700">Supprimer le compte</h3>
          <p className="text-sm text-rose-600/80 mt-1 max-w-md">
            Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées définitivement.
          </p>
        </div>
        
        {showDeleteConfirm ? (
          <form action={deleteFormAction} className="flex flex-col gap-3 min-w-[250px]">
            <input type="hidden" name="userId" value={user.userId} />
            <p className="text-xs font-medium text-rose-700">Êtes-vous absolument sûr ?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletePending}
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isDeletePending}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                {isDeletePending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Supprimer
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="shrink-0 rounded-md bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-200"
          >
            Supprimer le compte
          </button>
        )}
      </div>

      {deleteState.message && (
        <div className={`rounded-md p-3 text-sm ${deleteState.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {deleteState.message}
        </div>
      )}
    </div>
  );
}
