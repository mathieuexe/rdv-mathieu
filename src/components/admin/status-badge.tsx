import { cn, formatAppointmentStatus } from "@/lib/utils";
import type { AppointmentRecord } from "@/types/domain";

const tones: Record<AppointmentRecord["status"], string> = {
  en_attente: "bg-amber-50 text-amber-700 ring-amber-600/20",
  accepte: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  refuse: "bg-rose-50 text-rose-700 ring-rose-600/20",
  annule_client: "bg-slate-100 text-slate-600 ring-slate-500/20",
  annule_admin: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const dots: Record<AppointmentRecord["status"], string> = {
  en_attente: "bg-amber-500",
  accepte: "bg-emerald-500",
  refuse: "bg-rose-500",
  annule_client: "bg-slate-400",
  annule_admin: "bg-slate-400",
};

/** Statut d'un rendez-vous, avec une couleur par état pour une lecture immédiate. */
export function StatusBadge({ status, className }: { status: AppointmentRecord["status"]; className?: string }) {
  return (
    <span className={cn("adm-badge ring-1 ring-inset", tones[status], className)}>
      <span className={cn("size-1.5 rounded-full", dots[status])} aria-hidden="true" />
      {formatAppointmentStatus(status)}
    </span>
  );
}
