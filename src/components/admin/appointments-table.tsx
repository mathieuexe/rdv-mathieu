import Link from "next/link";

import { formatAppointmentStatus } from "@/lib/utils";
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
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-[#f8fafc] text-slate-500">
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
            <tr key={appointment.id} className="transition hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-950">
                  {appointment.firstName} {appointment.lastName}
                </p>
                <p className="mt-1 text-slate-500">{appointment.email}</p>
              </td>
              <td className="px-5 py-4">{appointment.category?.title ?? "Categorie supprimee"}</td>
              <td className="px-5 py-4">
                {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatOriginLabel(appointment)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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
