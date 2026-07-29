"use client";

import { useActionState } from "react";

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
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-neutral-700">
          <span>Prénom</span>
          <input
            name="firstName"
            defaultValue={profile.firstName}
            required
            disabled={pending}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-neutral-700">
          <span>Nom</span>
          <input
            name="lastName"
            defaultValue={profile.lastName}
            required
            disabled={pending}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span>Email</span>
        <input
          name="email"
          type="email"
          defaultValue={profile.email}
          required
          disabled={pending}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span>Numéro de téléphone</span>
        <input
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          required
          disabled={pending}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
      >
        {pending ? "Enregistrement..." : "Enregistrer mes informations"}
      </button>
    </form>
  );
}
