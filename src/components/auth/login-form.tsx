"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import type { PublicLoginActionState } from "@/app/connexion/actions";

interface LoginFormProps {
  action: (state: PublicLoginActionState, formData: FormData) => Promise<PublicLoginActionState>;
}

const initialState: PublicLoginActionState = {
  status: "idle",
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div>
      <form
        action={formAction}
        className="rounded-[32px] border border-[#d7e0ea] bg-[#f8fafc] p-8 shadow-[0_14px_32px_rgba(120,145,173,0.12)] sm:p-10"
      >
        <div className="space-y-4">
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
            placeholder="Entrez votre mot de passe"
            className="w-full rounded-2xl border border-[#a8bfd8] bg-[#f8fafc] px-5 py-4 text-lg text-[#557296] outline-none placeholder:text-[#557296]"
          />
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
