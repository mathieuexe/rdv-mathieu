"use client";

import { useActionState } from "react";
import { Ban } from "lucide-react";

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
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <div className="flex items-center gap-2 text-rose-600 mb-2">
        <Ban className="size-4" />
        <p className="text-sm font-bold">Annuler ce rendez-vous</p>
      </div>
      <textarea
        name="cancelReason"
        rows={3}
        required
        disabled={disabled || pending}
        placeholder="Indiquez la raison de l'annulation"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500 disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      {state.message ? (
        <div className={`rounded-md p-3 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {state.message}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Annulation..." : "Confirmer l'annulation"}
        </button>
      </div>
    </form>
  );
}
