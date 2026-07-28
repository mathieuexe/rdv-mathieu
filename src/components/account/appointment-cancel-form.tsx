"use client";

import { useActionState } from "react";

import type { AccountActionState } from "@/app/compte/actions";

interface AppointmentCancelFormProps {
  appointmentId: string;
  action: (state: AccountActionState, formData: FormData) => Promise<AccountActionState>;
  disabled?: boolean;
}

const initialState: AccountActionState = {
  status: "idle",
};

export function AppointmentCancelForm({ appointmentId, action, disabled = false }: AppointmentCancelFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <textarea
        name="cancelReason"
        rows={3}
        required
        disabled={disabled || pending}
        placeholder="Indiquez la raison de l'annulation"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-600"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || pending}
        className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Annulation..." : "Annuler ce rendez-vous"}
      </button>
    </form>
  );
}
