import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function formatAppointmentStatus(status: "en_attente" | "accepte" | "refuse") {
  if (status === "en_attente") {
    return "En attente";
  }

  if (status === "accepte") {
    return "Accepté";
  }

  return "Refusé";
}
