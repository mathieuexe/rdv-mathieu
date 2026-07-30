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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
          <p className="mt-2 text-sm text-slate-500">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>
        </div>
        <LoginForm action={loginAction} />
      </div>
    </main>
  );
}
