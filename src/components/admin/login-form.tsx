"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import type { LoginActionState } from "@/app/admin/login/actions";

interface LoginFormProps {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
}

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="border border-black p-8">
      <h1 className="text-xl font-semibold text-black">Connexion</h1>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm font-medium text-black">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-black">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-black bg-white px-4 py-3 text-black outline-none"
          />
        </label>
      </div>

      {state.message ? (
        <p className={`mt-4 text-sm ${state.status === "error" ? "text-red-600" : "text-black"}`}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        <span>{pending ? "Connexion..." : "Se connecter"}</span>
      </button>
    </form>
  );
}
