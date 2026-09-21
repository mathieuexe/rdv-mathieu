"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, LoaderCircle, User, Mail, Lock, ShieldCheck } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import CustomGoogleIcon from "@/components/auth/login-form";
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
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSignup = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="w-full">
      <form
        action={formAction}
        className="da-card p-6 sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-[14px] font-medium text-slate-900">
            <span>Prénom</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="size-4 text-slate-400" />
              </div>
              <input
                name="firstName"
                type="text"
                required
                placeholder="Prénom"
                className="da-field py-2.5 pl-9 pr-4"
              />
            </div>
          </label>
          <label className="block space-y-2 text-[14px] font-medium text-slate-900">
            <span>Nom</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="size-4 text-slate-400" />
              </div>
              <input
                name="lastName"
                type="text"
                required
                placeholder="Nom"
                className="da-field py-2.5 pl-9 pr-4"
              />
            </div>
          </label>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-[14px] font-medium text-slate-900">
            <span>Adresse email</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="size-4 text-slate-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="Ex: jean.dupont@email.com"
                className="da-field py-2.5 pl-9 pr-4"
              />
            </div>
          </label>

          <label className="block space-y-2 text-[14px] font-medium text-slate-900">
            <span>Mot de passe</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="size-4 text-slate-400" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Mot de passe"
                className="da-field py-2.5 pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          <label className="block space-y-2 text-[14px] font-medium text-slate-900">
            <span>Confirmer le mot de passe</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <ShieldCheck className="size-4 text-slate-400" />
              </div>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Confirmation"
                className="da-field py-2.5 pl-9 pr-10"
              />
            </div>
          </label>
        </div>

        {password.length > 0 && (
          <div className="da-card mt-5 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700">Niveau de sécurité</span>
              <span className={passedCount === 5 ? "text-emerald-600" : passedCount >= 3 ? "text-amber-600" : "text-rose-600"}>
                {strengthLabel}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${passedCount === 5 ? "bg-emerald-500" : passedCount >= 3 ? "bg-amber-500" : "bg-rose-500"}`} 
                style={{ width: strengthWidth }} 
              />
            </div>

            <ul className="mt-3 space-y-1.5 text-xs">
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
        )}

        {state.message ? (
          <div className={`mt-5 rounded-xl p-3 text-[14px] ${state.status === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-blue-200 bg-accent-soft text-accent"}`}>
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending || passedCount < 5 || !passwordsMatch}
          className="da-btn da-btn-primary da-btn-sm mt-6 w-full"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>{pending ? "Inscription..." : "Créer mon compte"}</span>
        </button>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="da-eyebrow text-[12px]">OU</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="da-btn da-btn-quiet da-btn-sm mt-6 w-full font-medium"
        >
          <CustomGoogleIcon />
          <span>S&apos;inscrire avec Google</span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[15px] text-slate-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-accent transition-colors hover:text-accent-hover">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
