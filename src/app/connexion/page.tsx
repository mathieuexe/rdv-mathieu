import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] px-6 py-10 text-[#103b67]">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between text-sm">
          <Link href="/" className="text-[#587397] underline underline-offset-4">
            Retour
          </Link>
          <Link href="/inscription" className="text-[#587397] underline underline-offset-4">
            S&apos;inscrire
          </Link>
        </header>

        <div className="mt-10 flex flex-col items-center">
          <h1 className="max-w-3xl text-center text-5xl font-semibold leading-tight tracking-tight text-[#113b67] sm:text-6xl">
            Connectez-vous a votre compte
          </h1>

          <div className="mt-12 w-full max-w-xl">
            <LoginForm action={loginAction} />
          </div>
        </div>
      </div>
    </main>
  );
}
