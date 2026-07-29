import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const PARIS_TIME_ZONE = "Europe/Paris";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAppointmentMode(mode: "telephone" | "physique" | "visioconference") {
  if (mode === "telephone") {
    return "Téléphonique";
  }

  if (mode === "physique") {
    return "Présentiel";
  }

  return "Visioconférence";
}

export function formatAppointmentStatus(status: "en_attente" | "accepte" | "refuse" | "annule_client" | "annule_admin") {
  if (status === "en_attente") {
    return "En attente";
  }

  if (status === "accepte") {
    return "Accepté";
  }

  if (status === "annule_client") {
    return "Annulé par le client";
  }

  if (status === "annule_admin") {
    return "Annulé par l'administration";
  }

  return "Refusé";
}

export function formatDateTimeFr(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    hour12: false,
    ...options,
  }).format(typeof value === "string" ? new Date(value) : value);
}
