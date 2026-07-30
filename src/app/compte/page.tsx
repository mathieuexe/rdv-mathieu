import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, Phone, Video, XCircle, CalendarCheck, CalendarX, CalendarClock } from "lucide-react";

import { AppointmentCancelForm } from "@/components/account/appointment-cancel-form";
import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";
import { getUserAppointmentsForAccount } from "@/lib/data-access";
import { formatAppointmentMode, formatDateTimeFr } from "@/lib/utils";

import { cancelAppointmentAction } from "./actions";

function getStatusLabel(status: string) {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "accepte":
      return "Confirmé";
    case "refuse":
      return "Refusé";
    case "annule_client":
      return "Annulé";
    case "annule_admin":
      return "Annulé (Admin)";
    default:
      return status;
  }
}

function getStatusBadgeClasses(status: string) {
  if (status === "accepte") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "refuse") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (status === "annule_client" || status === "annule_admin") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getModeIcon(mode?: string) {
  if (mode === "telephone") return Phone;
  if (mode === "physique") return MapPin;
  return Video;
}

export default async function AccountPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.email) {
    redirect("/connexion");
  }

  if (session.isBanned) {
    redirect("/bloque");
  }

  if (session.requiresPasswordChange) {
    redirect("/compte/securite");
  }

  const appointments = await getUserAppointmentsForAccount({
    userId: session.userId,
    email: session.email,
  });
  const acceptedCount = appointments.filter((a) => a.status === "accepte").length;
  const pendingCount = appointments.filter((a) => a.status === "en_attente").length;
  const cancelledCount = appointments.filter((a) => a.status === "annule_client" || a.status === "annule_admin").length;
  const nextAppointment = appointments
    .filter((a) => a.status === "accepte")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null;

  return (
    <AccountShell
      session={session}
      currentPath="/compte"
      title="Mes rendez-vous"
      description="Consultez l'historique de vos demandes, leur statut de validation, et gérez vos réservations à venir."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 mb-3">
            <CalendarDays className="size-5 text-blue-600" />
            <h3 className="text-sm font-medium">Prochain rendez-vous</h3>
          </div>
          {nextAppointment ? (
            <div>
              <p className="text-lg font-bold text-slate-900">
                {formatDateTimeFr(nextAppointment.startsAt, { dateStyle: "short", timeStyle: "short" })}
              </p>
              <p className="text-sm text-slate-500 truncate mt-0.5">{nextAppointment.category?.title ?? "Rendez-vous"}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-slate-900">Aucun</p>
              <p className="text-sm text-slate-500 mt-0.5">Pas de RDV à venir</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 mb-3">
            <CalendarCheck className="size-5 text-emerald-600" />
            <h3 className="text-sm font-medium">Confirmés</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{acceptedCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 mb-3">
            <CalendarClock className="size-5 text-amber-600" />
            <h3 className="text-sm font-medium">En attente</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600 mb-3">
            <CalendarX className="size-5 text-slate-400" />
            <h3 className="text-sm font-medium">Annulés</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <CalendarDays className="mx-auto size-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">Aucun rendez-vous n&apos;est associé à ce compte.</p>
          <p className="mt-2 text-sm text-slate-500">Vos prochaines réservations apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => {
            const cancellable = appointment.status === "en_attente" || appointment.status === "accepte";
            const mode = appointment.category?.appointmentMode;
            const ModeIcon = getModeIcon(mode);

            return (
              <article
                key={appointment.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {appointment.category?.title ?? "Rendez-vous standard"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Type de rendez-vous</p>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <ModeIcon className="size-4 text-slate-400" />
                        {mode ? formatAppointmentMode(mode) : "Non précisé"}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Origine</p>
                      <p className="text-sm font-medium text-slate-900">
                        {appointment.origin === "administrateur" ? "Pris par l'administration" : "Réservé en ligne"}
                      </p>
                    </div>

                    {appointment.status === "accepte" && appointment.origin === "administrateur" && appointment.createdByAdminEmail && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Validé par</p>
                        <p className="text-sm font-medium text-slate-900">{appointment.createdByAdminEmail}</p>
                      </div>
                    )}
                  </div>

                  {appointment.clientMessage && (
                    <div className="mt-6 rounded-md bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Votre message</p>
                      <p className="text-sm text-slate-700">{appointment.clientMessage}</p>
                    </div>
                  )}

                  {appointment.rejectionReason && (
                    <div className="mt-6 rounded-md border border-rose-100 bg-rose-50 p-4">
                      <div className="flex items-center gap-2 text-rose-800 mb-2">
                        <XCircle className="size-4" />
                        <p className="text-sm font-bold">Motif du refus</p>
                      </div>
                      <p className="text-sm text-rose-700">{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {appointment.cancelReason && (
                    <div className="mt-6 rounded-md border border-amber-100 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 text-amber-800 mb-2">
                        <XCircle className="size-4" />
                        <p className="text-sm font-bold">Motif d&apos;annulation</p>
                      </div>
                      <p className="text-sm text-amber-700">{appointment.cancelReason}</p>
                    </div>
                  )}

                  {cancellable && (
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <AppointmentCancelForm appointmentId={appointment.id} action={cancelAppointmentAction} />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
