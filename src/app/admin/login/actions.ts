"use server";

import { redirect } from "next/navigation";

import { clearDemoAdminCookie, setDemoAdminCookie } from "@/lib/auth";
import { getAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators";

export interface LoginActionState {
  status: "idle" | "error";
  message?: string;
}

export async function loginAction(_state: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.",
    };
  }

  const { email, password } = parsed.data;
  const adminEmail = getAdminEmail();

  if (!isSupabaseConfigured()) {
    if (email.toLowerCase() !== adminEmail || password !== "demo-admin") {
      return {
        status: "error",
        message: "Utilisez l'email admin et le mot de passe de démonstration `demo-admin`.",
      };
    }

    await setDemoAdminCookie();
    redirect("/admin");
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase n'est pas configuré.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || data.user?.email?.toLowerCase() !== adminEmail) {
    await clearDemoAdminCookie();

    return {
      status: "error",
      message: "Accès refusé. Vérifiez vos identifiants administrateur.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase?.auth.signOut();
  }

  await clearDemoAdminCookie();
  redirect("/admin/login");
}
