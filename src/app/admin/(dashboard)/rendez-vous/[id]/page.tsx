import { notFound } from "next/navigation";

import { AppointmentDecisionPanel } from "@/components/admin/appointment-decision-panel";
import { getAppointmentById, getCategoryById } from "@/lib/data-access";
import { formatAppointmentMode, formatAppointmentStatus } from "@/lib/utils";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  const category = await getCategoryById(appointment.categoryId);

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Demande</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {appointment.firstName} {appointment.lastName}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {appointment.email} · {appointment.phone}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Catégorie</p>
            <p className="mt-2 font-semibold text-slate-950">{category?.title}</p>
            <p className="mt-2 text-sm text-slate-600">
              {category ? formatAppointmentMode(category.appointmentMode) : "Mode indisponible"}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Statut</p>
            <p className="mt-2 font-semibold text-slate-950">{formatAppointmentStatus(appointment.status)}</p>
            <p className="mt-2 text-sm text-slate-600">
              {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Message client</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {appointment.clientMessage ?? "Aucun message complémentaire."}
          </p>
        </div>

        {appointment.rejectionReason ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-semibold text-rose-900">Motif de refus</p>
            <p className="mt-3 text-sm leading-7 text-rose-800">{appointment.rejectionReason}</p>
          </div>
        ) : null}

        {appointment.cancelReason ? (
          <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">Motif d'annulation client</p>
            <p className="mt-3 text-sm leading-7 text-amber-800">{appointment.cancelReason}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <AppointmentDecisionPanel appointmentId={appointment.id} />
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Email</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Notifications prévues</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>Confirmation immédiate après la création avec statut en attente.</li>
            <li>Email de validation si la demande est acceptée.</li>
            <li>Email de refus avec motif si la demande est rejetée.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
