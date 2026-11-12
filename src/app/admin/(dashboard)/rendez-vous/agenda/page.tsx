import Link from "next/link";

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
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Agenda confirmés</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cette page regroupe les rendez-vous pris et confirmés, qu&apos;ils aient été créés par un utilisateur ou par un administrateur.
          </p>
        </div>

        <Link
          href="/admin/google-calendar"
          className="adm-btn adm-btn-secondary self-start"
        >
          <GoogleCalendarBadge compact />
          {googleEvents.length > 0
            ? `${googleEvents.length} indisponibilité(s) perso`
            : "Synchroniser Google Agenda"}
        </Link>
      </section>

      <DynamicAdminAgendaCalendar appointments={appointments} googleEvents={googleEvents} />
    </div>
  );
}
