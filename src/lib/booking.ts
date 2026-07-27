import { addDays, addMinutes, endOfDay, format, isAfter, isBefore, isEqual, parseISO, startOfDay } from "date-fns";

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

function isWithinBlackout(date: Date, periods: BlackoutPeriod[]) {
  return periods.find((period) => {
    const start = startOfDay(parseISO(period.startDate));
    const end = endOfDay(parseISO(period.endDate));

    return (isAfter(date, start) || isEqual(date, start)) && (isBefore(date, end) || isEqual(date, end));
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
  if (!category.isOnline || siteSettings.maintenanceMode) {
    return [];
  }

  const slots: BookingSlot[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < daysToShow; dayOffset += 1) {
    const currentDate = addDays(startOfDay(now), dayOffset);
    const weekday = getWeekdayLabel(currentDate);
    const dayRules = category.availabilityRules.filter((rule) => rule.weekday === weekday);

    if (dayRules.length === 0) {
      continue;
    }

    const globalBlackout = isWithinBlackout(currentDate, siteSettings.globalBlackoutPeriods);
    const categoryBlackout = isWithinBlackout(currentDate, category.blackoutPeriods);

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
          const busyAppointment = appointments.find(
            (appointment) =>
              appointment.categoryId === category.id &&
              (appointment.status === "en_attente" || appointment.status === "accepte") &&
              overlaps(slotStart, slotEnd, appointment),
          );

          const blackoutReason = globalBlackout?.message ?? categoryBlackout?.message;
          const isBlocked = Boolean(isPast || busyAppointment || blackoutReason);

          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            isBlocked,
            label: format(slotStart, "HH:mm"),
            dayLabel: format(slotStart, "EEEE d MMMM"),
            reason:
              blackoutReason ??
              (busyAppointment ? "Créneau déjà demandé ou confirmé." : undefined) ??
              (isPast ? "Créneau déjà passé." : undefined),
          });

          cursor = addMinutes(cursor, category.durationMinutes);
        }
      }
    }
  }

  return slots;
}

export function groupSlotsByDay(slots: BookingSlot[]) {
  return slots.reduce<Record<string, BookingSlot[]>>((groups, slot) => {
    const key = slot.start.slice(0, 10);
    groups[key] ??= [];
    groups[key].push(slot);
    return groups;
  }, {});
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

  const upcomingBlackout = category.blackoutPeriods.find((period) => {
    const start = parseISO(period.startDate);
    return start >= startOfDay(new Date());
  });

  return {
    available: true,
    title: "Réservation disponible",
    message: upcomingBlackout?.message ?? category.customMessage ?? "Choisissez le créneau qui vous convient.",
  };
}
