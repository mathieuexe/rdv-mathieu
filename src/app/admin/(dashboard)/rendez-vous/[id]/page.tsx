import { notFound } from "next/navigation";
import { Calendar, Mail, FileText, User, Tag, Clock, CheckCircle2, AlertCircle } from "lucide-react";

import { AppointmentDecisionPanel } from "@/components/admin/appointment-decision-panel";
import { getAppointmentById, getCategoryById } from "@/lib/data-access";
import { formatAppointmentMode, formatAppointmentStatus, formatDateTimeFr, formatPhone } from "@/lib/utils";

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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Highlights Panel */}
      <section className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Calendar className="size-8" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demande de Rendez-vous</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {appointment.firstName} {appointment.lastName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 md:gap-12">
          <div>
            <p className="text-xs text-slate-500">Statut</p>
            <p className="text-sm font-medium text-slate-900">{formatAppointmentStatus(appointment.status)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Date et heure</p>
            <p className="text-sm font-medium text-slate-900">
              {formatDateTimeFr(appointment.startsAt, { dateStyle: "short", timeStyle: "short" })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Catégorie</p>
            <p className="text-sm font-medium text-slate-900">{category?.title ?? "Inconnue"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Origine</p>
            <p className="text-sm font-medium text-slate-900">
              {appointment.origin === "administrateur" ? "Admin" : "Web"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact & Info Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <User className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Informations Client</h2>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Nom complet</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {appointment.firstName} {appointment.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{appointment.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Téléphone</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatPhone(appointment.phone) || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Créé par</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {appointment.origin === "administrateur"
                      ? `Administrateur (${appointment.createdByAdminEmail})`
                      : "Client (Site Web)"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Appointment Details Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Tag className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Détails du Rendez-vous</h2>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Catégorie</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{category?.title ?? "Inconnue"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mode</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {category ? formatAppointmentMode(category.appointmentMode) : "Mode indisponible"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Message client</p>
                  <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    {appointment.clientMessage || "Aucun message complémentaire."}
                  </div>
                </div>

                {category?.customFields && Object.keys(appointment.customFieldResponses || {}).length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 mb-2">Informations complémentaires (Champs personnalisés)</p>
                    <div className="rounded-md border border-slate-200 bg-white">
                      <dl className="divide-y divide-slate-200">
                        {category.customFields.map((field) => {
                          const response = appointment.customFieldResponses?.[field.id];
                          if (!response) return null;
                          return (
                            <div key={field.id} className="flex justify-between p-3 text-sm">
                              <dt className="font-medium text-slate-700">{field.label}</dt>
                              <dd className="text-slate-900">{response}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  </div>
                )}
              </div>

              {appointment.rejectionReason && (
                <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-rose-600" />
                    <p className="text-sm font-semibold text-rose-900">Motif de refus</p>
                  </div>
                  <p className="mt-2 text-sm text-rose-800">{appointment.rejectionReason}</p>
                </div>
              )}

              {appointment.cancelReason && (
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-900">
                      {appointment.status === "annule_admin" ? "Motif d'annulation administration" : "Motif d'annulation client"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-amber-800">{appointment.cancelReason}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Actions & Notifications */}
        <div className="space-y-6">
          {appointment.origin === "utilisateur" && (
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <CheckCircle2 className="size-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Décision</h2>
              </div>
              <div className="p-4">
                <AppointmentDecisionPanel appointmentId={appointment.id} />
              </div>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Mail className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Notifications</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-slate-400" />
                  Confirmation immédiate après la création avec statut en attente.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-slate-400" />
                  Email de validation si la demande est acceptée.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-slate-400" />
                  Email de refus avec motif si la demande est rejetée.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
