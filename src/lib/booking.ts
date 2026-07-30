import { addDays, addMinutes, format, parseISO, startOfDay } from "date-fns";

import type {
  AppointmentCategory,
  AppointmentRecord,
  BlackoutPeriod,
  BookingSlot,
  SiteSettings,
  Weekday,
} from "@/types/domain";

const weekdays: Weekday[] = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

function getWeekdayLabel(date: Date) {
  return weekdays[date.getDay()];
}

function getBlackoutStart(period: BlackoutPeriod) {
  return parseISO(`${period.startDate}T${period.startTime}:00`);
}

function getBlackoutEnd(period: BlackoutPeriod) {
  return parseISO(`${period.endDate}T${period.endTime}:00`);
}

function findOverlappingBlackout(start: Date, end: Date, periods: BlackoutPeriod[]) {
  return periods.find((period) => {
    const blackoutStart = getBlackoutStart(period);
    const blackoutEnd = getBlackoutEnd(period);

    return start < blackoutEnd && end > blackoutStart;
  });
}

function overlaps(start: Date, end: Date, appointment: AppointmentRecord) {
  const appointmentStart = parseISO(appointment.startsAt);
  const appointmentEnd = parseISO(appointment.endsAt);

  return start < appointmentEnd && end > appointmentStart;
}

export function buildBookingSlots({
  category,
  siteSettings,
  appointments,
  daysToShow = 14,
}: {
  category: AppointmentCategory;
  siteSettings: SiteSettings;
  appointments: AppointmentRecord[];
  daysToShow?: number;
}): BookingSlot[] {
  if (!category.isOnline || siteSettings.maintenanceMode || category.isBookingBlocked) {
    return [];
  }

  const slots: BookingSlot[] = [];
  const seenSlots = new Set<string>();
  const now = new Date();

  for (let dayOffset = 0; dayOffset < daysToShow; dayOffset += 1) {
    const currentDate = addDays(startOfDay(now), dayOffset);
    const weekday = getWeekdayLabel(currentDate);
    const dayRules = category.availabilityRules.filter((rule) => rule.weekday === weekday);

    if (dayRules.length === 0) {
      continue;
    }

    for (const rule of dayRules) {
      for (const window of rule.windows) {
        const [startHour, startMinute] = window.start.split(":").map(Number);
        const [endHour, endMinute] = window.end.split(":").map(Number);

        let cursor = new Date(currentDate);
        cursor.setHours(startHour, startMinute, 0, 0);

        const windowEnd = new Date(currentDate);
        windowEnd.setHours(endHour, endMinute, 0, 0);

        while (addMinutes(cursor, category.durationMinutes) <= windowEnd) {
          const slotStart = new Date(cursor);
          const slotEnd = addMinutes(slotStart, category.durationMinutes);

          const isPast = slotStart <= now;
          const globalBlackout = findOverlappingBlackout(slotStart, slotEnd, siteSettings.globalBlackoutPeriods);
          const categoryBlackout = findOverlappingBlackout(slotStart, slotEnd, category.blackoutPeriods);
          const busyAppointment = appointments.find(
            (appointment) =>
              (appointment.status === "en_attente" || appointment.status === "accepte") &&
              overlaps(slotStart, slotEnd, appointment),
          );

          const blackoutReason = globalBlackout?.message ?? categoryBlackout?.message;
          const isBlocked = Boolean(isPast || busyAppointment || blackoutReason);

          const slotStartIso = slotStart.toISOString();
          if (!seenSlots.has(slotStartIso)) {
            seenSlots.add(slotStartIso);
            slots.push({
              start: slotStartIso,
              end: slotEnd.toISOString(),
              isBlocked,
              label: format(slotStart, "HH:mm"),
              dayLabel: format(slotStart, "EEEE d MMMM"),
              reason:
                blackoutReason ??
                (busyAppointment ? "Créneau déjà occupé par un autre rendez-vous." : undefined) ??
                (isPast ? "Créneau déjà passé." : undefined),
            });
          }

          cursor = addMinutes(cursor, category.durationMinutes);
        }
      }
    }
  }

  const sortedSlots = slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return sortedSlots;
}

export function groupSlotsByDay(slots: BookingSlot[]) {
  const groups = slots.reduce<Record<string, BookingSlot[]>>((acc, slot) => {
    const key = slot.start.slice(0, 10);
    acc[key] ??= [];
    acc[key].push(slot);
    return acc;
  }, {});

  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  return groups;
}

export function getBookingState(category: AppointmentCategory, siteSettings: SiteSettings) {
  if (siteSettings.maintenanceMode) {
    return {
      available: false,
      title: "Site en maintenance",
      message: siteSettings.maintenanceMessage,
    };
  }

  if (!category.isOnline) {
    return {
      available: false,
      title: "Catégorie indisponible",
      message: category.customMessage ?? "Cette catégorie est temporairement hors ligne.",
    };
  }

  if (category.isBookingBlocked) {
    return {
      available: false,
      title: "Réservation indisponible",
      message: category.bookingBlockMessage || "La réservation est temporairement indisponible pour cette catégorie.",
    };
  }

  const upcomingGlobalBlackout = siteSettings.globalBlackoutPeriods.find((period) => {
    const end = getBlackoutEnd(period);
    return end >= new Date();
  });

  const upcomingBlackout = category.blackoutPeriods.find((period) => {
    const end = getBlackoutEnd(period);
    return end >= new Date();
  });

  return {
    available: true,
    title: "Réservation disponible",
    message:
      upcomingGlobalBlackout?.message ??
      upcomingBlackout?.message ??
      category.customMessage ??
      "Choisissez le créneau qui vous convient.",
  };
}
