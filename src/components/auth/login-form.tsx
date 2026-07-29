"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import type { PublicLoginActionState } from "@/app/connexion/actions";

interface LoginFormProps {
  action: (state: PublicLoginActionState, formData: FormData) => Promise<PublicLoginActionState>;
}

const initialState: PublicLoginActionState = {
  status: "idle",
};

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

  return (
    <div>
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-[#d7e0ea] bg-[#f8fafc] p-8 shadow-[0_14px_32px_rgba(120,145,173,0.12)] sm:p-10"
      >
        <div className="space-y-4">
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete={rememberMe ? "email" : "username"}
            placeholder="Entrez votre e-mail"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Entrez votre mot de passe"
              className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 pr-14 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#557296] transition hover:text-[#113b67]"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-[#557296]">
          <input
            name="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-[#a8bfd8] text-[#1473f6]"
          />
          <span>Se souvenir de moi</span>
        </label>

        {state.message ? (
          <p className={`mt-4 text-sm ${state.status === "error" ? "text-red-600" : "text-[#557296]"}`}>{state.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1473f6] px-6 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-5 animate-spin" /> : null}
          <span>{pending ? "Connexion..." : "Poursuivre"}</span>
        </button>

        <div className="mt-6 flex items-center gap-4 text-[#6a84a4]">
          <div className="h-px flex-1 bg-[#d7e0ea]" />
          <span className="text-sm font-medium">OU</span>
          <div className="h-px flex-1 bg-[#d7e0ea]" />
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#8aa3be] bg-transparent px-6 py-4 text-lg font-semibold text-[#557296] opacity-70"
        >
          <span className="text-2xl leading-none text-[#4285f4]">G</span>
          <span>Poursuivre avec Google (Bientot disponible)</span>
        </button>
      </form>

      <p className="mt-10 text-center text-xl text-[#113b67]">
        Vous n&apos;avez pas de compte ?
      </p>
      <p className="mt-2 text-center text-xl font-semibold">
        <Link href="/inscription" className="text-[#1473f6] underline underline-offset-4">
          S&apos;inscrire gratuitement
        </Link>
      </p>
    </div>
  );
}
