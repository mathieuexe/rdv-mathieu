"use client";

import { useActionState } from "react";

import type { AdminUserActionState } from "@/app/admin/(dashboard)/actions";
import type { UserProfileRecord } from "@/types/domain";

const initialState: AdminUserActionState = {
  status: "idle",
};

interface AdminUserSecurityFormProps {
  user: UserProfileRecord;
  action: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
}

export function AdminUserSecurityForm({ user, action }: AdminUserSecurityFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="userId" value={user.userId} />

      <label className="block rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4 text-sm text-slate-700">
        <span className="flex items-start gap-3">
          <input
            name="requiresPasswordChange"
            type="checkbox"
            defaultChecked={user.requiresPasswordChange}
            disabled={pending}
            className="mt-1 size-4 rounded border-slate-300 text-slate-950"
          />
          <span>
            <span className="block font-medium text-slate-950">Forcer le changement du mot de passe</span>
            <span className="mt-1 block text-xs leading-6 text-slate-500">
              Si cette option est activée, l&apos;utilisateur devra définir un nouveau mot de passe lors de sa prochaine
              connexion.
            </span>
          </span>
        </span>
      </label>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
      >
        {pending ? "Enregistrement..." : "Mettre à jour la sécurité"}
      </button>
    </form>
  );
}
