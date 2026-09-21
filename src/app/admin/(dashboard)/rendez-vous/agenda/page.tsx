import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { getAgendaAppointmentsView, getUpcomingGoogleCalendarEvents } from "@/lib/data-access";
import { DynamicAdminAgendaCalendar } from "@/components/admin/dynamic-admin-agenda-calendar";
import { GoogleCalendarBadge } from "@/components/shared/google-calendar-badge";
import { isGoogleCalendarConfigured } from "@/lib/env";
import { syncGoogleCalendarIfStale } from "@/lib/google-calendar-sync";

export default async function AgendaAppointmentsPage() {
  if (isGoogleCalendarConfigured()) {
    // Rafraîchit l'agenda personnel si la dernière synchronisation date de plus de 10 minutes.
    await syncGoogleCalendarIfStale();
  }

  const [appointments, googleEvents] = await Promise.all([
    getAgendaAppointmentsView(),
    getUpcomingGoogleCalendarEvents(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda confirmés</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cette page regroupe les rendez-vous pris et confirmés, qu&apos;ils aient été créés par un utilisateur ou par un administrateur.
          </p>
        </div>

        <Link
          href="/admin/google-calendar"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <GoogleCalendarBadge compact />
          {googleEvents.length > 0
            ? `${googleEvents.length} indisponibilité(s) perso`
            : "Synchroniser Google Agenda"}
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <CalendarDays className="size-4 text-slate-600" />
          <h2 className="font-semibold text-slate-800">Calendrier</h2>
        </div>
        <div className="p-4 md:p-6">
          <DynamicAdminAgendaCalendar appointments={appointments} googleEvents={googleEvents} />
        </div>
      </section>
    </div>
  );
}
