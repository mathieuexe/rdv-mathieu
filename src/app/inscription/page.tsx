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
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader currentPath="/inscription" />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto flex max-w-[520px] flex-col items-center">
          <p className="da-eyebrow">Nouveau compte</p>
          <h1 className="da-display mt-2 text-center text-[32px] leading-[1.15] sm:text-[42px]">
            Création de
            <br />
            <span className="text-accent">compte</span>
          </h1>
          <p className="mt-4 text-center text-[16px] leading-relaxed text-slate-500">
            Rejoignez-nous pour simplifier vos prises de rendez-vous.
          </p>

          <div className="mt-10 w-full">
            <SignUpForm action={signUpAction} />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
