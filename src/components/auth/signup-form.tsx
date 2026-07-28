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
    <form action={formAction} className="border border-black p-8">
      <h1 className="text-2xl font-semibold">S&apos;inscrire</h1>
      <p className="mt-2 text-sm">Créez votre compte pour enregistrer vos informations avec le rôle Prospect.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">
          <span>Prénom</span>
          <input
            name="firstName"
            type="text"
            required
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Nom</span>
          <input
            name="lastName"
            type="text"
            required
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block space-y-2 text-sm font-medium">
          <span>Adresse mail</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Confirmer le mot de passe</span>
          <input
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>
      </div>

      <div className="mt-6 border border-black p-4">
        <p className="text-sm font-medium">Robustesse du mot de passe : {strengthLabel}</p>
        <div className="mt-3 h-2 border border-black">
          <div className="h-full bg-black transition-all" style={{ width: strengthWidth }} />
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {checks.map((check) => (
            <li key={check.key} className={check.passed ? "text-black" : "text-neutral-500"}>
              {check.passed ? "OK" : "KO"} - {check.label}
            </li>
          ))}
          <li className={passwordsMatch ? "text-black" : "text-neutral-500"}>
            {passwordsMatch ? "OK" : "KO"} - Confirmation du mot de passe identique
          </li>
        </ul>
      </div>

      {state.message ? (
        <p
          className={`mt-4 text-sm ${
            state.status === "error" ? "text-red-600" : "text-black"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        <span>{pending ? "Inscription..." : "Créer mon compte"}</span>
      </button>

      <p className="mt-4 text-sm">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
