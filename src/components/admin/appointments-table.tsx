import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { formatAppointmentStatus, formatDateTimeFr } from "@/lib/utils";
import type { AppointmentCategory, AppointmentRecord } from "@/types/domain";

interface AppointmentWithCategory extends AppointmentRecord {
  category?: AppointmentCategory;
}

interface AppointmentsTableProps {
  appointments: AppointmentWithCategory[];
}

function formatOriginLabel(appointment: AppointmentWithCategory) {
  if (appointment.origin === "administrateur") {
    return appointment.createdByAdminEmail
      ? `Admin (${appointment.createdByAdminEmail})`
      : "Admin";
  }

  return "Web";
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-slate-500">
        Aucun rendez-vous à afficher.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Créneau</th>
            <th className="px-5 py-3">Origine</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="transition-colors hover:bg-slate-50">
              <td className="px-5 py-3">
                <p className="font-semibold text-slate-900">
                  {appointment.firstName} {appointment.lastName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{appointment.email}</p>
              </td>
              <td className="px-5 py-3">{appointment.category?.title ?? "Catégorie supprimée"}</td>
              <td className="px-5 py-3 whitespace-nowrap">
                {formatDateTimeFr(appointment.startsAt)}
              </td>
              <td className="px-5 py-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {formatOriginLabel(appointment)}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {formatAppointmentStatus(appointment.status)}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/rendez-vous/${appointment.id}`}
                  className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                  title="Voir la fiche"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
