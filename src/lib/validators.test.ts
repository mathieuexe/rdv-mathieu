import { describe, expect, it } from "vitest";

import { adminAppointmentSchema } from "./validators";

const prospect = {
  categorySlug: "consultation",
  firstName: "Camille",
  lastName: "Martin",
  email: "",
  phone: "",
  message: "",
  customFieldResponsesJson: "",
  startsAt: "2026-11-12T08:00:00.000Z",
  linkedUserId: "",
  createClientAccount: false,
  updateLinkedUserProfile: false,
};

describe("rendez-vous créé par l'administration", () => {
  it("accepte un prospect avec seulement un prénom et un nom", () => {
    expect(adminAppointmentSchema.safeParse(prospect).success).toBe(true);
  });

  it("accepte un email facultatif valide et refuse un email mal formé", () => {
    expect(adminAppointmentSchema.safeParse({ ...prospect, email: "camille@example.com" }).success).toBe(true);
    expect(adminAppointmentSchema.safeParse({ ...prospect, email: "camille@" }).success).toBe(false);
  });

  it("exige un email pour créer un compte client", () => {
    expect(adminAppointmentSchema.safeParse({ ...prospect, createClientAccount: true }).success).toBe(false);
  });

  it("exige toujours le prénom et le nom", () => {
    expect(adminAppointmentSchema.safeParse({ ...prospect, lastName: "" }).success).toBe(false);
  });
});
