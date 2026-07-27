"use server";

import { redirect } from "next/navigation";

import { categoryAdminSchema, settingsSchema } from "@/lib/validators";

export async function saveCategoryAction(formData: FormData) {
  const parsed = categoryAdminSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    durationMinutes: formData.get("durationMinutes"),
    appointmentMode: formData.get("appointmentMode"),
    description: formData.get("description"),
    isOnline: formData.get("isOnline") === "on",
    customMessage: formData.get("customMessage"),
  });

  if (!parsed.success) {
    redirect("/admin/categories?error=1");
  }

  redirect("/admin/categories?saved=1");
}

export async function saveSettingsAction(formData: FormData) {
  const parsed = settingsSchema.safeParse({
    maintenanceMode: formData.get("maintenanceMode") === "on",
    maintenanceMessage: formData.get("maintenanceMessage"),
  });

  if (!parsed.success) {
    redirect("/admin/parametres?error=1");
  }

  redirect("/admin/parametres?saved=1");
}
