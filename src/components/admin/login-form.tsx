"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Mail, Lock, Eye, EyeOff } from "@/components/icons";

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
    <form action={formAction} className="adm-card p-6 sm:p-8">
      <div className="space-y-4">
        <label className="block space-y-1.5 adm-label">
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
              className="w-full adm-input py-2.5 pl-9 pr-4 text-sm"
              placeholder="admin@exemple.com"
            />
          </div>
        </label>

        <label className="block space-y-1.5 adm-label">
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
              className="w-full adm-input py-2.5 pl-9 pr-10 text-sm"
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
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 shadow-sm px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        <span>{pending ? "Connexion en cours..." : "Se connecter"}</span>
      </button>
    </form>
  );
}
