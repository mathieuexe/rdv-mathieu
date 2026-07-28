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
  return demoCategories.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryById(categoryId: string) {
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
