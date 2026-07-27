import Link from "next/link";

import { getAppointmentsView } from "@/lib/data-access";
import { formatAppointmentStatus } from "@/lib/utils";

export default async function AppointmentsPage() {
  const appointments = await getAppointmentsView();

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Traitement</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Demandes de rendez-vous</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Filtrez par statut, ouvrez une demande et validez-la en un clic depuis la page de détail.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Client</th>
              <th className="px-5 py-4 font-medium">Catégorie</th>
              <th className="px-5 py-4 font-medium">Créneau</th>
              <th className="px-5 py-4 font-medium">Statut</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {appointment.firstName} {appointment.lastName}
                  </p>
                  <p className="text-slate-500">{appointment.email}</p>
                </td>
                <td className="px-5 py-4">{appointment.category?.title}</td>
                <td className="px-5 py-4">
                  {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-4">{formatAppointmentStatus(appointment.status)}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/rendez-vous/${appointment.id}`} className="font-medium text-cyan-800">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
