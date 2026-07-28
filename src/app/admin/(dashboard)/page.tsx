import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, Inbox, LogOut, ShieldCheck } from "lucide-react";

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
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
        <div className="bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_50%,#06b6d4_100%)] px-6 py-8 text-white lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white">
                Tableau de bord
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Pilotez vos rendez-vous depuis un espace simple et clair.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-blue-50">
                Visualisez les demandes en attente, les rendez-vous confirmes, les categories actives et l'etat global du site.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <LogOut className="size-4" />
                <span>Se deconnecter</span>
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-3 lg:px-8">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.pendingAppointments}</p>
            <p className="mt-1 text-sm text-slate-600">Demandes a traiter rapidement</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Confirmes</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.acceptedAppointments}</p>
            <p className="mt-1 text-sm text-slate-600">Rendez-vous deja planifies</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Categories</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.onlineCategories}</p>
            <p className="mt-1 text-sm text-slate-600">Categories actuellement en ligne</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Demandes totales" value={metrics.totalAppointments} accent="cyan" />
        <MetricCard label="Rendez-vous en attente" value={metrics.pendingAppointments} accent="amber" />
        <MetricCard label="Rendez-vous pris" value={metrics.acceptedAppointments} accent="emerald" />
        <MetricCard label="Refusees" value={metrics.refusedAppointments} accent="rose" />
        <MetricCard label="Categories en ligne" value={metrics.onlineCategories} accent="cyan" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Demandes recentes</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">A traiter en priorite</h2>
            </div>
            <Link
              href="/admin/rendez-vous/en-attente"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
            >
              <span>Voir tout</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {appointments.slice(0, 4).map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5 transition hover:border-blue-200 hover:shadow-[0_18px_35px_rgba(37,99,235,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {appointment.firstName} {appointment.lastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{appointment.category?.title ?? "Categorie supprimee"}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(appointment.startsAt).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                    {formatAppointmentStatus(appointment.status)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>{appointment.origin === "administrateur" ? "Cree par un administrateur" : "Demande utilisateur"}</span>
                  </div>
                  <Link href={`/admin/rendez-vous/${appointment.id}`} className="text-sm font-semibold text-blue-700">
                    Consulter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 text-slate-900">
              <CalendarClock className="size-5 text-blue-700" />
              <h2 className="text-2xl font-semibold">Categories publiees</h2>
            </div>
            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="rounded-[22px] border border-slate-200 bg-[#f8fafc] p-4">
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

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 text-slate-900">
              <ShieldCheck className="size-5 text-blue-700" />
              <h2 className="text-2xl font-semibold">Etat du site</h2>
            </div>
            <div className="mt-5 rounded-[22px] bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] p-5 ring-1 ring-blue-100">
              <p className="text-sm text-slate-500">Maintenance</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {siteSettings.maintenanceMode ? "Activee" : "Desactivee"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{siteSettings.maintenanceMessage}</p>
            </div>

            <div className="mt-5 rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Inbox className="size-4 text-blue-700" />
                <p className="font-semibold">Indisponibilites globales</p>
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                {siteSettings.globalBlackoutPeriods.map((period) => (
                  <li key={period.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="font-medium text-slate-900">
                      {period.startDate} → {period.endDate}
                    </p>
                    <p className="mt-1">{period.message}</p>
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
