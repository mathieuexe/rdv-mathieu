import Link from "next/link";

import { SignUpForm } from "@/components/auth/signup-form";

import { signUpAction } from "./actions";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4">
            Retour
          </Link>
          <Link href="/connexion" className="text-sm underline underline-offset-4">
            Se connecter
          </Link>
        </header>

        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-xl">
            <SignUpForm action={signUpAction} />
          </div>
        </div>
      </div>
    </main>
  );
}
