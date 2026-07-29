import Link from "next/link";

import { AppointmentsTable } from "@/components/admin/appointments-table";
import { getAppointmentsView } from "@/lib/data-access";

export default async function AppointmentsPage() {
  const appointments = await getAppointmentsView();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Traitement</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Demandes de rendez-vous</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Retrouvez ici l&apos;ensemble des rendez-vous, leur origine et leur statut de validation.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/rendez-vous/en-attente"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Voir les rendez-vous en attente
        </Link>
        <Link
          href="/admin/rendez-vous/agenda"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Voir l&apos;agenda confirmé
        </Link>
        <Link
          href="/admin/rendez-vous/nouveau"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Créer un rendez-vous
        </Link>
      </div>

      <div className="mt-6">
        <AppointmentsTable appointments={appointments} />
      </div>
    </section>
  );
}
