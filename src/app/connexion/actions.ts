"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators";

export interface PublicLoginActionState {
  status: "idle" | "error";
  message?: string;
}

export async function loginAction(
  _state: PublicLoginActionState,
  formData: FormData,
): Promise<PublicLoginActionState> {
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

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "La connexion est indisponible tant que Supabase n'est pas configuré.",
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase n'est pas configuré.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "Connexion impossible. Vérifiez vos identifiants.",
    };
  }

  redirect("/");
}
