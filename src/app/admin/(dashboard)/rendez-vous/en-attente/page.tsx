import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getPendingAppointmentsView } from "@/lib/data-access";

export default async function PendingAppointmentsPage() {
  const appointments = await getPendingAppointmentsView();

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Validation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Rendez-vous en attente</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Toutes les demandes effectuees par les utilisateurs doivent etre acceptees ou refusees par un administrateur.
        </p>
      </div>

      <div className="mt-6">
        <AppointmentsTable appointments={appointments} />
      </div>
    </section>
  );
}
