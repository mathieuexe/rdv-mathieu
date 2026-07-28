export type AppointmentMode = "telephone" | "physique" | "visioconference";

export type AppointmentStatus = "en_attente" | "accepte" | "refuse" | "annule_client";

export type Weekday =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi"
  | "dimanche";

export interface AvailabilityWindow {
  start: string;
  end: string;
}

export interface CategoryAvailabilityRule {
  weekday: Weekday;
  windows: AvailabilityWindow[];
}

export interface BlackoutPeriod {
  id: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface AppointmentCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  appointmentMode: AppointmentMode;
  isOnline: boolean;
  customMessage?: string;
  availabilityRules: CategoryAvailabilityRule[];
  blackoutPeriods: BlackoutPeriod[];
}

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  globalBlackoutPeriods: BlackoutPeriod[];
}

export interface AppointmentRecord {
  id: string;
  categoryId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientMessage?: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  cancelReason?: string;
  origin: "utilisateur" | "administrateur";
  createdByAdminUserId?: string;
  createdByAdminEmail?: string;
  createdAt: string;
}

export interface AppointmentRequestPayload {
  categorySlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  startsAt: string;
}

export interface BookingSlot {
  start: string;
  end: string;
  isBlocked: boolean;
  label: string;
  dayLabel: string;
  reason?: string;
}

export interface DashboardMetrics {
  totalAppointments: number;
  pendingAppointments: number;
  acceptedAppointments: number;
  refusedAppointments: number;
  onlineCategories: number;
}

export type EmailDeliveryStatus = "sent" | "not_configured" | "failed";

export interface EmailLogRecord {
  id: string;
  reference: string;
  templateKey: string;
  sourceType: string;
  sourceLabel: string;
  recipientEmail: string;
  subject: string;
  appointmentId?: string;
  resendEmailId?: string;
  deliveryStatus: EmailDeliveryStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
}
