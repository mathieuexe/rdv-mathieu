import { redirect } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Phone, Video } from "lucide-react";

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

  return (
    <AccountShell
      session={session}
      currentPath="/compte"
      title="Mes rendez-vous"
      description="Retrouvez ici l'ensemble de vos demandes, leur statut de validation, le type de rendez-vous choisi et les éventuelles actions disponibles."
    >
      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
          <p className="text-lg font-medium text-neutral-900">Aucun rendez-vous n&apos;est associé à ce compte pour le moment.</p>
          <p className="mt-3 text-sm text-neutral-500">Vos prochaines demandes apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {appointments.map((appointment) => {
            const cancellable = appointment.status === "en_attente" || appointment.status === "accepte";
            const mode = appointment.category?.appointmentMode;
            const ModeIcon = getModeIcon(mode);

            return (
              <article
                key={appointment.id}
                className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
                      {appointment.category?.title ?? "Rendez-vous"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                      {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                    </h2>
                  </div>

                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
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
