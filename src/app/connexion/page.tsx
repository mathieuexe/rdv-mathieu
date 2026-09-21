import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicUserSession } from "@/lib/auth";

import { loginAction } from "./actions";

export default async function LoginPage() {
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
      <PublicHeader currentPath="/connexion" />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto flex max-w-[480px] flex-col items-center">
          <p className="da-eyebrow">Espace client</p>
          <h1 className="da-display mt-2 text-center text-[32px] leading-[1.15] sm:text-[42px]">
            Connexion à
            <br />
            <span className="text-accent">votre espace</span>
          </h1>
          <p className="mt-4 text-center text-[16px] leading-relaxed text-slate-500">
            Gérez vos rendez-vous et vos informations personnelles.
          </p>

          <div className="mt-10 w-full">
            <LoginForm action={loginAction} />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
