"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PublicLoginActionState } from "@/app/connexion/actions";

interface LoginFormProps {
  action: (state: PublicLoginActionState, formData: FormData) => Promise<PublicLoginActionState>;
}

const initialState: PublicLoginActionState = {
  status: "idle",
};

export default function CustomGoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const rememberedEmail =
    typeof window === "undefined" ? "" : (window.localStorage.getItem("remembered-login-email") ?? "");
  const [email, setEmail] = useState(rememberedEmail);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit() {
    if (rememberMe && email.trim()) {
      window.localStorage.setItem("remembered-login-email", email.trim());
      return;
    }

    window.localStorage.removeItem("remembered-login-email");
  }

  const handleGoogleLogin = async () => {
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
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Adresse email</span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="size-5 text-slate-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete={rememberMe ? "email" : "username"}
                placeholder="Ex: jean.dupont@email.com"
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Mot de passe</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
            <input
              name="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span>Se souvenir de moi</span>
          </label>
        </div>

        {state.message ? (
          <div className={`mt-4 rounded-md p-3 text-sm ${state.status === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>{pending ? "Connexion..." : "Se connecter"}</span>
        </button>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">OU</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <CustomGoogleIcon />
          <span>Continuer avec Google</span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Vous n&apos;avez pas de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Inscrivez-vous gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
