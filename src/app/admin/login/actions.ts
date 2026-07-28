"use server";

import { redirect } from "next/navigation";

import { isUserAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
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

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "L'administration est indisponible tant que Supabase n'est pas configure.",
    };
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

  const isAdmin = data.user ? await isUserAdmin(data.user.id) : false;

  if (error || !isAdmin) {
    return {
      status: "error",
      message: "Accès refusé. Ce compte n'est pas autorisé à accéder à l'administration.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase?.auth.signOut();
  }

  redirect("/admin/login");
}
