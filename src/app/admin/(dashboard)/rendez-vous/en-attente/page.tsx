import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getPendingAppointmentsView } from "@/lib/data-access";

export default async function PendingAppointmentsPage() {
  const appointments = await getPendingAppointmentsView();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Validation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Rendez-vous en attente</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Toutes les demandes effectuées par les utilisateurs doivent être acceptées ou refusées par un administrateur.
        </p>
      </div>

      <div className="mt-6">
        <AppointmentsTable appointments={appointments} />
      </div>
    </section>
  );
}
