import Link from "next/link";

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
      ? `Administrateur (${appointment.createdByAdminEmail})`
      : "Administrateur";
  }

  return "Utilisateur";
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-slate-300 px-5 py-10 text-sm text-slate-500">
        Aucun rendez-vous a afficher.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Client</th>
            <th className="px-5 py-4 font-medium">Categorie</th>
            <th className="px-5 py-4 font-medium">Creneau</th>
            <th className="px-5 py-4 font-medium">Origine</th>
            <th className="px-5 py-4 font-medium">Statut</th>
            <th className="px-5 py-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-950">
                  {appointment.firstName} {appointment.lastName}
                </p>
                <p className="mt-1 text-slate-500">{appointment.email}</p>
              </td>
              <td className="px-5 py-4">{appointment.category?.title ?? "Categorie supprimee"}</td>
              <td className="px-5 py-4">
                {formatDateTimeFr(appointment.startsAt)}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatOriginLabel(appointment)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatAppointmentStatus(appointment.status)}
                </span>
              </td>
              <td className="px-5 py-4">
                <Link href={`/admin/rendez-vous/${appointment.id}`} className="font-semibold text-blue-700">
                  Ouvrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
