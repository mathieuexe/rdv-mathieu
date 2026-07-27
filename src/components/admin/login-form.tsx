"use client";

import { useActionState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";

import type { LoginActionState } from "@/app/admin/login/actions";

interface LoginFormProps {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
}

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-[32px] border border-white/15 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(8,15,33,0.45)] backdrop-blur">
      <div className="flex items-center gap-3 text-slate-100">
        <LockKeyhole className="size-5 text-cyan-300" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Connexion admin</p>
          <h2 className="text-xl font-semibold">Accéder au back-office</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm font-medium text-slate-200">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-200">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
        </label>
      </div>

      {state.message ? (
        <p className={`mt-4 text-sm ${state.status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        <span>{pending ? "Connexion..." : "Se connecter"}</span>
      </button>
    </form>
  );
}
