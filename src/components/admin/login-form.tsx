"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";

import type { LoginActionState } from "@/app/admin/login/actions";

interface LoginFormProps {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
}

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Email</span>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="size-4 text-slate-400" />
            </div>
            <input
              name="email"
              type="email"
              required
              disabled={pending}
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="admin@exemple.com"
            />
          </div>
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Mot de passe</span>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="size-4 text-slate-400" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={pending}
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
      </div>

      {state.message ? (
        <div className={`mt-6 rounded-md p-3 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        <span>{pending ? "Connexion en cours..." : "Se connecter"}</span>
      </button>
    </form>
  );
}
