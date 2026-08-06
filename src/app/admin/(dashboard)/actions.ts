"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { extractClientContextFromHeaders } from "@/lib/account-activity";
import { extractClientIpFromHeaders, mergeAllowedIps, splitAllowedIpsInput } from "@/lib/maintenance";
import {
  cancelAppointmentsOverlappingGlobalBlackouts,
  createAccountActivityLog,
  createAdminAppointment,
  createManagedUserAccount,
  deleteManagedUserAccount,
  getAdminUserDetail,
  getCategoryById,
  saveCategory,
  getSiteSettings,
  saveSiteSettings,
  setUserPasswordChangeRequirement,
  updateManagedUserAccount,
} from "@/lib/data-access";
import {
  sendAdminCreatedSignupEmail,
  sendBlackoutAppointmentCancellationEmail,
  sendValidatedAppointmentEmail,
  sendAdminCustomEmailToUser
} from "@/lib/email";
import { sendDiscordNotification } from "@/lib/discord";
import { adminAppointmentSchema, categoryAdminSchema, settingsSchema } from "@/lib/validators";
import { formatDateTimeFr } from "@/lib/utils";

const AUTOMATIC_BLACKOUT_CANCELLATION_REASON =
  "Annulation automatique en raison d'une période d'indisponibilité.";

function parseGlobalBlackoutPeriods(formData: FormData) {
  const startDates = formData.getAll("blackoutStartDate").map((value) => String(value).trim());
  const startTimes = formData.getAll("blackoutStartTime").map((value) => String(value).trim());
  const endDates = formData.getAll("blackoutEndDate").map((value) => String(value).trim());
  const endTimes = formData.getAll("blackoutEndTime").map((value) => String(value).trim());
  const messages = formData.getAll("blackoutMessage").map((value) => String(value).trim());
  const rowCount = Math.max(startDates.length, startTimes.length, endDates.length, endTimes.length, messages.length);

  return Array.from({ length: rowCount }, (_, index) => ({
    startDate: startDates[index] ?? "",
    startTime: startTimes[index] ?? "",
    endDate: endDates[index] ?? "",
    endTime: endTimes[index] ?? "",
    message: messages[index] ?? "",
  })).filter((period) => period.startDate || period.startTime || period.endDate || period.endTime || period.message);
}

export interface AdminUserActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

const categoryWeekdays = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

function parseCategoryAvailabilityRules(formData: FormData) {
  return categoryWeekdays.map((weekday) => ({
    weekday,
    enabled: formData.get(`availabilityEnabled_${weekday}`) === "on",
    startTime: String(formData.get(`availabilityStart_${weekday}`) ?? "").trim(),
    endTime: String(formData.get(`availabilityEnd_${weekday}`) ?? "").trim(),
    breakStart: String(formData.get(`breakStart_${weekday}`) ?? "").trim(),
    breakEnd: String(formData.get(`breakEnd_${weekday}`) ?? "").trim(),
  }));
}

export async function saveCategoryAction(formData: FormData) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  const returnPath = String(formData.get("returnPath") || "/admin/categories");
  const parsed = categoryAdminSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    durationMinutes: formData.get("durationMinutes"),
    appointmentMode: formData.get("appointmentMode"),
    description: formData.get("description"),
    isOnline: formData.get("isOnline") === "on",
    isHidden: formData.get("isHidden") === "on",
    isBookingBlocked: formData.get("isBookingBlocked") === "on",
    bookingBlockMessage: formData.get("bookingBlockMessage"),
    customMessage: formData.get("customMessage"),
    thumbnailImageDataUrl: formData.get("thumbnailImageDataUrl"),
    bannerImageDataUrl: formData.get("bannerImageDataUrl"),
    customFieldsJson: formData.get("customFieldsJson"),
    availabilityRules: parseCategoryAvailabilityRules(formData),
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Le formulaire contient au moins une erreur.");
    redirect(`${returnPath}?error=${message}`);
  }

  let successPath = returnPath;
  const isNewCategory = !parsed.data.categoryId;

  try {
    const category = await saveCategory({
      categoryId: parsed.data.categoryId || undefined,
      title: parsed.data.title,
      slug: parsed.data.slug,
      durationMinutes: parsed.data.durationMinutes,
      appointmentMode: parsed.data.appointmentMode,
      description: parsed.data.description,
      isOnline: parsed.data.isOnline,
      isHidden: parsed.data.isHidden,
      isBookingBlocked: parsed.data.isBookingBlocked,
      bookingBlockMessage: parsed.data.bookingBlockMessage || undefined,
      customMessage: parsed.data.customMessage || undefined,
      thumbnailImageUrl: parsed.data.thumbnailImageDataUrl || undefined,
      bannerImageUrl: parsed.data.bannerImageDataUrl || undefined,
      customFields: parsed.data.customFieldsJson ? JSON.parse(String(parsed.data.customFieldsJson)) : undefined,
      availabilityRules: parsed.data.availabilityRules,
    });

    if (isNewCategory && parsed.data.isOnline && !parsed.data.isHidden && !parsed.data.isBookingBlocked) {
      await sendDiscordNotification(`✨ **Nouvelle catégorie disponible** : ${parsed.data.title}\nN'hésitez pas à prendre rendez-vous !`);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");

    successPath = `/admin/categories/${category.slug}`;
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Impossible d'enregistrer la categorie.");
    redirect(`${returnPath}?error=${message}`);
  }

  redirect(`${successPath}?saved=1`);
}

export async function saveSettingsAction(formData: FormData) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  const parsed = settingsSchema.safeParse({
    maintenanceMode: formData.get("maintenanceMode") === "on",
    maintenanceMessage: formData.get("maintenanceMessage"),
    maintenanceAllowedIps: formData.get("maintenanceAllowedIps"),
    enableWhatsappWidget: formData.get("enableWhatsappWidget") === "on",
    enableBlackoutMarquee: formData.get("enableBlackoutMarquee") === "on",
    bookingBlocked: formData.get("bookingBlocked") === "on",
    bookingBlockedMessage: formData.get("bookingBlockedMessage"),
    globalBlackoutPeriods: parseGlobalBlackoutPeriods(formData),
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Le formulaire contient au moins une erreur.");
    redirect(`/admin/parametres?error=${message}`);
  }

  try {
    const requestHeaders = await headers();
    const currentIp = formData.get("allowCurrentIp") === "on" ? extractClientIpFromHeaders(requestHeaders) : null;
    const clientContext = extractClientContextFromHeaders(requestHeaders);

    const oldSettings = await getSiteSettings();

    await saveSiteSettings({
      ...parsed.data,
      bookingBlockedMessage: parsed.data.bookingBlockedMessage || null,
      maintenanceAllowedIps: mergeAllowedIps(splitAllowedIpsInput(parsed.data.maintenanceAllowedIps), [currentIp]),
    });

    // Discord Notifications
    if (parsed.data.maintenanceMode && !oldSettings.maintenanceMode) {
      await sendDiscordNotification(`⚠️ **Site en maintenance** : Le mode maintenance vient d'être activé.`);
    } else if (!parsed.data.maintenanceMode && oldSettings.maintenanceMode) {
      await sendDiscordNotification(`✅ **Maintenance terminée** : Le site est de nouveau accessible.`);
    }

    if (parsed.data.bookingBlocked && !oldSettings.bookingBlocked) {
      await sendDiscordNotification(`🚫 **Réservations suspendues** : ${parsed.data.bookingBlockedMessage || 'La prise de rendez-vous a été bloquée.'}`);
    } else if (!parsed.data.bookingBlocked && oldSettings.bookingBlocked) {
      await sendDiscordNotification(`✅ **Réservations activées** : Les prises de rendez-vous sont de nouveau possibles.`);
    }

    // Check for newly added blackout periods
    const oldBlackouts = oldSettings.globalBlackoutPeriods.map(p => `${p.startDate}-${p.startTime}-${p.endDate}-${p.endTime}`);
    for (const newPeriod of parsed.data.globalBlackoutPeriods) {
      const key = `${newPeriod.startDate}-${newPeriod.startTime}-${newPeriod.endDate}-${newPeriod.endTime}`;
      if (!oldBlackouts.includes(key)) {
        await sendDiscordNotification(`📅 **Nouvelle indisponibilité** : Du ${newPeriod.startDate} à ${newPeriod.startTime} jusqu'au ${newPeriod.endDate} à ${newPeriod.endTime}. Motif : ${newPeriod.message || 'Non spécifié'}`);
      }
    }

    const cancelledAppointments = await cancelAppointmentsOverlappingGlobalBlackouts(AUTOMATIC_BLACKOUT_CANCELLATION_REASON);

    for (const cancelled of cancelledAppointments) {
      const startsAtDate = new Date(cancelled.appointment.startsAt);

      await sendBlackoutAppointmentCancellationEmail({
        to: cancelled.appointment.email,
        firstName: cancelled.appointment.firstName,
        categoryTitle: cancelled.category?.title ?? "Rendez-vous",
        appointmentDateLabel: formatDateTimeFr(startsAtDate, { dateStyle: "full" }),
        appointmentTimeLabel: formatDateTimeFr(startsAtDate, { timeStyle: "short" }),
        reason: cancelled.reason,
        appointmentId: cancelled.appointment.id,
      });

      if (cancelled.appointment.linkedUserId) {
        await createAccountActivityLog({
          userId: cancelled.appointment.linkedUserId,
          actionType: "annulation_rendez_vous",
          actionLabel: "Annulation automatique pour indisponibilité",
          description: `Le rendez-vous prévu le ${formatDateTimeFr(cancelled.appointment.startsAt, {
            dateStyle: "full",
            timeStyle: "short",
          })} a été annulé automatiquement en raison d'une indisponibilité.`,
          appointmentId: cancelled.appointment.id,
          ipAddress: clientContext.ipAddress,
          country: clientContext.country,
          region: clientContext.region,
          city: clientContext.city,
          deviceType: clientContext.deviceType,
          operatingSystem: clientContext.operatingSystem,
          browser: clientContext.browser,
          userAgent: clientContext.userAgent,
          metadata: {
            categoryTitle: cancelled.category?.title ?? null,
            cancelReason: cancelled.reason,
            cancelledBy: "admin_blackout",
          },
        });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/parametres");
    revalidatePath("/admin/rendez-vous");
    revalidatePath("/admin/rendez-vous/agenda");
    revalidatePath("/maintenance");
    revalidatePath("/", "layout");
    revalidatePath("/compte");
    revalidatePath("/compte/logs");
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Impossible d'enregistrer les parametres.");
    redirect(`/admin/parametres?error=${message}`);
  }

  redirect("/admin/parametres?saved=1");
}

export async function createAdminAppointmentAction(formData: FormData) {
  const session = await getAdminSession();

  if (!session.isAuthenticated || !session.userId || !session.email) {
    redirect("/admin/login");
  }

  const parsed = adminAppointmentSchema.safeParse({
    categorySlug: formData.get("categorySlug"),
    linkedUserId: formData.get("linkedUserId"),
    createClientAccount: formData.get("createClientAccount") === "on",
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    customFieldResponsesJson: formData.get("customFieldResponsesJson"),
    startsAt: formData.get("startsAt"),
    updateLinkedUserProfile: formData.get("updateLinkedUserProfile") === "on",
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Le formulaire contient au moins une erreur.");
    redirect(`/admin/rendez-vous/nouveau?error=${message}`);
  }

  let createdAccount:
    | {
        userId: string;
        email: string;
        temporaryPassword: string;
      }
    | undefined;
  let effectiveLinkedUserId = parsed.data.linkedUserId || undefined;
  let appointmentCreated = false;

  try {
    if (parsed.data.linkedUserId && parsed.data.updateLinkedUserProfile) {
      await updateManagedUserAccount({
        userId: parsed.data.linkedUserId,
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
      });
    }

    if (!parsed.data.linkedUserId && parsed.data.createClientAccount) {
      createdAccount = await createManagedUserAccount({
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
      });
      effectiveLinkedUserId = createdAccount.userId;
    }

    let customFieldResponses = {};
    if (parsed.data.customFieldResponsesJson) {
      try {
        customFieldResponses = JSON.parse(parsed.data.customFieldResponsesJson);
      } catch (e) {}
    }

    const appointment = await createAdminAppointment({
      ...parsed.data,
      customFieldResponses,
      linkedUserId: effectiveLinkedUserId,
      message: parsed.data.message || undefined,
      adminUserId: session.userId,
      adminEmail: session.email,
    });
    appointmentCreated = true;
    const category = await getCategoryById(appointment.categoryId);

    await sendValidatedAppointmentEmail({
      to: appointment.email,
      firstName: appointment.firstName,
      categoryTitle: category?.title ?? "Votre rendez-vous",
      startsAtLabel: formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" }),
      appointmentMode: category?.appointmentMode ?? "visioconference",
      phone: appointment.phone,
      appointmentId: appointment.id,
    });

    if (createdAccount) {
      await sendAdminCreatedSignupEmail({
        to: createdAccount.email,
        firstName: parsed.data.firstName,
        temporaryPassword: createdAccount.temporaryPassword,
      });
    }

    if (effectiveLinkedUserId) {
      const requestHeaders = await headers();
      const clientContext = extractClientContextFromHeaders(requestHeaders);

      await createAccountActivityLog({
        userId: effectiveLinkedUserId,
        actionType: "prise_rendez_vous",
        actionLabel: "Rendez-vous ajouté par l'administration",
        description: `Un administrateur a ajouté un rendez-vous le ${formatDateTimeFr(appointment.startsAt, {
          dateStyle: "full",
          timeStyle: "short",
        })}.`,
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
          categorySlug: parsed.data.categorySlug,
          createdFrom: "admin",
          accountCreatedByAdmin: Boolean(createdAccount),
          linkedUserUpdatedByAdmin: parsed.data.updateLinkedUserProfile,
        },
      });
    }
  } catch (error) {
    if (createdAccount?.userId && !appointmentCreated) {
      try {
        await deleteManagedUserAccount(createdAccount.userId);
      } catch {}
    }

    const message = encodeURIComponent(
      error instanceof Error ? error.message : "Impossible de créer le rendez-vous pour le moment.",
    );
    redirect(`/admin/rendez-vous/nouveau?error=${message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/rendez-vous");
  revalidatePath("/admin/rendez-vous/agenda");
  revalidatePath("/admin/rendez-vous/nouveau");
  revalidatePath("/compte");
  revalidatePath("/compte/logs");
  redirect("/admin/rendez-vous?saved=1");
}

export async function updateAdminUserProfileAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return {
      status: "error",
      message: "Accès non autorisé.",
    };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const avatarImageDataUrl = formData.get("avatarImageDataUrl")?.toString();

  if (!userId || firstName.length < 2 || lastName.length < 2 || !email.includes("@") || phone.length < 8) {
    return {
      status: "error",
      message: "Veuillez vérifier les informations du formulaire.",
    };
  }

  try {
    const previous = await getAdminUserDetail(userId);

    if (!previous) {
      return {
        status: "error",
        message: "Utilisateur introuvable.",
      };
    }

    await updateManagedUserAccount({
      userId,
      firstName,
      lastName,
      email,
      phone,
      avatarUrl: avatarImageDataUrl,
    });

    const requestHeaders = await headers();
    const clientContext = extractClientContextFromHeaders(requestHeaders);
    const changedFields = [
      previous.profile.firstName !== firstName ? "prénom" : null,
      previous.profile.lastName !== lastName ? "nom" : null,
      previous.profile.email !== email ? "email" : null,
      (previous.profile.phone ?? "") !== phone ? "téléphone" : null,
      (previous.profile.avatarUrl ?? "") !== (avatarImageDataUrl ?? "") ? "photo de profil" : null,
    ].filter(Boolean);

    await createAccountActivityLog({
      userId,
      actionType: "mise_a_jour_profil",
      actionLabel: "Mise à jour du profil par l'administration",
      description:
        changedFields.length > 0
          ? `L'administration a modifié les champs suivants : ${changedFields.join(", ")}.`
          : "L'administration a enregistré le profil sans changement détecté.",
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
        updatedFrom: "admin",
      },
    });

    revalidatePath("/admin/utilisateurs");
    revalidatePath(`/admin/utilisateurs/${userId}`);
    revalidatePath("/compte");
    revalidatePath("/compte/parametres");

    return {
      status: "success",
      message: "Le dossier utilisateur a bien été mis à jour.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Impossible de mettre à jour l'utilisateur.",
    };
  }
}

export async function updateAdminUserSecurityAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return {
      status: "error",
      message: "Accès non autorisé.",
    };
  }

  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return {
      status: "error",
      message: "Utilisateur introuvable.",
    };
  }

  try {
    const requiresPasswordChange = formData.get("requiresPasswordChange") === "on";
    await setUserPasswordChangeRequirement(userId, requiresPasswordChange);
    const requestHeaders = await headers();
    const clientContext = extractClientContextFromHeaders(requestHeaders);

    await createAccountActivityLog({
      userId,
      actionType: "mise_a_jour_securite",
      actionLabel: "Mise à jour de la sécurité par l'administration",
      description: requiresPasswordChange
        ? "L'administration a demandé un changement de mot de passe lors de la prochaine connexion."
        : "L'administration a retiré l'obligation de changer le mot de passe.",
      ipAddress: clientContext.ipAddress,
      country: clientContext.country,
      region: clientContext.region,
      city: clientContext.city,
      deviceType: clientContext.deviceType,
      operatingSystem: clientContext.operatingSystem,
      browser: clientContext.browser,
      userAgent: clientContext.userAgent,
      metadata: {
        updatedFrom: "admin",
        requiresPasswordChange,
      },
    });

    revalidatePath("/admin/utilisateurs");
    revalidatePath(`/admin/utilisateurs/${userId}`);
    revalidatePath("/compte/securite");

    return {
      status: "success",
      message: "Les paramètres de sécurité ont bien été mis à jour.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Impossible de mettre à jour la sécurité du compte.",
    };
  }
}

export async function banAdminUserAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return { status: "error", message: "Accès non autorisé." };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const isBanned = formData.get("isBanned") === "true";
  const banReason = String(formData.get("banReason") ?? "").trim();

  if (!userId) {
    return { status: "error", message: "Utilisateur introuvable." };
  }

  try {
    const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = getSupabaseAdminClient();
    
    if (!supabaseAdmin) throw new Error("Erreur de connexion base de données.");

    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({
        is_banned: isBanned,
        ban_reason: isBanned ? banReason : null,
      })
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/admin/utilisateurs");
    revalidatePath(`/admin/utilisateurs/${userId}`);
    
    return {
      status: "success",
      message: isBanned ? "Utilisateur banni avec succès." : "Utilisateur débloqué avec succès.",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Impossible de modifier le statut de l'utilisateur.",
    };
  }
}

export async function deleteAdminUserAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return { status: "error", message: "Accès non autorisé." };
  }

  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return { status: "error", message: "Utilisateur introuvable." };
  }

  try {
    await deleteManagedUserAccount(userId);
  } catch (error) {
    return {
      status: "error",
      message: "Impossible de supprimer le compte.",
    };
  }
  
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function deleteCategoryAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return { status: "error", message: "Accès non autorisé." };
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    return { status: "error", message: "Catégorie introuvable." };
  }

  try {
    const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = getSupabaseAdminClient();
    
    if (!supabaseAdmin) throw new Error("Erreur de connexion base de données.");

    // The categories table should have ON DELETE CASCADE for rules and blackouts,
    // but if not, we might need to delete them first. Let's just try to delete the category.
    // However, if there are appointments, it might fail. Let's catch the error.
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      if (error.code === "23503") {
         throw new Error("Impossible de supprimer cette catégorie car des rendez-vous y sont rattachés.");
      }
      throw error;
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    
    // We cannot redirect inside a try-catch returning a state easily, but since this is an action state
    // we can return success and the client component will handle redirect or we can just return success
    return {
      status: "success",
      message: "Catégorie supprimée avec succès.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Impossible de supprimer la catégorie.",
    };
  }
}

export async function duplicateCategoryAction(
  _state: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return { status: "error", message: "Accès non autorisé." };
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    return { status: "error", message: "Catégorie introuvable." };
  }

  try {
    const categoryToDuplicate = await getCategoryById(categoryId);
    if (!categoryToDuplicate) {
      throw new Error("La catégorie à dupliquer est introuvable.");
    }

    // Append "-copie" to slug, wait, if it exists it will fail.
    // Just append a random string or timestamp.
    const suffix = Math.floor(Math.random() * 10000).toString();
    const newSlug = `${categoryToDuplicate.slug}-copie-${suffix}`;
    const newTitle = `${categoryToDuplicate.title} (Copie)`;

    const newCategory = await saveCategory({
      title: newTitle,
      slug: newSlug,
      durationMinutes: categoryToDuplicate.durationMinutes,
      appointmentMode: categoryToDuplicate.appointmentMode,
      description: categoryToDuplicate.description,
      isOnline: false, // Default to offline for copies
      isBookingBlocked: categoryToDuplicate.isBookingBlocked,
      bookingBlockMessage: categoryToDuplicate.bookingBlockMessage,
      customMessage: categoryToDuplicate.customMessage,
      thumbnailImageUrl: categoryToDuplicate.thumbnailImageUrl,
      bannerImageUrl: categoryToDuplicate.bannerImageUrl,
      availabilityRules: categoryToDuplicate.availabilityRules.map(rule => ({
        weekday: rule.weekday,
        enabled: rule.windows.length > 0,
        startTime: rule.windows[0]?.start ?? "09:00",
        endTime: rule.windows[rule.windows.length - 1]?.end ?? "18:00",
        breakStart: rule.windows.length > 1 ? rule.windows[0]?.end : "",
        breakEnd: rule.windows.length > 1 ? rule.windows[1]?.start : "",
      })),
    });

    revalidatePath("/admin/categories");
    
    return {
      status: "success",
      message: newCategory.slug, // Pass the new slug so we can redirect to it
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Impossible de dupliquer la catégorie.",
    };
  }
}

export async function sendCustomEmailAction(formData: FormData) {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return { error: "Accès non autorisé." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!email || !subject || !message) {
    return { error: "Tous les champs sont requis." };
  }

  try {
    await sendAdminCustomEmailToUser({
      to: email,
      firstName,
      subject,
      message,
    });
    
    return { success: true };
  } catch (error) {
    return { error: "Impossible d'envoyer l'email." };
  }
}
