"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getPublicUserSession } from "@/lib/auth";
import { cancelUserAppointmentById } from "@/lib/data-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface AccountActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

export async function cancelAppointmentAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.email) {
    return {
      status: "error",
      message: "Vous devez etre connecte pour annuler un rendez-vous.",
    };
  }

  const appointmentId = String(formData.get("appointmentId") ?? "").trim();
  const cancelReason = String(formData.get("cancelReason") ?? "").trim();

  if (!appointmentId) {
    return {
      status: "error",
      message: "Rendez-vous introuvable.",
    };
  }

  if (cancelReason.length < 3) {
    return {
      status: "error",
      message: "Veuillez indiquer un motif d'annulation.",
    };
  }

  const appointment = await cancelUserAppointmentById(appointmentId, session.email, cancelReason);

  if (!appointment) {
    return {
      status: "error",
      message: "Ce rendez-vous ne peut pas etre annule.",
    };
  }

  revalidatePath("/compte");

  return {
    status: "success",
    message: "Le rendez-vous a bien ete annule.",
  };
}

export async function logoutAccountAction() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
