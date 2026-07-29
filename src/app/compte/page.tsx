import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Phone, Video, XCircle } from "lucide-react";

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
      return "Accepté";
    case "refuse":
      return "Refusé";
    case "annule_client":
      return "Annulé";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  if (status === "accepte") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "refuse") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "annule_client") {
    return "border-neutral-200 bg-neutral-100 text-neutral-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusDescription(status: string) {
  if (status === "accepte") {
    return "Votre rendez-vous est confirmé.";
  }

  if (status === "refuse") {
    return "Cette demande n'a pas pu être validée.";
  }

  if (status === "annule_client") {
    return "Ce rendez-vous a été annulé depuis votre espace.";
  }

  return "Votre demande attend encore la validation de l'administration.";
}

function getModeIcon(mode?: string) {
  if (mode === "telephone") {
    return Phone;
  }

  if (mode === "physique") {
    return MapPin;
  }

  return Video;
}

export default async function AccountPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.email) {
    redirect("/connexion");
  }

  const appointments = await getUserAppointmentsForAccount({
    userId: session.userId,
    email: session.email,
  });
  const acceptedCount = appointments.filter((appointment) => appointment.status === "accepte").length;
  const pendingCount = appointments.filter((appointment) => appointment.status === "en_attente").length;
  const cancelledCount = appointments.filter((appointment) => appointment.status === "annule_client").length;
  const nextAppointment =
    appointments
      .filter((appointment) => appointment.status === "accepte")
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))[0] ?? null;

  return (
    <AccountShell
      session={session}
      currentPath="/compte"
      title="Mes rendez-vous"
      description="Retrouvez ici l'ensemble de vos demandes, leur statut de validation, le type de rendez-vous choisi et les éventuelles actions disponibles."
    >
      <section className="grid gap-4 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
        <article className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Prochain rendez-vous</p>
          {nextAppointment ? (
            <>
              <p className="mt-3 text-2xl font-semibold text-neutral-950">
                {formatDateTimeFr(nextAppointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
              </p>
              <p className="mt-2 text-sm text-neutral-600">{nextAppointment.category?.title ?? "Rendez-vous"}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-500">
                <CalendarDays className="size-4" />
                {nextAppointment.category?.appointmentMode
                  ? formatAppointmentMode(nextAppointment.category.appointmentMode)
                  : "Type non disponible"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-2xl font-semibold text-neutral-950">Aucun rendez-vous confirmé</p>
              <p className="mt-2 text-sm text-neutral-600">
                Vos prochains rendez-vous validés apparaîtront ici automatiquement.
              </p>
            </>
          )}
        </article>

        <article className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Confirmés</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-950">{acceptedCount}</p>
          <p className="mt-2 text-sm text-neutral-600">Rendez-vous déjà validés.</p>
        </article>

        <article className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">En attente</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-950">{pendingCount}</p>
          <p className="mt-2 text-sm text-neutral-600">Demandes en cours de traitement.</p>
        </article>

        <article className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Annulés</p>
          <p className="mt-4 text-3xl font-semibold text-neutral-950">{cancelledCount}</p>
          <p className="mt-2 text-sm text-neutral-600">Rendez-vous annulés depuis votre compte.</p>
        </article>
      </section>

      {appointments.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <p className="text-lg font-medium text-neutral-900">Aucun rendez-vous n&apos;est associé à ce compte pour le moment.</p>
          <p className="mt-3 text-sm text-neutral-500">Vos prochaines demandes apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {appointments.map((appointment) => {
            const cancellable = appointment.status === "en_attente" || appointment.status === "accepte";
            const mode = appointment.category?.appointmentMode;
            const ModeIcon = getModeIcon(mode);
            const isAccepted = appointment.status === "accepte";
            const isRefused = appointment.status === "refuse";
            const isCancelled = appointment.status === "annule_client";

            return (
              <article
                key={appointment.id}
                className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                      {appointment.category?.title ?? "Rendez-vous"}
                    </p>
                    <h2 className="text-2xl font-semibold text-neutral-950">
                      {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-neutral-600">{getStatusDescription(appointment.status)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                      {appointment.origin === "administrateur" ? "Ajouté par l'administration" : "Réservé en ligne"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 xl:grid-cols-4">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-neutral-900">
                      <CalendarDays className="size-4 text-neutral-500" />
                      <p className="text-sm font-medium">Date et heure</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-neutral-900">
                      <ModeIcon className="size-4 text-neutral-500" />
                      <p className="text-sm font-medium">Type de rendez-vous</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {mode ? formatAppointmentMode(mode) : "Non disponible"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-neutral-900">
                      <Clock3 className="size-4 text-neutral-500" />
                      <p className="text-sm font-medium">Statut actuel</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">{getStatusLabel(appointment.status)}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-neutral-900">
                      {isAccepted ? (
                        <CheckCircle2 className="size-4 text-neutral-500" />
                      ) : isRefused || isCancelled ? (
                        <XCircle className="size-4 text-neutral-500" />
                      ) : (
                        <Clock3 className="size-4 text-neutral-500" />
                      )}
                      <p className="text-sm font-medium">Prise en charge</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {appointment.origin === "administrateur" && appointment.createdByAdminEmail
                        ? `Par ${appointment.createdByAdminEmail}`
                        : appointment.origin === "administrateur"
                          ? "Par l'administration"
                          : "Depuis le site"}
                    </p>
                  </div>
                </div>

                {appointment.clientMessage ? (
                  <div className="mt-5 rounded-2xl border border-neutral-200 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-900">Votre message</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">{appointment.clientMessage}</p>
                  </div>
                ) : null}

                {appointment.rejectionReason ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                    <p className="text-sm font-medium text-red-900">Motif du refus</p>
                    <p className="mt-2 text-sm leading-7 text-red-700">{appointment.rejectionReason}</p>
                  </div>
                ) : null}

                {appointment.cancelReason ? (
                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <p className="text-sm font-medium text-neutral-900">Motif d&apos;annulation</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">{appointment.cancelReason}</p>
                  </div>
                ) : null}

                {cancellable ? (
                  <div className="mt-5 border-t border-neutral-200 pt-5">
                    <AppointmentCancelForm appointmentId={appointment.id} action={cancelAppointmentAction} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
