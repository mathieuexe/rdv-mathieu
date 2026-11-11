import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import {
  AdminBlackoutCancellationEmail,
  AppointmentCancellationEmail,
  AppointmentReminderEmail,
  AppointmentRescheduledEmail,
  SignupConfirmationEmail,
  ValidatedAppointmentEmail,
} from "./email-templates";

const reference = "REF-A1B2C3";
const slot = "jeudi 12 novembre 2026 à 09:00";

const clientEmails: Array<{ name: string; element: ReactElement; expected: string[] }> = [
  {
    name: "1-inscription",
    element: SignupConfirmationEmail({ firstName: "Camille", email: "camille@example.com", reference }),
    expected: ["Votre compte est créé", "camille@example.com", "/connexion"],
  },
  {
    name: "2-confirmation-rendez-vous",
    element: ValidatedAppointmentEmail({
      firstName: "Camille",
      email: "camille@example.com",
      categoryTitle: "Consultation découverte 30 min",
      startsAtLabel: slot,
      appointmentModeLabel: "Téléphonique",
      phone: "06 12 34 56 78",
      reference,
    }),
    expected: ["Votre rendez-vous est confirmé", slot, "06 12 34 56 78"],
  },
  {
    name: "3-rappel-rendez-vous",
    element: AppointmentReminderEmail({
      firstName: "Camille",
      categoryTitle: "Consultation découverte 30 min",
      startsAtLabel: slot,
      appointmentModeLabel: "Téléphonique",
      phone: "06 12 34 56 78",
      reference,
    }),
    expected: ["Rappel de votre rendez-vous", slot],
  },
  {
    name: "4-annulation-rendez-vous",
    element: AppointmentCancellationEmail({
      firstName: "Camille",
      email: "camille@example.com",
      categoryTitle: "Consultation découverte 30 min",
      startsAtLabel: slot,
      reason: "Empêchement professionnel",
      reference,
    }),
    expected: ["Votre rendez-vous est annulé", "Empêchement professionnel"],
  },
  {
    name: "5-deplacement-rendez-vous",
    element: AppointmentRescheduledEmail({
      firstName: "Camille",
      categoryTitle: "Consultation découverte 30 min",
      previousStartsAtLabel: slot,
      startsAtLabel: "vendredi 13 novembre 2026 à 14:30",
      appointmentModeLabel: "Téléphonique",
      reason: "Changement d'agenda",
      reference,
    }),
    expected: ["Votre rendez-vous est déplacé", "vendredi 13 novembre 2026 à 14:30", slot],
  },
  {
    name: "6-indisponibilite-creneau",
    element: AdminBlackoutCancellationEmail({
      firstName: "Camille",
      email: "camille@example.com",
      categoryTitle: "Consultation découverte 30 min",
      appointmentDateLabel: "jeudi 12 novembre 2026",
      appointmentTimeLabel: "09:00",
      reason: "Fermeture exceptionnelle",
      reference,
    }),
    expected: ["Votre rendez-vous ne peut pas avoir lieu", "Fermeture exceptionnelle"],
  },
];

// `EMAIL_PREVIEW_DIR=dossier npm test` écrit en plus un aperçu HTML de chaque email.
const previewDir = process.env.EMAIL_PREVIEW_DIR;

describe("emails client", () => {
  for (const email of clientEmails) {
    it(`${email.name} : contenu, version texte et règles anti-spam`, async () => {
      const html = await render(email.element);
      const text = await render(email.element, { plainText: true });

      // La version texte met les titres en capitales : la comparaison ignore la casse.
      for (const fragment of [...email.expected, "Bonjour Camille", reference]) {
        expect(text.toLowerCase()).toContain(fragment.toLowerCase());
      }

      expect(html).toContain('lang="fr"');
      // Rien de ce qui déclenche les filtres : ni script, ni image distante, ni formulaire.
      expect(html).not.toMatch(/<script|<img|<form|<iframe/i);

      if (previewDir) {
        mkdirSync(previewDir, { recursive: true });
        writeFileSync(path.join(previewDir, `${email.name}.html`), html);
        writeFileSync(path.join(previewDir, `${email.name}.txt`), text);
      }
    });
  }
});
