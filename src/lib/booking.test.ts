import { describe, expect, it } from "vitest";

import { buildBookingSlots, groupSlotsByDay } from "./booking";
import { demoAppointments, demoCategories, demoSiteSettings } from "./demo-data";

describe("buildBookingSlots", () => {
  it("retourne des créneaux pour une catégorie en ligne", () => {
    const slots = buildBookingSlots({
      category: demoCategories[0],
      siteSettings: demoSiteSettings,
      appointments: demoAppointments,
      daysToShow: 10,
    });

    expect(slots.length).toBeGreaterThan(0);
  });

  it("bloque les créneaux qui entrent en conflit avec une demande existante", () => {
    const slots = buildBookingSlots({
      category: demoCategories[0],
      siteSettings: demoSiteSettings,
      appointments: demoAppointments,
      daysToShow: 10,
    });

    expect(slots.some((slot) => slot.isBlocked && slot.reason?.includes("Créneau déjà demandé"))).toBe(true);
  });

  it("regroupe les créneaux par jour ISO", () => {
    const slots = buildBookingSlots({
      category: demoCategories[0],
      siteSettings: demoSiteSettings,
      appointments: demoAppointments,
      daysToShow: 5,
    });

    const grouped = groupSlotsByDay(slots);

    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });
});
