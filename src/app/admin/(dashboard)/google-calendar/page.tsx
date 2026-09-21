import Link from "next/link";
import { AlertTriangle, CalendarSync, CheckCircle2, Link2, RefreshCw, Save, TriangleAlert } from "lucide-react";

import { DisconnectGoogleCalendarForm, PendingSubmitButton } from "@/components/admin/google-calendar-controls";
import { GoogleCalendarBadge } from "@/components/shared/google-calendar-badge";
import { GoogleCalendarIcon } from "@/components/shared/google-calendar-icon";
import {
  getGoogleCalendarAccount,
  getGoogleCalendarConflicts,
  getUpcomingGoogleCalendarEvents,
} from "@/lib/data-access";
import { getGoogleOAuthEnv, isGoogleCalendarConfigured } from "@/lib/env";
import { listAvailableGoogleCalendars, syncGoogleCalendarIfStale } from "@/lib/google-calendar-sync";
import { formatDateTimeFr } from "@/lib/utils";

import {
  disconnectGoogleCalendarAction,
  saveGoogleCalendarPreferencesAction,
  syncGoogleCalendarAction,
} from "./actions";

export default async function GoogleCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; disconnected?: string; saved?: string; synced?: string; error?: string }>;
}) {
  const { connected, disconnected, saved, synced, error } = await searchParams;
  const isConfigured = isGoogleCalendarConfigured();

  if (isConfigured) {
    // Rafraîchit silencieusement si la dernière synchronisation date de plus de 10 minutes.
    await syncGoogleCalendarIfStale();
  }

  const [account, events, conflicts] = await Promise.all([
    getGoogleCalendarAccount(),
    getUpcomingGoogleCalendarEvents(),
    getGoogleCalendarConflicts(),
  ]);
  const calendars = account ? await listAvailableGoogleCalendars() : [];
  const { redirectUri } = getGoogleOAuthEnv();
  const upcomingEvents = events.filter((event) => new Date(event.endsAt) >= new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <GoogleCalendarIcon className="size-6" />
            Synchronisation Google Agenda
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vos rendez-vous personnels Google deviennent des indisponibilités sur le site : les créneaux concernés ne
            sont plus réservables.
          </p>
        </div>
      </section>

      {connected ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" />
          Compte Google connecté et agenda synchronisé.
        </div>
      ) : null}
      {disconnected ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          Compte Google déconnecté. Les indisponibilités importées ont été supprimées.
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Préférences de synchronisation enregistrées.
        </div>
      ) : null}
      {synced ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Synchronisation terminée : {synced} évènement(s) personnel(s) importé(s).
        </div>
      ) : null}
      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{decodeURIComponent(error)}</span>
        </div>
      ) : null}

      {!isConfigured ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:p-6">
          <p className="font-semibold">Identifiants Google manquants</p>
          <p className="mt-2">
            Ajoutez <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">GOOGLE_CLIENT_ID</code> et{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">GOOGLE_CLIENT_SECRET</code> à votre fichier
            d&apos;environnement, puis redémarrez le serveur.
          </p>
          <p className="mt-2">
            URI de redirection à déclarer dans Google Cloud :{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">{redirectUri}</code>
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <CalendarSync className="size-4 text-slate-600" />
          <h2 className="font-semibold text-slate-800">Compte connecté</h2>
        </div>

        <div className="space-y-5 p-4 md:p-6">
          {account ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Compte Google</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{account.googleEmail || "Compte Google"}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Dernière synchronisation</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {account.lastSyncedAt
                      ? formatDateTimeFr(account.lastSyncedAt, { dateStyle: "short", timeStyle: "short" })
                      : "Jamais"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Indisponibilités importées</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{upcomingEvents.length} à venir</p>
                </div>
              </div>

              {account.lastSyncError ? (
                <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>Dernière erreur : {account.lastSyncError}</span>
                </div>
              ) : null}

              {!account.hasRefreshToken ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Aucun jeton de rafraîchissement enregistré : reconnectez le compte pour que la synchronisation
                  automatique continue de fonctionner.
                </div>
              ) : null}

              <form action={saveGoogleCalendarPreferencesAction} className="space-y-4">
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-800">Agendas synchronisés</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Seuls les évènements « occupé » sont importés. Les évènements marqués « disponible » et les
                    invitations refusées sont ignorés.
                  </p>

                  <div className="mt-3 space-y-2">
                    {calendars.length === 0 ? (
                      <label className="flex items-center gap-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          name="calendarIds"
                          value="primary"
                          defaultChecked
                          className="size-4 rounded border-slate-300"
                        />
                        <span>Agenda principal</span>
                      </label>
                    ) : (
                      calendars.map((calendar) => (
                        <label key={calendar.id} className="flex items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            name="calendarIds"
                            value={calendar.id}
                            defaultChecked={
                              account.calendarIds.includes(calendar.id) ||
                              (calendar.primary && account.calendarIds.includes("primary"))
                            }
                            className="size-4 rounded border-slate-300"
                          />
                          <span>
                            {calendar.summary}
                            {calendar.primary ? (
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                                principal
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900">
                  <input
                    type="checkbox"
                    name="syncEnabled"
                    defaultChecked={account.syncEnabled}
                    className="size-4 rounded border-slate-300"
                  />
                  <span>
                    Bloquer les créneaux du site pendant mes rendez-vous personnels
                    <span className="block text-xs font-normal text-slate-500">
                      Décoché : les évènements importés sont supprimés et les créneaux redeviennent réservables.
                    </span>
                  </span>
                </label>

                <PendingSubmitButton
                  className="bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_8px_24px_rgba(48,128,238,0.25)]"
                  icon={<Save className="size-4" />}
                >
                  Enregistrer les préférences
                </PendingSubmitButton>
              </form>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <form action={syncGoogleCalendarAction}>
                  <PendingSubmitButton
                    className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    icon={<RefreshCw className="size-4" />}
                  >
                    Synchroniser maintenant
                  </PendingSubmitButton>
                </form>

                <Link
                  href="/api/admin/google-calendar/connect"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Link2 className="size-4" />
                  Reconnecter / changer de compte
                </Link>

                <DisconnectGoogleCalendarForm action={disconnectGoogleCalendarAction} />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Aucun compte Google n&apos;est connecté. La connexion utilise un accès en lecture seule à vos agendas :
                aucun évènement n&apos;est créé ni modifié dans Google.
              </p>

              <Link
                href="/api/admin/google-calendar/connect"
                prefetch={false}
                aria-disabled={!isConfigured}
                className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_8px_24px_rgba(48,128,238,0.25)] ${
                  isConfigured ? "" : "pointer-events-none opacity-50"
                }`}
              >
                <GoogleCalendarIcon className="size-4" />
                Connecter mon agenda Google
              </Link>

              <p className="text-xs text-slate-500">
                URI de redirection déclarée : <code className="font-mono">{redirectUri}</code>
              </p>
            </div>
          )}
        </div>
      </section>

      {conflicts.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3">
            <TriangleAlert className="size-4 text-amber-700" />
            <h2 className="font-semibold text-amber-900">Conflits avec des rendez-vous déjà pris</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {conflicts.map(({ appointment, event, category }) => (
              <div key={appointment.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    {appointment.firstName} {appointment.lastName} · {category?.title ?? "Rendez-vous"}
                  </p>
                  <p className="text-slate-500">
                    {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-700">
                    <GoogleCalendarBadge compact />
                    Chevauche « {event.summary} »
                  </p>
                </div>
                <Link
                  href={`/admin/rendez-vous/${appointment.id}`}
                  className="text-sm font-semibold text-slate-900 underline underline-offset-4"
                >
                  Gérer ce rendez-vous
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <GoogleCalendarIcon className="size-4" />
            <h2 className="font-semibold text-slate-800">Indisponibilités importées</h2>
          </div>
          <GoogleCalendarBadge />
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Aucun rendez-vous personnel importé pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p className="flex items-center gap-2 font-medium text-slate-900">
                    <GoogleCalendarBadge compact />
                    {event.summary}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {event.isAllDay
                      ? `${formatDateTimeFr(event.startsAt, { dateStyle: "full" })} · journée entière`
                      : `${formatDateTimeFr(event.startsAt, { dateStyle: "full", timeStyle: "short" })} → ${formatDateTimeFr(
                          event.endsAt,
                          { timeStyle: "short" },
                        )}`}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{event.calendarSummary ?? event.calendarId}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
