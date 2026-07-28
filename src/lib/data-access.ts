import { randomUUID } from "node:crypto";

import { addMinutes, parseISO } from "date-fns";

import { demoAppointments, demoCategories, demoSiteSettings } from "@/lib/demo-data";
import { buildBookingSlots } from "@/lib/booking";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AppointmentCategory,
  AppointmentRecord,
  AppointmentRequestPayload,
  BlackoutPeriod,
  DashboardMetrics,
  SiteSettings,
} from "@/types/domain";

function mapBlackoutPeriod(row: Record<string, unknown>): BlackoutPeriod {
  return {
    id: String(row.id),
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    message: typeof row.message === "string" ? row.message : undefined,
  };
}

function mapCategoryRow(
  row: Record<string, unknown>,
  rules: Array<Record<string, unknown>>,
  blackouts: Array<Record<string, unknown>>,
): AppointmentCategory {
  const categoryId = String(row.id);
  const categoryRules = rules.filter((rule) => String(rule.category_id) === categoryId);
  const categoryBlackouts = blackouts.filter((period) => String(period.category_id) === categoryId);

  return {
    id: categoryId,
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description ?? ""),
    durationMinutes: Number(row.duration_minutes),
    appointmentMode: row.appointment_mode as AppointmentCategory["appointmentMode"],
    isOnline: Boolean(row.is_online),
    customMessage: typeof row.custom_message === "string" ? row.custom_message : undefined,
    availabilityRules: categoryRules.reduce<AppointmentCategory["availabilityRules"]>((acc, rule) => {
      const weekdayValue = Number(rule.weekday);
      const weekdayMap = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
      const weekday = weekdayMap[weekdayValue] ?? "lundi";
      const existing = acc.find((item) => item.weekday === weekday);
      const window = {
        start: String(rule.start_time).slice(0, 5),
        end: String(rule.end_time).slice(0, 5),
      };

      if (existing) {
        existing.windows.push(window);
      } else {
        acc.push({
          weekday: weekday as AppointmentCategory["availabilityRules"][number]["weekday"],
          windows: [window],
        });
      }

      return acc;
    }, []),
    blackoutPeriods: categoryBlackouts.map(mapBlackoutPeriod),
  };
}

function mapAppointmentRow(row: Record<string, unknown>): AppointmentRecord {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    email: String(row.email),
    phone: String(row.phone),
    clientMessage: typeof row.client_message === "string" ? row.client_message : undefined,
    startsAt: String(row.starts_at),
    endsAt: String(row.ends_at),
    status: row.status as AppointmentRecord["status"],
    rejectionReason: typeof row.rejection_reason === "string" ? row.rejection_reason : undefined,
    cancelReason: typeof row.cancel_reason === "string" ? row.cancel_reason : undefined,
    origin: row.origin === "administrateur" ? "administrateur" : "utilisateur",
    createdByAdminUserId: typeof row.created_by_admin_user_id === "string" ? row.created_by_admin_user_id : undefined,
    createdByAdminEmail: typeof row.created_by_admin_email === "string" ? row.created_by_admin_email : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function getSiteSettings() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [{ data: settingsRow }, { data: blackoutRows }] = await Promise.all([
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      supabase.from("global_blackout_periods").select("*").order("start_date"),
    ]);

    if (settingsRow) {
      const siteSettings: SiteSettings = {
        maintenanceMode: Boolean(settingsRow.maintenance_mode),
        maintenanceMessage:
          typeof settingsRow.maintenance_message === "string"
            ? settingsRow.maintenance_message
            : demoSiteSettings.maintenanceMessage,
        globalBlackoutPeriods: (blackoutRows ?? []).map((row) => mapBlackoutPeriod(row as Record<string, unknown>)),
      };

      return siteSettings;
    }
  }

  return demoSiteSettings;
}

export async function getCategories() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [{ data: categoryRows }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").order("created_at"),
      supabase.from("category_availability_rules").select("*").order("weekday"),
      supabase.from("category_blackout_periods").select("*").order("start_date"),
    ]);

    if (categoryRows?.length) {
      return categoryRows.map((row) =>
        mapCategoryRow(
          row as Record<string, unknown>,
          (ruleRows ?? []) as Array<Record<string, unknown>>,
          (blackoutRows ?? []) as Array<Record<string, unknown>>,
        ),
      );
    }
  }

  return demoCategories;
}

export async function getPublicCategoryBySlug(slug: string) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [{ data: categoryRow }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").eq("slug", slug).maybeSingle(),
      supabase.from("category_availability_rules").select("*").order("weekday"),
      supabase.from("category_blackout_periods").select("*").order("start_date"),
    ]);

    if (categoryRow) {
      return mapCategoryRow(
        categoryRow as Record<string, unknown>,
        (ruleRows ?? []) as Array<Record<string, unknown>>,
        (blackoutRows ?? []) as Array<Record<string, unknown>>,
      );
    }
  }

  return demoCategories.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryById(categoryId: string) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [{ data: categoryRow }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").eq("id", categoryId).maybeSingle(),
      supabase.from("category_availability_rules").select("*").order("weekday"),
      supabase.from("category_blackout_periods").select("*").order("start_date"),
    ]);

    if (categoryRow) {
      return mapCategoryRow(
        categoryRow as Record<string, unknown>,
        (ruleRows ?? []) as Array<Record<string, unknown>>,
        (blackoutRows ?? []) as Array<Record<string, unknown>>,
      );
    }
  }

  return demoCategories.find((category) => category.id === categoryId) ?? null;
}

export async function getAppointments() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase.from("appointments").select("*").order("starts_at");

    if (data?.length) {
      return data.map((row) => mapAppointmentRow(row as Record<string, unknown>));
    }
  }

  return demoAppointments;
}

export async function getAppointmentById(appointmentId: string) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }
  }

  return demoAppointments.find((appointment) => appointment.id === appointmentId) ?? null;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const appointments = await getAppointments();
  const categories = await getCategories();

  return {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((item) => item.status === "en_attente").length,
    acceptedAppointments: appointments.filter((item) => item.status === "accepte").length,
    refusedAppointments: appointments.filter((item) => item.status === "refuse").length,
    onlineCategories: categories.filter((item) => item.isOnline).length,
  };
}

export async function getCategorySlots(slug: string) {
  const category = await getPublicCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const [siteSettings, appointments] = await Promise.all([getSiteSettings(), getAppointments()]);

  return {
    category,
    siteSettings,
    slots: buildBookingSlots({
      category,
      siteSettings,
      appointments,
    }),
  };
}

export async function createAppointmentRequest(payload: AppointmentRequestPayload) {
  const category = await getPublicCategoryBySlug(payload.categorySlug);

  if (!category) {
    throw new Error("Catégorie introuvable.");
  }

  const startsAt = parseISO(payload.startsAt);
  const endsAt = addMinutes(startsAt, category.durationMinutes);

  const record: AppointmentRecord = {
    id: randomUUID(),
    categoryId: category.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    clientMessage: payload.message,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: "en_attente",
    origin: "utilisateur",
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .insert({
        category_id: record.categoryId,
        first_name: record.firstName,
        last_name: record.lastName,
        email: record.email,
        phone: record.phone,
        client_message: record.clientMessage ?? null,
        starts_at: record.startsAt,
        ends_at: record.endsAt,
        status: record.status,
        origin: "utilisateur",
        created_by_admin_user_id: null,
        created_by_admin_email: null,
        cancel_reason: null,
      })
      .select("*")
      .single();

    if (data) {
      return {
        appointment: mapAppointmentRow(data as Record<string, unknown>),
        category,
      };
    }
  }

  return {
    appointment: record,
    category,
  };
}

export async function getAppointmentsView() {
  const [appointments, categories] = await Promise.all([getAppointments(), getCategories()]);

  return appointments.map((appointment) => ({
    ...appointment,
    category: categories.find((item) => item.id === appointment.categoryId) as AppointmentCategory | undefined,
  }));
}

export async function getUserAppointmentsByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdminClient();
  const categories = await getCategories();

  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .ilike("email", normalizedEmail)
      .order("starts_at", { ascending: false });

    return (data ?? []).map((row) => {
      const appointment = mapAppointmentRow(row as Record<string, unknown>);

      return {
        ...appointment,
        category: categories.find((item) => item.id === appointment.categoryId) as AppointmentCategory | undefined,
      };
    });
  }

  return demoAppointments
    .filter((appointment) => appointment.email.trim().toLowerCase() === normalizedEmail)
    .map((appointment) => ({
      ...appointment,
      category: categories.find((item) => item.id === appointment.categoryId) as AppointmentCategory | undefined,
    }));
}

export async function cancelUserAppointmentById(appointmentId: string, email: string, cancelReason: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .update({
        status: "annule_client",
        cancel_reason: cancelReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .ilike("email", normalizedEmail)
      .in("status", ["en_attente", "accepte"])
      .select("*")
      .maybeSingle();

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }

    return null;
  }

  const appointment = demoAppointments.find(
    (item) => item.id === appointmentId && item.email.trim().toLowerCase() === normalizedEmail,
  );

  if (!appointment || !["en_attente", "accepte"].includes(appointment.status)) {
    return null;
  }

  return {
    ...appointment,
    status: "annule_client" as const,
    cancelReason,
  };
}

export async function getPendingAppointmentsView() {
  const appointments = await getAppointmentsView();
  return appointments.filter((appointment) => appointment.status === "en_attente");
}

export async function getAgendaAppointmentsView() {
  const appointments = await getAppointmentsView();
  return appointments.filter((appointment) => appointment.status === "accepte");
}

export async function saveCategory(input: {
  categoryId?: string;
  title: string;
  slug: string;
  durationMinutes: number;
  appointmentMode: AppointmentCategory["appointmentMode"];
  description: string;
  isOnline: boolean;
  customMessage?: string;
  startTime: string;
  endTime: string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const categoryPayload = {
    title: input.title,
    slug: input.slug,
    duration_minutes: input.durationMinutes,
    appointment_mode: input.appointmentMode,
    description: input.description,
    is_online: input.isOnline,
    custom_message: input.customMessage ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: categoryRow } = input.categoryId
    ? await supabase
        .from("categories")
        .update(categoryPayload)
        .eq("id", input.categoryId)
        .select("*")
        .single()
    : await supabase
        .from("categories")
        .insert(categoryPayload)
        .select("*")
        .single();

  if (!categoryRow) {
    return null;
  }

  const weekdayValues = [1, 2, 3, 4, 5];

  await supabase.from("category_availability_rules").delete().eq("category_id", categoryRow.id);
  await supabase.from("category_availability_rules").insert(
    weekdayValues.map((weekday) => ({
      category_id: categoryRow.id,
      weekday,
      start_time: `${input.startTime}:00`,
      end_time: `${input.endTime}:00`,
    })),
  );

  const refreshed = await getCategoryById(String(categoryRow.id));
  return refreshed;
}

export async function saveSiteSettings(input: { maintenanceMode: boolean; maintenanceMessage: string }) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  if (existing?.id) {
    await supabase
      .from("site_settings")
      .update({
        maintenance_mode: input.maintenanceMode,
        maintenance_message: input.maintenanceMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("site_settings").insert({
      maintenance_mode: input.maintenanceMode,
      maintenance_message: input.maintenanceMessage,
    });
  }

  return getSiteSettings();
}

export async function createAdminAppointment(input: {
  categorySlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  startsAt: string;
  adminUserId: string;
  adminEmail: string;
}) {
  const category = await getPublicCategoryBySlug(input.categorySlug);

  if (!category) {
    throw new Error("Catégorie introuvable.");
  }

  const payload = await getCategorySlots(input.categorySlug);

  if (!payload) {
    throw new Error("Créneaux indisponibles.");
  }

  const selectedSlot = payload.slots.find((slot) => slot.start === input.startsAt);

  if (!selectedSlot || selectedSlot.isBlocked) {
    throw new Error("Le créneau sélectionné n'est plus disponible.");
  }

  const startsAt = parseISO(input.startsAt);
  const endsAt = addMinutes(startsAt, category.durationMinutes);
  const supabase = getSupabaseAdminClient();

  const record: AppointmentRecord = {
    id: randomUUID(),
    categoryId: category.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    clientMessage: input.message,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: "accepte",
    origin: "administrateur",
    createdByAdminUserId: input.adminUserId,
    createdByAdminEmail: input.adminEmail,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .insert({
        category_id: record.categoryId,
        first_name: record.firstName,
        last_name: record.lastName,
        email: record.email,
        phone: record.phone,
        client_message: record.clientMessage ?? null,
        starts_at: record.startsAt,
        ends_at: record.endsAt,
        status: record.status,
        origin: record.origin,
        created_by_admin_user_id: record.createdByAdminUserId,
        created_by_admin_email: record.createdByAdminEmail,
        cancel_reason: null,
        rejection_reason: null,
      })
      .select("*")
      .single();

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }
  }

  return record;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentRecord["status"],
  rejectionReason?: string,
) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .update({
        status,
        rejection_reason: rejectionReason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .select("*")
      .single();

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }
  }

  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
    return null;
  }

  return {
    ...appointment,
    status,
    rejectionReason,
  };
}
