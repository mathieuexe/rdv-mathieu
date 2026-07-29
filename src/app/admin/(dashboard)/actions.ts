"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { extractClientIpFromHeaders, mergeAllowedIps, splitAllowedIpsInput } from "@/lib/maintenance";
import { createAdminAppointment, saveCategory, saveSiteSettings } from "@/lib/data-access";
import { adminAppointmentSchema, categoryAdminSchema, settingsSchema } from "@/lib/validators";

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
    customMessage: formData.get("customMessage"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Le formulaire contient au moins une erreur.");
    redirect(`${returnPath}?error=${message}`);
  }

  try {
    const category = await saveCategory({
      categoryId: parsed.data.categoryId || undefined,
      title: parsed.data.title,
      slug: parsed.data.slug,
      durationMinutes: parsed.data.durationMinutes,
      appointmentMode: parsed.data.appointmentMode,
      description: parsed.data.description,
      isOnline: parsed.data.isOnline,
      customMessage: parsed.data.customMessage || undefined,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    revalidatePath("/");

    const successPath = parsed.data.categoryId ? returnPath : `/admin/categories/${category.id}`;
    redirect(`${successPath}?saved=1`);
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Impossible d'enregistrer la categorie.");
    redirect(`${returnPath}?error=${message}`);
  }
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
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Le formulaire contient au moins une erreur.");
    redirect(`/admin/parametres?error=${message}`);
  }

  try {
    const requestHeaders = await headers();
    const currentIp = formData.get("allowCurrentIp") === "on" ? extractClientIpFromHeaders(requestHeaders) : null;

    await saveSiteSettings({
      ...parsed.data,
      maintenanceAllowedIps: mergeAllowedIps(splitAllowedIpsInput(parsed.data.maintenanceAllowedIps), [currentIp]),
    });
    revalidatePath("/admin");
    revalidatePath("/admin/parametres");
    revalidatePath("/maintenance");
    revalidatePath("/");
    redirect("/admin/parametres?saved=1");
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Impossible d'enregistrer les parametres.");
    redirect(`/admin/parametres?error=${message}`);
  }
}

export async function createAdminAppointmentAction(formData: FormData) {
  const session = await getAdminSession();

  if (!session.isAuthenticated || !session.userId || !session.email) {
    redirect("/admin/login");
  }

  const parsed = adminAppointmentSchema.safeParse({
    categorySlug: formData.get("categorySlug"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    startsAt: formData.get("startsAt"),
  });

  if (!parsed.success) {
    redirect("/admin/rendez-vous/nouveau?error=1");
  }

  await createAdminAppointment({
    ...parsed.data,
    message: parsed.data.message || undefined,
    adminUserId: session.userId,
    adminEmail: session.email,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/rendez-vous");
  redirect("/admin/rendez-vous/agenda?saved=1");
}
