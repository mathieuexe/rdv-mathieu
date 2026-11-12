import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getPendingAppointmentsView } from "@/lib/data-access";

export default async function PendingAppointmentsPage() {
  const appointments = await getPendingAppointmentsView();

  return (
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Rendez-vous en attente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Toutes les demandes à accepter ou refuser.
          </p>
        </div>
      </section>

      <section className="adm-card">
        <div className="p-0">
          <AppointmentsTable appointments={appointments} />
        </div>
      </section>
    </div>
  );
}
