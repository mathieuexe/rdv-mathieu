import Link from "next/link";
import { ArrowRight, CalendarClock, Inbox, LogOut, ShieldCheck } from "lucide-react";

import { MetricCard } from "@/components/admin/metric-card";
import { getAppointmentsView, getCategories, getDashboardMetrics, getSiteSettings } from "@/lib/data-access";
import { formatAppointmentStatus } from "@/lib/utils";

import { logoutAction } from "../login/actions";

export default async function AdminDashboardPage() {
  const [metrics, appointments, categories, siteSettings] = await Promise.all([
    getDashboardMetrics(),
    getAppointmentsView(),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-900">
              Tableau de bord
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Une vue claire sur vos réservations et la disponibilité de votre activité.
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Gérez vos catégories, traitez les demandes en attente et ajustez la visibilité du planning depuis un même
              espace.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              <LogOut className="size-4" />
              <span>Se déconnecter</span>
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Demandes totales" value={metrics.totalAppointments} accent="cyan" />
        <MetricCard label="En attente" value={metrics.pendingAppointments} accent="amber" />
        <MetricCard label="Acceptées" value={metrics.acceptedAppointments} accent="emerald" />
        <MetricCard label="Refusées" value={metrics.refusedAppointments} accent="rose" />
        <MetricCard label="Catégories en ligne" value={metrics.onlineCategories} accent="cyan" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Demandes récentes</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">À traiter en priorité</h2>
            </div>
            <Link href="/admin/rendez-vous" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-800">
              <span>Voir tout</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-300"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {appointment.firstName} {appointment.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{appointment.category?.title ?? "Catégorie supprimée"}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {formatAppointmentStatus(appointment.status)}
                  </span>
                  <Link href={`/admin/rendez-vous/${appointment.id}`} className="text-sm font-medium text-cyan-800">
                    Consulter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 text-slate-900">
              <CalendarClock className="size-5 text-cyan-700" />
              <h2 className="text-2xl font-semibold">Catégories publiées</h2>
            </div>
            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{category.title}</p>
                      <p className="text-sm text-slate-600">/{category.slug}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        category.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {category.isOnline ? "En ligne" : "Hors ligne"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 text-slate-900">
              <ShieldCheck className="size-5 text-cyan-700" />
              <h2 className="text-2xl font-semibold">État du site</h2>
            </div>
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Maintenance</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {siteSettings.maintenanceMode ? "Activée" : "Désactivée"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{siteSettings.maintenanceMessage}</p>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Inbox className="size-4 text-cyan-700" />
                <p className="font-semibold">Indisponibilités globales</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {siteSettings.globalBlackoutPeriods.map((period) => (
                  <li key={period.id}>
                    {period.startDate} → {period.endDate} : {period.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
