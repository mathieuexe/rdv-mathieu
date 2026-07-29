import { describe, expect, it } from "vitest";

import { buildBookingSlots, groupSlotsByDay } from "./booking";
import type { AppointmentCategory, AppointmentRecord, SiteSettings } from "@/types/domain";

function getNextWeekdayAtTime(weekday: number, hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  let diff = (weekday - date.getDay() + 7) % 7;

  if (diff === 0 && date <= new Date()) {
    diff = 7;
  }

  date.setDate(date.getDate() + diff);
  return date;
}

const nextMondayStart = getNextWeekdayAtTime(1, 9, 0);
const nextMondayEnd = getNextWeekdayAtTime(1, 9, 30);

const testSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "",
  maintenanceAllowedIps: [],
  enableWhatsappWidget: false,
  globalBlackoutPeriods: [],
};

const testCategories: AppointmentCategory[] = [
  {
    id: "cat-consultation",
    slug: "consultation",
    title: "Consultation",
    description: "Consultation standard",
    durationMinutes: 30,
    appointmentMode: "visioconference",
    isOnline: true,
    customMessage: "",
    availabilityRules: [
      { weekday: "lundi", windows: [{ start: "09:00", end: "12:00" }] },
      { weekday: "mardi", windows: [{ start: "09:00", end: "12:00" }] },
    ],
    blackoutPeriods: [],
  },
];

const testAppointments: AppointmentRecord[] = [
  {
    id: "app-1",
    categoryId: "cat-consultation",
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    phone: "0600000000",
    startsAt: nextMondayStart.toISOString(),
    endsAt: nextMondayEnd.toISOString(),
    status: "en_attente",
    origin: "utilisateur",
    createdAt: new Date().toISOString(),
  },
];

describe("buildBookingSlots", () => {
  it("retourne des créneaux pour une catégorie en ligne", () => {
    const slots = buildBookingSlots({
      category: testCategories[0],
      siteSettings: testSiteSettings,
      appointments: testAppointments,
      daysToShow: 10,
    });

    expect(slots.length).toBeGreaterThan(0);
  });

  it("bloque les créneaux qui entrent en conflit avec une demande existante", () => {
    const slots = buildBookingSlots({
      category: testCategories[0],
      siteSettings: testSiteSettings,
      appointments: testAppointments,
      daysToShow: 10,
    });

    expect(slots.some((slot) => slot.isBlocked && slot.reason?.includes("Créneau déjà occupé"))).toBe(true);
  });

  it("bloque aussi un créneau pris dans une autre catégorie", () => {
    const slots = buildBookingSlots({
      category: {
        ...testCategories[0],
        id: "cat-bilan",
        slug: "bilan",
        title: "Bilan",
      },
      siteSettings: testSiteSettings,
      appointments: testAppointments,
      daysToShow: 10,
    });

    expect(slots.some((slot) => slot.isBlocked && slot.reason?.includes("Créneau déjà occupé"))).toBe(true);
  });

  it("regroupe les créneaux par jour ISO", () => {
    const slots = buildBookingSlots({
      category: testCategories[0],
      siteSettings: testSiteSettings,
      appointments: testAppointments,
      daysToShow: 10,
    });

    const grouped = groupSlotsByDay(slots);

    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });

  it("bloque uniquement les créneaux couverts par une indisponibilité globale horaire", () => {
    const partialBlackoutStart = getNextWeekdayAtTime(1, 9, 30);
    const partialBlackoutEnd = getNextWeekdayAtTime(1, 10, 0);
    const slots = buildBookingSlots({
      category: testCategories[0],
      siteSettings: {
        ...testSiteSettings,
        globalBlackoutPeriods: [
          {
            id: "global-blackout-1",
            startDate: partialBlackoutStart.toISOString().slice(0, 10),
            startTime: "09:30",
            endDate: partialBlackoutEnd.toISOString().slice(0, 10),
            endTime: "10:00",
            message: "Indisponibilité ponctuelle",
          },
        ],
      },
      appointments: [],
      daysToShow: 10,
    });

    const slotAtNine = slots.find((slot) => slot.label === "09:00" && slot.start.slice(0, 10) === partialBlackoutStart.toISOString().slice(0, 10));
    const slotAtNineThirty = slots.find(
      (slot) => slot.label === "09:30" && slot.start.slice(0, 10) === partialBlackoutStart.toISOString().slice(0, 10),
    );

    expect(slotAtNine?.isBlocked).toBe(false);
    expect(slotAtNineThirty?.isBlocked).toBe(true);
    expect(slotAtNineThirty?.reason).toContain("Indisponibilité ponctuelle");
  });
});
