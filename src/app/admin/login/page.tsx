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
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-black">
      <div className="w-full max-w-md">
        <LoginForm action={loginAction} />
      </div>
    </main>
  );
}
