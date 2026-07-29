"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getPublicUserSession } from "@/lib/auth";
import { extractClientContextFromHeaders } from "@/lib/account-activity";
import {
  cancelUserAppointmentById,
  createAccountActivityLog,
  getCategoryById,
  reassignAppointmentsEmailForUser,
  setUserPasswordChangeRequirement,
  updateUserProfileByUserId,
} from "@/lib/data-access";
import { sendAppointmentCancellationEmail } from "@/lib/email";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { accountProfileSchema, changePasswordSchema } from "@/lib/validators";
import { formatDateTimeFr } from "@/lib/utils";

export interface AccountActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

export interface AccountProfileActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

export interface AccountPasswordActionState {
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
      message: "Vous devez être connecté pour annuler un rendez-vous.",
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

  const appointment = await cancelUserAppointmentById(
    appointmentId,
    { email: session.email, userId: session.userId },
    cancelReason,
  );

  if (!appointment) {
    return {
      status: "error",
      message: "Ce rendez-vous ne peut pas être annulé.",
    };
  }

  const category = await getCategoryById(appointment.categoryId);
  const requestHeaders = await headers();
  const clientContext = extractClientContextFromHeaders(requestHeaders);

  await sendAppointmentCancellationEmail({
    to: appointment.email,
    firstName: appointment.firstName,
    categoryTitle: category?.title ?? "Votre rendez-vous",
    startsAtLabel: formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
    reason: cancelReason,
    appointmentId: appointment.id,
  });

  if (session.userId) {
    await createAccountActivityLog({
      userId: session.userId,
      actionType: "annulation_rendez_vous",
      actionLabel: "Annulation d'un rendez-vous",
      description: `Annulation du rendez-vous ${category?.title ?? "Rendez-vous"} prévu le ${formatDateTimeFr(
        appointment.startsAt,
        { dateStyle: "full", timeStyle: "short" },
      )}.`,
      appointmentId: appointment.id,
      ipAddress: clientContext.ipAddress,
      country: clientContext.country,
      region: clientContext.region,
      city: clientContext.city,
      deviceType: clientContext.deviceType,
      operatingSystem: clientContext.operatingSystem,
      browser: clientContext.browser,
      userAgent: clientContext.userAgent,
      metadata: {
        categoryTitle: category?.title ?? null,
        cancelReason,
      },
    });
  }

  revalidatePath("/compte");
  revalidatePath("/compte/logs");

  return {
    status: "success",
    message: "Le rendez-vous a bien été annulé.",
  };
}

export async function updateAccountProfileAction(
  _state: AccountProfileActionState,
  formData: FormData,
): Promise<AccountProfileActionState> {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.userId || !session.email) {
    return {
      status: "error",
      message: "Vous devez être connecté pour modifier vos informations.",
    };
  }

  const parsed = accountProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.",
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase n'est pas configuré.",
    };
  }

  const nextProfile = parsed.data;
  const requestHeaders = await headers();
  const clientContext = extractClientContextFromHeaders(requestHeaders);
  const metadataUpdate = {
    first_name: nextProfile.firstName,
    last_name: nextProfile.lastName,
  };

  if (nextProfile.email !== session.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: nextProfile.email,
      data: metadataUpdate,
    });

    if (emailError) {
      return {
        status: "error",
        message: emailError.message,
      };
    }
  } else {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: metadataUpdate,
    });

    if (metadataError) {
      return {
        status: "error",
        message: metadataError.message,
      };
    }
  }

  await updateUserProfileByUserId({
    userId: session.userId,
    email: nextProfile.email,
    firstName: nextProfile.firstName,
    lastName: nextProfile.lastName,
    phone: nextProfile.phone,
  });

  if (nextProfile.email !== session.email) {
    await reassignAppointmentsEmailForUser(session.email, nextProfile.email);
  }

  const changedFields = [
    session.firstName !== nextProfile.firstName ? "prénom" : null,
    session.lastName !== nextProfile.lastName ? "nom" : null,
    session.email !== nextProfile.email ? "email" : null,
    session.phone !== nextProfile.phone ? "téléphone" : null,
  ].filter(Boolean);

  await createAccountActivityLog({
    userId: session.userId,
    actionType: "mise_a_jour_profil",
    actionLabel: "Mise à jour du profil",
    description:
      changedFields.length > 0
        ? `Modification des informations personnelles : ${changedFields.join(", ")}.`
        : "Enregistrement du profil sans changement détecté.",
    ipAddress: clientContext.ipAddress,
    country: clientContext.country,
    region: clientContext.region,
    city: clientContext.city,
    deviceType: clientContext.deviceType,
    operatingSystem: clientContext.operatingSystem,
    browser: clientContext.browser,
    userAgent: clientContext.userAgent,
    metadata: {
      changedFields,
      email: nextProfile.email,
      phone: nextProfile.phone,
    },
  });

  revalidatePath("/compte");
  revalidatePath("/compte/parametres");
  revalidatePath("/compte/logs");

  return {
    status: "success",
    message:
      nextProfile.email !== session.email
        ? "Vos informations ont été mises à jour. Si nécessaire, vérifiez votre boîte mail pour confirmer le changement d'adresse email."
        : "Vos informations ont bien été mises à jour.",
  };
}

export async function changeAccountPasswordAction(
  _state: AccountPasswordActionState,
  formData: FormData,
): Promise<AccountPasswordActionState> {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.userId) {
    return {
      status: "error",
      message: "Vous devez être connecté pour modifier votre mot de passe.",
    };
  }

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.",
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase n'est pas configuré.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  await setUserPasswordChangeRequirement(session.userId, false);

  const requestHeaders = await headers();
  const clientContext = extractClientContextFromHeaders(requestHeaders);

  await createAccountActivityLog({
    userId: session.userId,
    actionType: "mise_a_jour_securite",
    actionLabel: "Mise à jour du mot de passe",
    description: "Le mot de passe du compte a été modifié.",
    ipAddress: clientContext.ipAddress,
    country: clientContext.country,
    region: clientContext.region,
    city: clientContext.city,
    deviceType: clientContext.deviceType,
    operatingSystem: clientContext.operatingSystem,
    browser: clientContext.browser,
    userAgent: clientContext.userAgent,
    metadata: {
      requiresPasswordChange: false,
    },
  });

  revalidatePath("/compte");
  revalidatePath("/compte/parametres");
  revalidatePath("/compte/logs");
  revalidatePath("/compte/securite");
  redirect("/compte");
}

export async function logoutAccountAction() {
  const session = await getPublicUserSession();
  const supabase = await getSupabaseServerClient();
  const requestHeaders = await headers();
  const clientContext = extractClientContextFromHeaders(requestHeaders);

  if (session.isAuthenticated && session.userId) {
    await createAccountActivityLog({
      userId: session.userId,
      actionType: "deconnexion",
      actionLabel: "Déconnexion de l'espace client",
      description: "Déconnexion manuelle de l'espace client.",
      ipAddress: clientContext.ipAddress,
      country: clientContext.country,
      region: clientContext.region,
      city: clientContext.city,
      deviceType: clientContext.deviceType,
      operatingSystem: clientContext.operatingSystem,
      browser: clientContext.browser,
      userAgent: clientContext.userAgent,
    });
  }

  await supabase?.auth.signOut();
  redirect("/");
}
