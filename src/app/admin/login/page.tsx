import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

import { loginAction } from "./actions";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session.isAuthenticated) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-slate-900">
      <div className="w-full max-w-[440px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-accent-soft font-serif text-lg font-black text-accent">
            M
          </span>
          <p className="da-eyebrow mt-5">Back-office</p>
          <h1 className="da-display mt-2 text-[30px] leading-[1.15]">
            <span className="text-accent">Administration</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>
        </div>
        <LoginForm action={loginAction} />
      </div>
    </main>
  );
}
