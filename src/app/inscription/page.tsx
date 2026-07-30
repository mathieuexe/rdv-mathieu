import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/signup-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicUserSession } from "@/lib/auth";

import { signUpAction } from "./actions";

export default async function SignUpPage() {
  const session = await getPublicUserSession();

  if (session.isAuthenticated) {
    if (session.isAdmin) {
      redirect("/admin");
    } else {
      redirect("/compte");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader currentPath="/inscription" />

      <main className="flex-1 px-6 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center">
            <h1 className="max-w-3xl text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Création de compte
            </h1>
            <p className="mt-4 text-center text-slate-600">
              Rejoignez-nous pour simplifier vos prises de rendez-vous.
            </p>

            <div className="mt-10 w-full max-w-md">
              <SignUpForm action={signUpAction} />
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
