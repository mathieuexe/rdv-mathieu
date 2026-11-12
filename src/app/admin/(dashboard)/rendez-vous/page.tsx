import Link from "next/link";
import { Plus } from "@/components/icons";

import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getAppointmentsView } from "@/lib/data-access";

export default async function AppointmentsPage() {
  const appointments = await getAppointmentsView();

  return (
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Demandes de rendez-vous</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ensemble des rendez-vous, leur origine et statut de validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/rendez-vous/en-attente"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Vue En attente
          </Link>
          <Link
            href="/admin/rendez-vous/agenda"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Agenda
          </Link>
          <Link
            href="/admin/rendez-vous/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 shadow-sm px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Nouveau
          </Link>
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
