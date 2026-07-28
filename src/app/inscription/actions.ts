"use server";

import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validators";

export interface SignUpActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

export async function signUpAction(
  _state: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
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
      message: "L'inscription est indisponible tant que Supabase n'est pas configuré.",
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase n'est pas configuré.",
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/connexion`,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Inscription impossible pour le moment.",
    };
  }

  if (!data.session) {
    return {
      status: "success",
      message: "Compte créé. Vérifiez votre email pour confirmer votre inscription.",
    };
  }

  return {
    status: "success",
    message: "Compte créé avec succès. Vous pouvez maintenant utiliser votre espace.",
  };
}
