import { redirect } from "next/navigation";

import { AppointmentCancelForm } from "@/components/account/appointment-cancel-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicUserSession } from "@/lib/auth";
import { getUserAppointmentsByEmail } from "@/lib/data-access";

import { cancelAppointmentAction, logoutAccountAction } from "./actions";

function getStatusLabel(status: string) {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "accepte":
      return "Accepte";
    case "refuse":
      return "Refuse";
    case "annule_client":
      return "Annule";
    default:
      return status;
  }
}

export default async function AccountPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.email) {
    redirect("/connexion");
  }

  const appointments = await getUserAppointmentsByEmail(session.email);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader currentPath="/compte" />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Mon compte</p>
              <h1 className="mt-2 text-3xl font-semibold">Bonjour : {session.fullName}</h1>
              <p className="mt-2 text-sm text-neutral-600">{session.email}</p>
            </div>

            <form action={logoutAccountAction}>
              <button type="submit" className="underline underline-offset-4">
                Se deconnecter
              </button>
            </form>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Historique de mes rendez-vous</h2>

            {appointments.length === 0 ? (
              <p className="mt-6 text-neutral-600">Aucun rendez-vous n'est associe a ce compte pour le moment.</p>
            ) : (
              <div className="mt-6 space-y-6">
                {appointments.map((appointment) => {
                  const cancellable = appointment.status === "en_attente" || appointment.status === "accepte";

                  return (
                    <article key={appointment.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
                            {appointment.category?.title ?? "Rendez-vous"}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">
                            {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                              dateStyle: "full",
                              timeStyle: "short",
                            })}
                          </h3>
                          <p className="mt-2 text-sm text-neutral-600">Statut : {getStatusLabel(appointment.status)}</p>
                          {appointment.clientMessage ? (
                            <p className="mt-2 text-sm text-neutral-600">Message : {appointment.clientMessage}</p>
                          ) : null}
                          {appointment.rejectionReason ? (
                            <p className="mt-2 text-sm text-red-600">Motif du refus : {appointment.rejectionReason}</p>
                          ) : null}
                          {appointment.cancelReason ? (
                            <p className="mt-2 text-sm text-neutral-600">Motif d'annulation : {appointment.cancelReason}</p>
                          ) : null}
                        </div>
                      </div>

                      {cancellable ? (
                        <AppointmentCancelForm appointmentId={appointment.id} action={cancelAppointmentAction} />
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
