import {
  type AppointmentCategory,
  type AppointmentRecord,
  type SiteSettings,
} from "@/types/domain";

const now = new Date();

function shiftDays(days: number, hour: number, minute = 0) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const demoSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage:
    "Le planning est momentanément indisponible. Merci de réessayer un peu plus tard.",
  globalBlackoutPeriods: [
    {
      id: "global-summer-break",
      startDate: "2026-08-10",
      endDate: "2026-08-17",
      message: "Congés d'été : les réservations reprennent à partir du 18 août.",
    },
  ],
};

export const demoCategories: AppointmentCategory[] = [
  {
    id: "cat-consultation-30",
    slug: "consultation-30min",
    title: "Consultation découverte 30 min",
    description:
      "Un échange rapide pour qualifier votre besoin, répondre à vos premières questions et définir la meilleure suite à donner.",
    durationMinutes: 30,
    appointmentMode: "visioconference",
    isOnline: true,
    customMessage: "Merci d'indiquer en quelques mots l'objectif du rendez-vous.",
    availabilityRules: [
      { weekday: "lundi", windows: [{ start: "09:00", end: "12:00" }] },
      { weekday: "mardi", windows: [{ start: "09:00", end: "12:00" }] },
      { weekday: "jeudi", windows: [{ start: "14:00", end: "18:00" }] },
      { weekday: "vendredi", windows: [{ start: "09:00", end: "12:00" }] },
    ],
    blackoutPeriods: [
      {
        id: "consultation-training",
        startDate: "2026-08-04",
        endDate: "2026-08-05",
        message: "Formation en cours sur cette période.",
      },
    ],
  },
  {
    id: "cat-audit-45",
    slug: "audit-express-45min",
    title: "Audit express 45 min",
    description:
      "Un rendez-vous plus approfondi pour analyser votre situation et repartir avec des recommandations concrètes.",
    durationMinutes: 45,
    appointmentMode: "physique",
    isOnline: true,
    customMessage: "Merci d'apporter vos documents utiles lors du rendez-vous.",
    availabilityRules: [
      { weekday: "mercredi", windows: [{ start: "10:00", end: "12:00" }] },
      { weekday: "jeudi", windows: [{ start: "09:00", end: "12:00" }] },
      { weekday: "vendredi", windows: [{ start: "14:00", end: "18:00" }] },
    ],
    blackoutPeriods: [],
  },
  {
    id: "cat-call-back",
    slug: "appel-telephonique-15min",
    title: "Rappel téléphonique 15 min",
    description:
      "Un créneau court pour un point rapide, une question précise ou un suivi après un premier échange.",
    durationMinutes: 15,
    appointmentMode: "telephone",
    isOnline: false,
    customMessage: "Cette catégorie est hors ligne pour le moment. Contactez-nous si votre besoin est urgent.",
    availabilityRules: [
      { weekday: "lundi", windows: [{ start: "14:00", end: "18:00" }] },
      { weekday: "mardi", windows: [{ start: "14:00", end: "18:00" }] },
    ],
    blackoutPeriods: [],
  },
];

export const demoAppointments: AppointmentRecord[] = [
  {
    id: "app-1",
    categoryId: "cat-consultation-30",
    firstName: "Marie",
    lastName: "Durand",
    email: "marie@example.com",
    phone: "0601020304",
    clientMessage: "J'aimerais faire le point sur mon activité.",
    startsAt: shiftDays(1, 9, 0),
    endsAt: shiftDays(1, 9, 30),
    status: "en_attente",
    createdAt: new Date().toISOString(),
  },
  {
    id: "app-2",
    categoryId: "cat-audit-45",
    firstName: "Hugo",
    lastName: "Martin",
    email: "hugo@example.com",
    phone: "0701020304",
    clientMessage: "Audit de mon organisation commerciale.",
    startsAt: shiftDays(2, 10, 0),
    endsAt: shiftDays(2, 10, 45),
    status: "accepte",
    createdAt: new Date().toISOString(),
  },
  {
    id: "app-3",
    categoryId: "cat-consultation-30",
    firstName: "Lina",
    lastName: "Petit",
    email: "lina@example.com",
    phone: "0600001111",
    clientMessage: "Disponibilités flexibles.",
    startsAt: shiftDays(3, 14, 0),
    endsAt: shiftDays(3, 14, 30),
    status: "refuse",
    rejectionReason: "Absence exceptionnelle sur ce créneau.",
    createdAt: new Date().toISOString(),
  },
];
