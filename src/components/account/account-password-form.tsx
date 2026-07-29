"use client";

import { useActionState, useMemo, useState } from "react";

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

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
        Pour sécuriser votre compte, vous devez remplacer le mot de passe temporaire reçu par email avant de continuer.
      </div>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span>Nouveau mot de passe</span>
        <input
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-neutral-700">
        <span>Confirmer le nouveau mot de passe</span>
        <input
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={pending}
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </label>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
        <p className="text-sm font-medium text-neutral-900">Règles de sécurité</p>
        <ul className="mt-3 space-y-2 text-sm">
          {checks.map((check) => (
            <li key={check.key} className={check.passed ? "text-emerald-700" : "text-rose-600"}>
              {check.passed ? "OK" : "KO"} - {check.label}
            </li>
          ))}
          <li className={passwordsMatch ? "text-emerald-700" : "text-rose-600"}>
            {passwordsMatch ? "OK" : "KO"} - Confirmation du mot de passe identique
          </li>
        </ul>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
      >
        {pending ? "Enregistrement..." : "Mettre à jour mon mot de passe"}
      </button>
    </form>
  );
}
