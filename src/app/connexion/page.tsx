import { LoginForm } from "@/components/auth/login-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader currentPath="/connexion" />

      <main className="flex-1 px-6 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center">
            <h1 className="max-w-3xl text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Connexion à votre espace
            </h1>
            <p className="mt-4 text-center text-slate-600">
              Gérez vos rendez-vous et vos informations personnelles.
            </p>

            <div className="mt-10 w-full max-w-md">
              <LoginForm action={loginAction} />
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
