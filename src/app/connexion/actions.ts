"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { extractClientContextFromHeaders } from "@/lib/account-activity";
import { createAccountActivityLog } from "@/lib/data-access";
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

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "Connexion impossible. Vérifiez vos identifiants.",
    };
  }

  if (data.user?.id) {
    const requestHeaders = await headers();
    const clientContext = extractClientContextFromHeaders(requestHeaders);
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("requires_password_change")
      .eq("user_id", data.user.id)
      .maybeSingle();

    await createAccountActivityLog({
      userId: data.user.id,
      actionType: "connexion",
      actionLabel: "Connexion à l'espace client",
      description: "Connexion réussie à l'espace client.",
      ipAddress: clientContext.ipAddress,
      country: clientContext.country,
      region: clientContext.region,
      city: clientContext.city,
      deviceType: clientContext.deviceType,
      operatingSystem: clientContext.operatingSystem,
      browser: clientContext.browser,
      userAgent: clientContext.userAgent,
      metadata: {
        email: data.user.email?.toLowerCase() ?? parsed.data.email.toLowerCase(),
      },
    });

    if (profile?.requires_password_change) {
      redirect("/compte/securite");
    }
  }

  redirect("/");
}
