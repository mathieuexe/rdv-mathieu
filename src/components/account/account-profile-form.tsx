"use client";

import { useActionState } from "react";
import { Save, LoaderCircle } from "lucide-react";

import type { AccountProfileActionState } from "@/app/compte/actions";
import type { UserProfileRecord } from "@/types/domain";

const initialState: AccountProfileActionState = {
  status: "idle",
};

interface AccountProfileFormProps {
  profile: UserProfileRecord;
  action: (state: AccountProfileActionState, formData: FormData) => Promise<AccountProfileActionState>;
}

export function AccountProfileForm({ profile, action }: AccountProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Prénom</span>
          <input
            name="firstName"
            defaultValue={profile.firstName}
            required
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Nom</span>
          <input
            name="lastName"
            defaultValue={profile.lastName}
            required
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        <span>Adresse email</span>
        <input
          name="email"
          type="email"
          defaultValue={profile.email}
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        <span>Numéro de téléphone</span>
        <input
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </label>

      {state.message ? (
        <div className={`rounded-md p-3 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {state.message}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{pending ? "Enregistrement..." : "Enregistrer mes informations"}</span>
        </button>
      </div>
    </form>
  );
}
