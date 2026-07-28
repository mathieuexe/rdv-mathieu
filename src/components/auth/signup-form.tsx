"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";

import type { SignUpActionState } from "@/app/inscription/actions";

interface SignUpFormProps {
  action: (state: SignUpActionState, formData: FormData) => Promise<SignUpActionState>;
}

const initialState: SignUpActionState = {
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

export function SignUpForm({ action }: SignUpFormProps) {
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

  const passedCount = checks.filter((check) => check.passed).length;
  const strengthLabel = passedCount === 5 ? "Robuste" : passedCount >= 3 ? "Moyenne" : "Faible";
  const strengthWidth = `${(passedCount / checks.length) * 100}%`;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div>
      <form
        action={formAction}
        className="rounded-[32px] border border-[#d7e0ea] bg-[#f8fafc] p-8 shadow-[0_14px_32px_rgba(120,145,173,0.12)] sm:p-10"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="firstName"
            type="text"
            required
            placeholder="Votre prenom"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />
          <input
            name="lastName"
            type="text"
            required
            placeholder="Votre nom"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />
        </div>

        <div className="mt-4 space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Entrez votre e-mail"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />

          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Choisissez votre mot de passe"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />

          <input
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmez votre mot de passe"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-[#d7e0ea] bg-white/70 p-5">
          <p className="text-sm font-medium text-[#113b67]">Robustesse du mot de passe : {strengthLabel}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe7f0]">
            <div className="h-full rounded-full bg-[#1473f6] transition-all" style={{ width: strengthWidth }} />
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            {checks.map((check) => (
              <li key={check.key} className={check.passed ? "text-green-600" : "text-red-600"}>
                {check.passed ? "OK" : "KO"} - {check.label}
              </li>
            ))}
            <li className={passwordsMatch ? "text-green-600" : "text-red-600"}>
              {passwordsMatch ? "OK" : "KO"} - Confirmation du mot de passe identique
            </li>
          </ul>
        </div>

        {state.message ? (
          <p className={`mt-4 text-sm ${state.status === "error" ? "text-red-600" : "text-[#557296]"}`}>{state.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1473f6] px-6 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-5 animate-spin" /> : null}
          <span>{pending ? "Inscription..." : "Creer mon compte"}</span>
        </button>
      </form>

      <p className="mt-10 text-center text-xl text-[#113b67]">
        Vous avez deja un compte ?
      </p>
      <p className="mt-2 text-center text-xl font-semibold">
        <Link href="/connexion" className="text-[#1473f6] underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
