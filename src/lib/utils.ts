import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumber } from "libphonenumber-js";

const PARIS_TIME_ZONE = "Europe/Paris";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      // Pour forcer l'affichage avec des espaces (ex: 06 01 02 03 04)
      return phoneNumber.formatNational();
    }
  } catch (e) {
    // ignore
  }
  return phone;
}

export function formatAppointmentMode(mode: "telephone" | "physique" | "visioconference" | "discord" | any) {
  if (mode === "telephone") {
    return "Téléphonique";
  }

  if (mode === "physique") {
    return "Présentiel";
  }

  if (mode === "discord") {
    return "Discord (Vocal ou écrit)";
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

/** Découpe un instant ISO en valeurs de formulaire (date + heure) à l'heure de Paris. */
export function toParisInputValues(iso: string) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((accumulator, part) => {
      if (part.type !== "literal") {
        accumulator[part.type] = part.value;
      }

      return accumulator;
    }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}
