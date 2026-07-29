import { randomBytes, randomUUID } from "node:crypto";

import { addMinutes, parseISO } from "date-fns";

import { buildBookingSlots } from "@/lib/booking";
import { getEffectiveSiteSettings, normalizeAllowedIps } from "@/lib/maintenance";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AccountActivityLogRecord,
  AccountActivityType,
  AppointmentCategory,
  AppointmentRecord,
  AppointmentRequestPayload,
  BlackoutPeriod,
  DashboardMetrics,
  EmailLogRecord,
  SiteSettings,
  UserProfileRecord,
} from "@/types/domain";

const defaultSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "",
  maintenanceAllowedIps: [],
  enableWhatsappWidget: false,
  globalBlackoutPeriods: [],
};

async function getPublicReadClient() {
  const publicClient = await getSupabaseServerClient();
  return publicClient ?? getSupabaseAdminClient();
}

function getAppointmentWriteErrorMessage(error: { code?: string; message?: string } | null | undefined) {
  if (!error) {
    return "Impossible d'enregistrer le rendez-vous.";
  }

  if (error.code === "23505" || error.code === "23P01") {
    return "Ce créneau est déjà occupé par un autre rendez-vous.";
  }

  return error.message;
}

function mapBlackoutPeriod(row: Record<string, unknown>): BlackoutPeriod {
  return {
    id: String(row.id),
    startDate: String(row.start_date),
    startTime: typeof row.start_time === "string" ? String(row.start_time).slice(0, 5) : "00:00",
    endDate: String(row.end_date),
    endTime: typeof row.end_time === "string" ? String(row.end_time).slice(0, 5) : "23:59",
    message: typeof row.message === "string" ? row.message : undefined,
  };
}

function getBlackoutStart(period: BlackoutPeriod) {
  return parseISO(`${period.startDate}T${period.startTime}:00`);
}

function getBlackoutEnd(period: BlackoutPeriod) {
  return parseISO(`${period.endDate}T${period.endTime}:00`);
}

function findOverlappingBlackoutPeriod(startIso: string, endIso: string, periods: BlackoutPeriod[]) {
  const start = parseISO(startIso);
  const end = parseISO(endIso);

  return periods.find((period) => {
    const blackoutStart = getBlackoutStart(period);
    const blackoutEnd = getBlackoutEnd(period);
    return start < blackoutEnd && end > blackoutStart;
  });
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
    thumbnailImageUrl: typeof row.thumbnail_image_url === "string" ? row.thumbnail_image_url : undefined,
    bannerImageUrl: typeof row.banner_image_url === "string" ? row.banner_image_url : undefined,
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
    linkedUserId: typeof row.linked_user_id === "string" ? row.linked_user_id : undefined,
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

function mapEmailLogRow(row: Record<string, unknown>): EmailLogRecord {
  return {
    id: String(row.id),
    reference: String(row.reference),
    templateKey: String(row.template_key),
    sourceType: String(row.source_type),
    sourceLabel: String(row.source_label),
    recipientEmail: String(row.recipient_email),
    subject: String(row.subject),
    appointmentId: typeof row.appointment_id === "string" ? row.appointment_id : undefined,
    resendEmailId: typeof row.resend_email_id === "string" ? row.resend_email_id : undefined,
    deliveryStatus:
      row.delivery_status === "not_configured" || row.delivery_status === "failed" ? row.delivery_status : "sent",
    metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {},
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapUserProfileRow(row: Record<string, unknown>): UserProfileRecord {
  return {
    userId: String(row.user_id),
    email: String(row.email),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: typeof row.phone === "string" ? row.phone : undefined,
    requiresPasswordChange: Boolean(row.requires_password_change),
    role: String(row.role ?? "Prospect"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function pickRandomCharacter(alphabet: string) {
  const index = randomBytes(1)[0] % alphabet.length;
  return alphabet[index] ?? alphabet[0] ?? "A";
}

function shuffleCharacters(characters: string[]) {
  const result = [...characters];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const nextIndex = randomBytes(1)[0] % (index + 1);
    [result[index], result[nextIndex]] = [result[nextIndex] ?? result[index] ?? "", result[index] ?? result[nextIndex] ?? ""];
  }

  return result;
}

function createTemporaryPassword() {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const specials = "!@#$%^&*_-+=";
  const alphabet = `${lowercase}${uppercase}${digits}${specials}`;
  const passwordCharacters = [
    pickRandomCharacter(lowercase),
    pickRandomCharacter(uppercase),
    pickRandomCharacter(digits),
    pickRandomCharacter(specials),
  ];

  while (passwordCharacters.length < 14) {
    passwordCharacters.push(pickRandomCharacter(alphabet));
  }

  return shuffleCharacters(passwordCharacters).join("");
}

function mapAccountActivityLogRow(row: Record<string, unknown>): AccountActivityLogRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    actionType: row.action_type as AccountActivityType,
    actionLabel: String(row.action_label),
    description: typeof row.description === "string" ? row.description : undefined,
    appointmentId: typeof row.appointment_id === "string" ? row.appointment_id : undefined,
    ipAddress: typeof row.ip_address === "string" ? row.ip_address : undefined,
    country: typeof row.country === "string" ? row.country : undefined,
    region: typeof row.region === "string" ? row.region : undefined,
    city: typeof row.city === "string" ? row.city : undefined,
    deviceType: typeof row.device_type === "string" ? row.device_type : undefined,
    operatingSystem: typeof row.operating_system === "string" ? row.operating_system : undefined,
    browser: typeof row.browser === "string" ? row.browser : undefined,
    userAgent: typeof row.user_agent === "string" ? row.user_agent : undefined,
    metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {},
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function getSiteSettings() {
  const supabase = await getPublicReadClient();

  if (supabase) {
    const [{ data: settingsRow }, { data: blackoutRows }] = await Promise.all([
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      supabase.from("global_blackout_periods").select("*").order("start_date").order("start_time"),
    ]);

    if (settingsRow) {
      const siteSettings: SiteSettings = {
        maintenanceMode: Boolean(settingsRow.maintenance_mode),
        maintenanceMessage:
          typeof settingsRow.maintenance_message === "string"
            ? settingsRow.maintenance_message
            : "",
        maintenanceAllowedIps: normalizeAllowedIps(settingsRow.maintenance_allowed_ips),
        enableWhatsappWidget: Boolean(settingsRow.enable_whatsapp_widget),
        globalBlackoutPeriods: (blackoutRows ?? []).map((row) => mapBlackoutPeriod(row as Record<string, unknown>)),
      };

      return siteSettings;
    }
  }

  return defaultSiteSettings;
}

export async function getPublicCategories() {
  const supabase = await getPublicReadClient();

  if (supabase) {
    const [{ data: categoryRows }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").eq("is_online", true).order("created_at"),
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

  return [];
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

  return [];
}

export async function getPublicCategoryBySlug(slug: string) {
  const supabase = await getPublicReadClient();

  if (supabase) {
    const [{ data: categoryRow }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").eq("slug", slug).eq("is_online", true).maybeSingle(),
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

  return null;
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

  return null;
}

export async function getAppointments() {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase.from("appointments").select("*").order("starts_at");

    if (data?.length) {
      return data.map((row) => mapAppointmentRow(row as Record<string, unknown>));
    }
  }

  return [];
}

export async function getAppointmentById(appointmentId: string) {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }
  }

  return null;
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

export async function getCategorySlots(slug: string, options?: { bypassMaintenance?: boolean }) {
  const category = await getPublicCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const [siteSettings, appointments] = await Promise.all([getSiteSettings(), getAppointments()]);
  const effectiveSiteSettings = getEffectiveSiteSettings(siteSettings, Boolean(options?.bypassMaintenance));

  return {
    category,
    siteSettings: effectiveSiteSettings,
    slots: buildBookingSlots({
      category,
      siteSettings: effectiveSiteSettings,
      appointments,
    }),
  };
}

export async function createAppointmentRequest(
  payload: AppointmentRequestPayload,
  options?: {
    requestedByUserId?: string;
  },
) {
  const category = await getPublicCategoryBySlug(payload.categorySlug);

  if (!category) {
    throw new Error("Catégorie introuvable.");
  }

  const startsAt = parseISO(payload.startsAt);
  const endsAt = addMinutes(startsAt, category.durationMinutes);

  const record: AppointmentRecord = {
    id: randomUUID(),
    categoryId: category.id,
    linkedUserId: options?.requestedByUserId,
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
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        category_id: record.categoryId,
        linked_user_id: record.linkedUserId ?? null,
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

    if (error) {
      throw new Error(getAppointmentWriteErrorMessage(error));
    }

    if (data) {
      return {
        appointment: mapAppointmentRow(data as Record<string, unknown>),
        category,
        requestedByUserId: options?.requestedByUserId,
      };
    }
  }

  throw new Error("L'enregistrement du rendez-vous est indisponible tant que Supabase n'est pas configure.");
}

export async function getAppointmentsView() {
  const [appointments, categories] = await Promise.all([getAppointments(), getCategories()]);

  return appointments.map((appointment) => ({
    ...appointment,
    category: categories.find((item) => item.id === appointment.categoryId) as AppointmentCategory | undefined,
  }));
}

export async function getUserAppointmentsForAccount(input: { userId?: string; email?: string }) {
  const normalizedEmail = input.email?.trim().toLowerCase() ?? "";
  const supabase = getSupabaseAdminClient();
  const categories = await getCategories();

  if (supabase && (input.userId || normalizedEmail)) {
    let query = supabase.from("appointments").select("*").order("starts_at", { ascending: false });

    if (input.userId && normalizedEmail) {
      query = query.or(`linked_user_id.eq.${input.userId},email.ilike.${normalizedEmail}`);
    } else if (input.userId) {
      query = query.eq("linked_user_id", input.userId);
    } else {
      query = query.ilike("email", normalizedEmail);
    }

    const { data } = await query;
    const uniqueRows = Array.from(new Map((data ?? []).map((row) => [String((row as Record<string, unknown>).id), row])).values());

    return uniqueRows.map((row) => {
      const appointment = mapAppointmentRow(row as Record<string, unknown>);

      return {
        ...appointment,
        category: categories.find((item) => item.id === appointment.categoryId) as AppointmentCategory | undefined,
      };
    });
  }

  return [];
}

export async function getUserAppointmentsByEmail(email: string) {
  return getUserAppointmentsForAccount({ email });
}

export async function getUserProfileByUserId(userId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !userId) {
    return null;
  }

  const { data } = await supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle();
  return data ? mapUserProfileRow(data as Record<string, unknown>) : null;
}

export async function getUserProfiles() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  return (data ?? []).map((row) => mapUserProfileRow(row as Record<string, unknown>));
}

export async function getAdminUserDetail(userId: string) {
  const profile = await getUserProfileByUserId(userId);

  if (!profile) {
    return null;
  }

  const [appointments, logs] = await Promise.all([
    getUserAppointmentsForAccount({ userId: profile.userId, email: profile.email }),
    getUserAccountActivityLogs(profile.userId, 200),
  ]);

  return {
    profile,
    appointments,
    logs,
  };
}

export async function updateUserProfileByUserId(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La mise à jour du profil est indisponible tant que Supabase n'est pas configuré.");
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", input.userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserProfileRow(data as Record<string, unknown>);
}

export async function setUserPasswordChangeRequirement(userId: string, requiresPasswordChange: boolean) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La mise à jour de sécurité du profil est indisponible tant que Supabase n'est pas configuré.");
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      requires_password_change: requiresPasswordChange,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createManagedUserAccount(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La création de compte est indisponible tant que Supabase n'est pas configuré.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const temporaryPassword = createTemporaryPassword();
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Le compte client n'a pas pu être créé.");
  }

  await updateUserProfileByUserId({
    userId: data.user.id,
    email: normalizedEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
  });

  await setUserPasswordChangeRequirement(data.user.id, true);

  return {
    userId: data.user.id,
    email: normalizedEmail,
    temporaryPassword,
  };
}

export async function updateManagedUserAccount(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La mise à jour du compte client est indisponible tant que Supabase n'est pas configuré.");
  }

  const existingProfile = await getUserProfileByUserId(input.userId);

  if (!existingProfile) {
    throw new Error("Le client sélectionné est introuvable.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const authPayload: {
    email?: string;
    email_confirm?: boolean;
    user_metadata: {
      first_name: string;
      last_name: string;
    };
  } = {
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
    },
  };

  if (normalizedEmail !== existingProfile.email.toLowerCase()) {
    authPayload.email = normalizedEmail;
    authPayload.email_confirm = true;
  }

  const { error } = await supabase.auth.admin.updateUserById(input.userId, authPayload);

  if (error) {
    throw new Error(error.message);
  }

  const profile = await updateUserProfileByUserId({
    userId: input.userId,
    email: normalizedEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
  });

  if (normalizedEmail !== existingProfile.email.toLowerCase()) {
    await reassignAppointmentsEmailForUser(existingProfile.email, normalizedEmail);
  }

  return profile;
}

export async function deleteManagedUserAccount(userId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La suppression de compte est indisponible tant que Supabase n'est pas configuré.");
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reassignAppointmentsEmailForUser(previousEmail: string, nextEmail: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !previousEmail || !nextEmail || previousEmail === nextEmail) {
    return;
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      email: nextEmail,
      updated_at: new Date().toISOString(),
    })
    .ilike("email", previousEmail);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createAccountActivityLog(input: {
  userId: string;
  actionType: AccountActivityType;
  actionLabel: string;
  description?: string;
  appointmentId?: string;
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !input.userId) {
    return null;
  }

  const { data } = await supabase
    .from("account_activity_logs")
    .insert({
      user_id: input.userId,
      action_type: input.actionType,
      action_label: input.actionLabel,
      description: input.description ?? null,
      appointment_id: input.appointmentId ?? null,
      ip_address: input.ipAddress ?? null,
      country: input.country ?? null,
      region: input.region ?? null,
      city: input.city ?? null,
      device_type: input.deviceType ?? null,
      operating_system: input.operatingSystem ?? null,
      browser: input.browser ?? null,
      user_agent: input.userAgent ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .maybeSingle();

  return data ? mapAccountActivityLogRow(data as Record<string, unknown>) : null;
}

export async function getUserAccountActivityLogs(userId: string, limit = 100) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || !userId) {
    return [];
  }

  const { data } = await supabase
    .from("account_activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapAccountActivityLogRow(row as Record<string, unknown>));
}

export async function cancelUserAppointmentById(
  appointmentId: string,
  input: { email: string; userId?: string },
  cancelReason: string,
) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();

  if (!existing) {
    return null;
  }

  const existingRow = existing as Record<string, unknown>;
  const canManage =
    (typeof existingRow.email === "string" && existingRow.email.toLowerCase() === normalizedEmail) ||
    (typeof existingRow.linked_user_id === "string" && existingRow.linked_user_id === input.userId);

  if (!canManage || !["en_attente", "accepte"].includes(String(existingRow.status ?? ""))) {
    return null;
  }

  const { data } = await supabase
    .from("appointments")
    .update({
      status: "annule_client",
      cancel_reason: cancelReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .select("*")
    .maybeSingle();

  return data ? mapAppointmentRow(data as Record<string, unknown>) : null;
}

export async function cancelAppointmentsOverlappingGlobalBlackouts(defaultReason: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);

  if (settings.globalBlackoutPeriods.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .in("status", ["en_attente", "accepte"])
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []).map((row) => mapAppointmentRow(row as Record<string, unknown>));
  const overlappingAppointments = appointments
    .map((appointment) => ({
      appointment,
      blackout: findOverlappingBlackoutPeriod(appointment.startsAt, appointment.endsAt, settings.globalBlackoutPeriods),
      category: categories.find((category) => category.id === appointment.categoryId),
    }))
    .filter((item) => item.blackout);

  const cancelledAppointments = [];

  for (const item of overlappingAppointments) {
    const reason = item.blackout?.message?.trim() || defaultReason;
    const { data: updated, error: updateError } = await supabase
      .from("appointments")
      .update({
        status: "annule_admin",
        cancel_reason: reason,
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.appointment.id)
      .in("status", ["en_attente", "accepte"])
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updated) {
      cancelledAppointments.push({
        appointment: mapAppointmentRow(updated as Record<string, unknown>),
        category: item.category,
        reason,
      });
    }
  }

  return cancelledAppointments;
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
  thumbnailImageUrl?: string;
  bannerImageUrl?: string;
  availabilityRules: Array<{
    weekday: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
    enabled: boolean;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }>;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("L'enregistrement des catégories est indisponible tant que Supabase n'est pas configuré.");
  }

  if (!input.availabilityRules.some((rule) => rule.enabled)) {
    throw new Error("Sélectionnez au moins un jour de disponibilité.");
  }

  const categoryPayload = {
    title: input.title,
    slug: input.slug,
    duration_minutes: input.durationMinutes,
    appointment_mode: input.appointmentMode,
    description: input.description,
    is_online: input.isOnline,
    custom_message: input.customMessage ?? null,
    thumbnail_image_url: input.thumbnailImageUrl ?? null,
    banner_image_url: input.bannerImageUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: categoryRow, error: categoryError } = input.categoryId
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

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!categoryRow) {
    throw new Error("La catégorie n'a pas pu être enregistrée.");
  }

  const { error: deleteRulesError } = await supabase.from("category_availability_rules").delete().eq("category_id", categoryRow.id);

  if (deleteRulesError) {
    throw new Error(deleteRulesError.message);
  }

  const weekdayMap = {
    dimanche: 0,
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
  } as const;

  const availabilityRows = input.availabilityRules.flatMap((rule) => {
    if (!rule.enabled) {
      return [];
    }

    if (rule.startTime >= rule.endTime) {
      throw new Error(`Le jour ${rule.weekday} contient une plage horaire invalide.`);
    }

    const hasBreakStart = Boolean(rule.breakStart);
    const hasBreakEnd = Boolean(rule.breakEnd);

    if (hasBreakStart !== hasBreakEnd) {
      throw new Error(`Le jour ${rule.weekday} doit contenir les deux heures de pause repas ou aucune.`);
    }

    if (!hasBreakStart || !hasBreakEnd) {
      return [
        {
          category_id: categoryRow.id,
          weekday: weekdayMap[rule.weekday],
          start_time: `${rule.startTime}:00`,
          end_time: `${rule.endTime}:00`,
        },
      ];
    }

    if (rule.breakStart! >= rule.breakEnd!) {
      throw new Error(`Le jour ${rule.weekday} contient une pause repas invalide.`);
    }

    if (rule.breakStart! <= rule.startTime || rule.breakEnd! >= rule.endTime) {
      throw new Error(`La pause repas du jour ${rule.weekday} doit être comprise entre le début et la fin.`);
    }

    return [
      {
        category_id: categoryRow.id,
        weekday: weekdayMap[rule.weekday],
        start_time: `${rule.startTime}:00`,
        end_time: `${rule.breakStart}:00`,
      },
      {
        category_id: categoryRow.id,
        weekday: weekdayMap[rule.weekday],
        start_time: `${rule.breakEnd}:00`,
        end_time: `${rule.endTime}:00`,
      },
    ];
  });

  const { error: insertRulesError } =
    availabilityRows.length > 0
      ? await supabase.from("category_availability_rules").insert(availabilityRows)
      : { error: null };

  if (insertRulesError) {
    throw new Error(insertRulesError.message);
  }

  const refreshed = await getCategoryById(String(categoryRow.id));

  if (!refreshed) {
    throw new Error("La catégorie a été enregistrée mais n'a pas pu être relue.");
  }

  return refreshed;
}

export async function saveSiteSettings(input: {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceAllowedIps: string[];
  enableWhatsappWidget: boolean;
  globalBlackoutPeriods: Array<{
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    message?: string;
  }>;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("L'enregistrement des paramètres est indisponible tant que Supabase n'est pas configuré.");
  }

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("site_settings")
      .update({
        maintenance_mode: input.maintenanceMode,
        maintenance_message: input.maintenanceMessage,
        maintenance_allowed_ips: input.maintenanceAllowedIps,
        enable_whatsapp_widget: input.enableWhatsappWidget,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("site_settings").insert({
      maintenance_mode: input.maintenanceMode,
      maintenance_message: input.maintenanceMessage,
      maintenance_allowed_ips: input.maintenanceAllowedIps,
      enable_whatsapp_widget: input.enableWhatsappWidget,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  const { error: clearBlackoutsError } = await supabase.from("global_blackout_periods").delete().gte("start_date", "0001-01-01");

  if (clearBlackoutsError) {
    throw new Error(clearBlackoutsError.message);
  }

  if (input.globalBlackoutPeriods.length > 0) {
    const { error: insertBlackoutsError } = await supabase.from("global_blackout_periods").insert(
      input.globalBlackoutPeriods.map((period) => ({
        start_date: period.startDate,
        start_time: period.startTime,
        end_date: period.endDate,
        end_time: period.endTime,
        message: period.message?.trim() ? period.message.trim() : null,
      })),
    );

    if (insertBlackoutsError) {
      throw new Error(insertBlackoutsError.message);
    }
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
  linkedUserId?: string;
  adminUserId: string;
  adminEmail: string;
}) {
  const category = await getPublicCategoryBySlug(input.categorySlug);

  if (!category) {
    throw new Error("Catégorie introuvable.");
  }

  const payload = await getCategorySlots(input.categorySlug, { bypassMaintenance: true });

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
    linkedUserId: input.linkedUserId,
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
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        category_id: record.categoryId,
        linked_user_id: record.linkedUserId ?? null,
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

    if (error) {
      throw new Error(getAppointmentWriteErrorMessage(error));
    }

    if (data) {
      return mapAppointmentRow(data as Record<string, unknown>);
    }
  }

  throw new Error("La creation administrateur est indisponible tant que Supabase n'est pas configure.");
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

  return null;
}

export async function getEmailLogByReference(reference: string) {
  const normalizedReference = reference.trim().toUpperCase();
  const supabase = getSupabaseAdminClient();

  if (!supabase || !normalizedReference) {
    return null;
  }

  const { data } = await supabase
    .from("email_logs")
    .select("*")
    .eq("reference", normalizedReference)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return mapEmailLogRow(data as Record<string, unknown>);
}

export async function getRecentEmailLogs(limit = 20) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapEmailLogRow(row as Record<string, unknown>));
}
