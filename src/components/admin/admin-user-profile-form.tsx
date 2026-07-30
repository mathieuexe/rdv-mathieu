"use client";

import { useActionState } from "react";

import type { AdminUserActionState } from "@/app/admin/(dashboard)/actions";
import type { UserProfileRecord } from "@/types/domain";
import { PhoneInput } from "@/components/ui/phone-input";

const initialState: AdminUserActionState = {
  status: "idle",
};

interface AdminUserProfileFormProps {
  user: UserProfileRecord;
  action: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
}

export function AdminUserProfileForm({ user, action }: AdminUserProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="userId" value={user.userId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Prénom</span>
          <input
            name="firstName"
            defaultValue={user.firstName}
            disabled={pending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Nom</span>
          <input
            name="lastName"
            defaultValue={user.lastName}
            disabled={pending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Email</span>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Téléphone</span>
        <PhoneInput
          name="phone"
          defaultValue={user.phone ?? ""}
          disabled={pending}
        />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {pending ? "Enregistrement..." : "Enregistrer le dossier"}
      </button>
    </form>
  );
}
