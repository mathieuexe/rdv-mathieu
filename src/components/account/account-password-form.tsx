"use client";

import { useActionState, useMemo, useState } from "react";
import { LoaderCircle, Save, ShieldAlert } from "lucide-react";

import type { AccountPasswordActionState } from "@/app/compte/actions";

const initialState: AccountPasswordActionState = {
  status: "idle",
};

const passwordChecks = [
  {
    key: "length",
    label: "12 caractères minimum",
    test: (value: string) => value.length >= 12,
  },
  {
    key: "number",
    label: "Au moins un chiffre",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    key: "uppercase",
    label: "Au moins une majuscule",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    key: "lowercase",
    label: "Au moins une minuscule",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    key: "special",
    label: "Au moins un caractère spécial",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

interface AccountPasswordFormProps {
  action: (state: AccountPasswordActionState, formData: FormData) => Promise<AccountPasswordActionState>;
}

export function AccountPasswordForm({ action }: AccountPasswordFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const checks = useMemo(
    () =>
      passwordChecks.map((check) => ({
        ...check,
        passed: check.test(password),
      })),
    [password],
  );

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passedCount = checks.filter((check) => check.passed).length;
  const isFormValid = passedCount === 5 && passwordsMatch;

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="size-5 shrink-0 text-amber-600" />
        <p>
          Pour sécuriser votre compte, vous devez remplacer le mot de passe temporaire reçu par email avant de continuer.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Nouveau mot de passe</span>
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Confirmer le nouveau mot de passe</span>
          <input
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-900 mb-3">Règles de sécurité</p>
        <ul className="space-y-2 text-sm">
          {checks.map((check) => (
            <li key={check.key} className="flex items-center gap-2">
              <div className={`size-1.5 rounded-full ${check.passed ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className={check.passed ? "text-slate-700" : "text-slate-500"}>{check.label}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <div className={`size-1.5 rounded-full ${passwordsMatch ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className={passwordsMatch ? "text-slate-700" : "text-slate-500"}>Mots de passe identiques</span>
          </li>
        </ul>
      </div>

      {state.message ? (
        <div className={`rounded-md p-3 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {state.message}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending || !isFormValid}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{pending ? "Enregistrement..." : "Mettre à jour mon mot de passe"}</span>
        </button>
      </div>
    </form>
  );
}
