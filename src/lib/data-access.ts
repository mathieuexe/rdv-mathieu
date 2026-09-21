import { randomBytes, randomUUID } from "node:crypto";

import { addMinutes, parseISO } from "date-fns";
import { unstable_cache } from "next/cache";

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
  BusyPeriod,
  DashboardMetrics,
  EmailLogRecord,
  GoogleCalendarAccount,
  GoogleCalendarEventRecord,
  SiteSettings,
  UserProfileRecord,
} from "@/types/domain";

const defaultSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "",
  maintenanceAllowedIps: [],
  enableWhatsappWidget: false,
  enableBlackoutMarquee: true,
  bookingBlocked: false,
  bookingBlockedMessage: null,
  globalBlackoutPeriods: [],
};

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
    isHidden: Boolean(row.is_hidden),
    customMessage: typeof row.custom_message === "string" ? row.custom_message : undefined,
    thumbnailImageUrl: typeof row.thumbnail_image_url === "string" ? row.thumbnail_image_url : undefined,
    bannerImageUrl: typeof row.banner_image_url === "string" ? row.banner_image_url : undefined,
    isBookingBlocked: Boolean(row.is_booking_blocked),
    bookingBlockMessage: typeof row.booking_block_message === "string" ? row.booking_block_message : undefined,
    customFields: Array.isArray(row.custom_fields) ? (row.custom_fields as any) : undefined,
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
    customFieldResponses: row.custom_field_responses && typeof row.custom_field_responses === "object" ? (row.custom_field_responses as Record<string, string>) : undefined,
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
    avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : undefined,
    phone: typeof row.phone === "string" ? row.phone : undefined,
    requiresPasswordChange: Boolean(row.requires_password_change),
    isBanned: Boolean(row.is_banned),
    banReason: typeof row.ban_reason === "string" ? row.ban_reason : undefined,
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

export const getSiteSettings = unstable_cache(async () => {
  const supabase = getSupabaseAdminClient();

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
        enableBlackoutMarquee: settingsRow.enable_blackout_marquee !== false, // Default to true
        bookingBlocked: Boolean(settingsRow.booking_blocked),
        bookingBlockedMessage: typeof settingsRow.booking_blocked_message === "string" ? settingsRow.booking_blocked_message : null,
        globalBlackoutPeriods: (blackoutRows ?? []).map((row) => mapBlackoutPeriod(row as Record<string, unknown>)),
      };

      return siteSettings;
    }
  }

  return defaultSiteSettings;
}, ["site-settings"], { revalidate: 60, tags: ["site-settings"] });

export const getPublicCategories = unstable_cache(async () => {
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const [{ data: categoryRows }, { data: ruleRows }, { data: blackoutRows }] = await Promise.all([
      supabase.from("categories").select("*").eq("is_online", true).or("is_hidden.eq.false,is_hidden.is.null").order("created_at"),
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
}, ["public-categories"], { revalidate: 60, tags: ["categories"] });

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

export const getPublicCategoryBySlug = unstable_cache(async (slug: string) => {
  const supabase = getSupabaseAdminClient();

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
}, ["public-category-by-slug"], { revalidate: 60, tags: ["categories"] });

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

export async function getAdminCategoryBySlug(slug: string) {
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

  const [siteSettings, appointments, busyPeriods] = await Promise.all([
    getSiteSettings(),
    getAppointments(),
    getPersonalBusyPeriods(),
  ]);
  const effectiveSiteSettings = getEffectiveSiteSettings(siteSettings, Boolean(options?.bypassMaintenance));

  return {
    category,
    siteSettings: effectiveSiteSettings,
    slots: buildBookingSlots({
      category,
      siteSettings: effectiveSiteSettings,
      appointments,
      busyPeriods,
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
    customFieldResponses: payload.customFieldResponses,
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
        custom_field_responses: record.customFieldResponses ?? {},
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

  const supabase = getSupabaseAdminClient();
  let authProvider = "email";
  if (supabase) {
    const { data } = await supabase.auth.admin.getUserById(userId);
    if (data?.user?.app_metadata?.provider) {
      authProvider = data.user.app_metadata.provider;
    }
  }

  const [appointments, logs] = await Promise.all([
    getUserAppointmentsForAccount({ userId: profile.userId, email: profile.email }),
    getUserAccountActivityLogs(profile.userId, 200),
  ]);

  return {
    profile,
    authProvider,
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
  avatarUrl?: string;
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
      avatar_url: input.avatarUrl,
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
  avatarUrl?: string;
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
    avatarUrl: input.avatarUrl,
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
  isHidden?: boolean;
  customMessage?: string;
  thumbnailImageUrl?: string;
  bannerImageUrl?: string;
  isBookingBlocked?: boolean;
  bookingBlockMessage?: string;
  customFields?: AppointmentCategory["customFields"];
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
    is_hidden: input.isHidden ?? false,
    custom_message: input.customMessage ?? null,
    thumbnail_image_url: input.thumbnailImageUrl ?? null,
    banner_image_url: input.bannerImageUrl ?? null,
    is_booking_blocked: input.isBookingBlocked ?? false,
    booking_block_message: input.bookingBlockMessage ?? null,
    custom_fields: input.customFields ?? [],
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
  enableBlackoutMarquee: boolean;
  bookingBlocked: boolean;
  bookingBlockedMessage: string | null;
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
        enable_blackout_marquee: input.enableBlackoutMarquee,
        booking_blocked: input.bookingBlocked,
        booking_blocked_message: input.bookingBlockedMessage,
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
      enable_blackout_marquee: input.enableBlackoutMarquee,
      booking_blocked: input.bookingBlocked,
      booking_blocked_message: input.bookingBlockedMessage,
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
  customFieldResponses?: Record<string, string>;
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
    customFieldResponses: input.customFieldResponses,
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
        custom_field_responses: record.customFieldResponses ?? {},
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

/* ------------------------------------------------------------------ */
/* Synchronisation Google Calendar (agenda personnel de l'administrateur) */
/* ------------------------------------------------------------------ */

function mapGoogleCalendarAccountRow(row: Record<string, unknown>): GoogleCalendarAccount {
  return {
    id: String(row.id),
    googleEmail: String(row.google_email ?? ""),
    calendarIds: Array.isArray(row.calendar_ids) ? (row.calendar_ids as string[]) : ["primary"],
    syncEnabled: row.sync_enabled !== false,
    tokenExpiresAt: String(row.token_expires_at ?? new Date().toISOString()),
    hasRefreshToken: typeof row.refresh_token === "string" && row.refresh_token.length > 0,
    lastSyncedAt: typeof row.last_synced_at === "string" ? row.last_synced_at : undefined,
    lastSyncError: typeof row.last_sync_error === "string" ? row.last_sync_error : undefined,
    lastSyncedEventCount: Number(row.last_synced_event_count ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapGoogleCalendarEventRow(row: Record<string, unknown>): GoogleCalendarEventRecord {
  return {
    id: String(row.id),
    googleEventId: String(row.google_event_id),
    calendarId: String(row.calendar_id),
    calendarSummary: typeof row.calendar_summary === "string" ? row.calendar_summary : undefined,
    summary: typeof row.summary === "string" && row.summary.trim() ? row.summary : "Occupé",
    startsAt: String(row.starts_at),
    endsAt: String(row.ends_at),
    isAllDay: Boolean(row.is_all_day),
    htmlLink: typeof row.html_link === "string" ? row.html_link : undefined,
    syncedAt: String(row.synced_at ?? new Date().toISOString()),
    isOverridden: Boolean(row.is_overridden),
    googleSummary: typeof row.google_summary === "string" ? row.google_summary : undefined,
    googleStartsAt: typeof row.google_starts_at === "string" ? row.google_starts_at : undefined,
    googleEndsAt: typeof row.google_ends_at === "string" ? row.google_ends_at : undefined,
    googleIsAllDay: Boolean(row.google_is_all_day),
  };
}

/** Compte Google connecté, jetons exclus (utilisable côté UI). */
export async function getGoogleCalendarAccount(): Promise<GoogleCalendarAccount | null> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("google_calendar_accounts")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return data ? mapGoogleCalendarAccountRow(data as Record<string, unknown>) : null;
}

/** Variante interne : inclut les jetons OAuth. Ne jamais exposer au client. */
export async function getGoogleCalendarAccountWithTokens() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("google_calendar_accounts")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const row = data as Record<string, unknown>;

  return {
    ...mapGoogleCalendarAccountRow(row),
    accessToken: String(row.access_token ?? ""),
    refreshToken: typeof row.refresh_token === "string" ? row.refresh_token : undefined,
    scope: typeof row.scope === "string" ? row.scope : undefined,
  };
}

export async function upsertGoogleCalendarAccount(input: {
  googleEmail: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt: string;
  scope?: string;
  calendarIds?: string[];
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La synchronisation Google est indisponible tant que Supabase n'est pas configuré.");
  }

  const existing = await getGoogleCalendarAccountWithTokens();

  if (existing) {
    const { data, error } = await supabase
      .from("google_calendar_accounts")
      .update({
        google_email: input.googleEmail,
        access_token: input.accessToken,
        // Google ne renvoie un refresh_token que lors du premier consentement.
        refresh_token: input.refreshToken ?? existing.refreshToken ?? null,
        token_expires_at: input.tokenExpiresAt,
        scope: input.scope ?? null,
        calendar_ids: input.calendarIds ?? existing.calendarIds,
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapGoogleCalendarAccountRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from("google_calendar_accounts")
    .insert({
      google_email: input.googleEmail,
      access_token: input.accessToken,
      refresh_token: input.refreshToken ?? null,
      token_expires_at: input.tokenExpiresAt,
      scope: input.scope ?? null,
      calendar_ids: input.calendarIds ?? ["primary"],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapGoogleCalendarAccountRow(data as Record<string, unknown>);
}

export async function updateGoogleCalendarAccessToken(accountId: string, accessToken: string, tokenExpiresAt: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("google_calendar_accounts")
    .update({ access_token: accessToken, token_expires_at: tokenExpiresAt, updated_at: new Date().toISOString() })
    .eq("id", accountId);
}

export async function updateGoogleCalendarPreferences(input: {
  accountId: string;
  calendarIds: string[];
  syncEnabled: boolean;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La synchronisation Google est indisponible tant que Supabase n'est pas configuré.");
  }

  const { error } = await supabase
    .from("google_calendar_accounts")
    .update({
      calendar_ids: input.calendarIds.length > 0 ? input.calendarIds : ["primary"],
      sync_enabled: input.syncEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.accountId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setGoogleCalendarSyncResult(input: {
  accountId: string;
  eventCount: number;
  error?: string | null;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("google_calendar_accounts")
    .update({
      last_synced_at: new Date().toISOString(),
      last_synced_event_count: input.eventCount,
      last_sync_error: input.error ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.accountId);
}

export async function deleteGoogleCalendarAccount(accountId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  // Les évènements sont supprimés en cascade.
  await supabase.from("google_calendar_accounts").delete().eq("id", accountId);
}

/** Remplace les évènements importés sur la fenêtre synchronisée. */
export async function replaceGoogleCalendarEvents(input: {
  accountId: string;
  calendarIds: string[];
  windowStartIso: string;
  windowEndIso: string;
  events: Array<{
    googleEventId: string;
    calendarId: string;
    calendarSummary?: string;
    summary: string;
    startsAt: string;
    endsAt: string;
    isAllDay: boolean;
    htmlLink?: string;
  }>;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La synchronisation Google est indisponible tant que Supabase n'est pas configuré.");
  }

  const syncedAt = new Date().toISOString();

  if (input.events.length > 0) {
    // Les indisponibilités retouchées à la main conservent leurs valeurs
    // effectives : seules les colonnes `google_*` sont rafraîchies.
    const { data: overriddenRows } = await supabase
      .from("google_calendar_events")
      .select("calendar_id, google_event_id, summary, starts_at, ends_at, is_all_day")
      .eq("account_id", input.accountId)
      .eq("is_overridden", true);

    const overrides = new Map(
      (overriddenRows ?? []).map((row) => [`${row.calendar_id}::${row.google_event_id}`, row]),
    );

    const { error } = await supabase.from("google_calendar_events").upsert(
      input.events.map((event) => {
        const override = overrides.get(`${event.calendarId}::${event.googleEventId}`);

        return {
          account_id: input.accountId,
          google_event_id: event.googleEventId,
          calendar_id: event.calendarId,
          calendar_summary: event.calendarSummary ?? null,
          summary: override ? String(override.summary ?? event.summary) : event.summary,
          starts_at: override ? String(override.starts_at) : event.startsAt,
          ends_at: override ? String(override.ends_at) : event.endsAt,
          is_all_day: override ? Boolean(override.is_all_day) : event.isAllDay,
          google_summary: event.summary,
          google_starts_at: event.startsAt,
          google_ends_at: event.endsAt,
          google_is_all_day: event.isAllDay,
          is_overridden: Boolean(override),
          html_link: event.htmlLink ?? null,
          synced_at: syncedAt,
        };
      }),
      { onConflict: "calendar_id,google_event_id" },
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  // Évènements supprimés/déplacés côté Google, ou agendas décochés.
  const { error: cleanupError } = await supabase
    .from("google_calendar_events")
    .delete()
    .eq("account_id", input.accountId)
    .lt("starts_at", input.windowEndIso)
    .gt("ends_at", input.windowStartIso)
    .neq("synced_at", syncedAt);

  if (cleanupError) {
    throw new Error(cleanupError.message);
  }

  if (input.calendarIds.length > 0) {
    const { error: staleCalendarsError } = await supabase
      .from("google_calendar_events")
      .delete()
      .eq("account_id", input.accountId)
      .not("calendar_id", "in", `(${input.calendarIds.map((id) => `"${id}"`).join(",")})`);

    if (staleCalendarsError) {
      throw new Error(staleCalendarsError.message);
    }
  }

  return input.events.length;
}

/** Retouche locale d'une indisponibilité importée (titre, début, fin). */
export async function updateGoogleCalendarEventOverride(input: {
  eventId: string;
  summary: string;
  startsAt: string;
  endsAt: string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La modification est indisponible tant que Supabase n'est pas configuré.");
  }

  const { data, error } = await supabase
    .from("google_calendar_events")
    .update({
      summary: input.summary,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      // Des horaires explicites ont été saisis : ce n'est plus une journée entière.
      is_all_day: false,
      is_overridden: true,
      overridden_at: new Date().toISOString(),
    })
    .eq("id", input.eventId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Indisponibilité introuvable.");
  }

  return mapGoogleCalendarEventRow(data as Record<string, unknown>);
}

/** Rétablit les valeurs reçues de Google pour une indisponibilité retouchée. */
export async function resetGoogleCalendarEventOverride(eventId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("La modification est indisponible tant que Supabase n'est pas configuré.");
  }

  const { data: existing } = await supabase
    .from("google_calendar_events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (!existing) {
    throw new Error("Indisponibilité introuvable.");
  }

  const row = existing as Record<string, unknown>;
  const { error } = await supabase
    .from("google_calendar_events")
    .update({
      summary: typeof row.google_summary === "string" ? row.google_summary : row.summary,
      starts_at: typeof row.google_starts_at === "string" ? row.google_starts_at : row.starts_at,
      ends_at: typeof row.google_ends_at === "string" ? row.google_ends_at : row.ends_at,
      is_all_day: Boolean(row.google_is_all_day),
      is_overridden: false,
      overridden_at: null,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAllGoogleCalendarEvents(accountId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase.from("google_calendar_events").delete().eq("account_id", accountId);
}

/** Évènements importés chevauchant une fenêtre donnée. */
export async function getGoogleCalendarEventsBetween(startIso: string, endIso: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("google_calendar_events")
    .select("*")
    .lt("starts_at", endIso)
    .gt("ends_at", startIso)
    .order("starts_at");

  return (data ?? []).map((row) => mapGoogleCalendarEventRow(row as Record<string, unknown>));
}

/** Évènements importés à venir, pour l'agenda d'administration. */
export async function getUpcomingGoogleCalendarEvents(daysAhead = 120) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return getGoogleCalendarEventsBetween(start.toISOString(), end.toISOString());
}

/** Périodes occupées à prendre en compte dans le calcul des créneaux publics. */
export async function getPersonalBusyPeriods(daysToShow = 21): Promise<BusyPeriod[]> {
  const start = new Date();
  const end = new Date(start.getTime() + daysToShow * 24 * 60 * 60 * 1000);
  const events = await getGoogleCalendarEventsBetween(start.toISOString(), end.toISOString());

  return events.map((event) => ({ start: event.startsAt, end: event.endsAt }));
}

/** Rendez-vous du site qui entrent en conflit avec un évènement personnel importé. */
export async function getGoogleCalendarConflicts() {
  const [events, appointments, categories] = await Promise.all([
    getUpcomingGoogleCalendarEvents(),
    getAppointments(),
    getCategories(),
  ]);

  const activeAppointments = appointments.filter(
    (appointment) =>
      (appointment.status === "en_attente" || appointment.status === "accepte") &&
      new Date(appointment.endsAt) >= new Date(),
  );

  return activeAppointments
    .map((appointment) => {
      const appointmentStart = parseISO(appointment.startsAt).getTime();
      const appointmentEnd = parseISO(appointment.endsAt).getTime();
      const event = events.find(
        (item) =>
          appointmentStart < parseISO(item.endsAt).getTime() && appointmentEnd > parseISO(item.startsAt).getTime(),
      );

      return event
        ? {
            appointment,
            event,
            category: categories.find((category) => category.id === appointment.categoryId),
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
