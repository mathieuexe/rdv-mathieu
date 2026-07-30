import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getPendingAppointmentsView } from "@/lib/data-access";

export default async function PendingAppointmentsPage() {
  const appointments = await getPendingAppointmentsView();

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rendez-vous en attente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Toutes les demandes à accepter ou refuser.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-0">
          <AppointmentsTable appointments={appointments} />
        </div>
      </section>
    </div>
  );
}
