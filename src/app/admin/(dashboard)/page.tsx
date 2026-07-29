import Link from "next/link";
import { CalendarPlus2, CheckCircle2, Inbox, LogOut, Settings2, Shapes } from "lucide-react";

import { getAppointmentsView, getCategories, getDashboardMetrics, getSiteSettings } from "@/lib/data-access";
import { formatAppointmentStatus, formatDateTimeFr } from "@/lib/utils";

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
      <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_55px_rgba(37,99,235,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600/70">Tableau de bord</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Vue d&apos;ensemble</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Retrouvez rapidement les demandes à traiter, l&apos;état du site et les catégories disponibles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/rendez-vous/nouveau"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <CalendarPlus2 className="size-4" />
              <span>Créer un rendez-vous</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                <LogOut className="size-4" />
                <span>Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[22px] border border-blue-100 bg-blue-50/60 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-700/70">Demandes</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.totalAppointments}</p>
          </div>
          <div className="rounded-[22px] border border-amber-100 bg-amber-50/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.pendingAppointments}</p>
          </div>
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/80">Confirmés</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.acceptedAppointments}</p>
          </div>
          <div className="rounded-[22px] border border-rose-100 bg-rose-50/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-rose-700/80">Refusés</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.refusedAppointments}</p>
          </div>
          <div className="rounded-[22px] border border-violet-100 bg-violet-50/70 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-700/80">Catégories</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.onlineCategories}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Demandes récentes</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">À traiter</h2>
            </div>
            <Link
              href="/admin/rendez-vous/en-attente"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Voir tout
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {appointments.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 px-5 py-10 text-sm text-slate-500">
                Aucun rendez-vous pour le moment.
              </div>
            ) : (
              appointments.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-[22px] border border-slate-200 p-5 transition hover:border-slate-300">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {appointment.firstName} {appointment.lastName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.category?.title ?? "Catégorie supprimée"}</p>
                      <p className="mt-2 text-sm text-slate-600">{formatDateTimeFr(appointment.startsAt)}</p>
                    </div>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {formatAppointmentStatus(appointment.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>{appointment.origin === "administrateur" ? "Créé par un administrateur" : "Demande utilisateur"}</span>
                    </div>
                    <Link href={`/admin/rendez-vous/${appointment.id}`} className="text-sm font-semibold text-slate-950 underline underline-offset-4">
                      Consulter
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-3 text-slate-900">
              <Shapes className="size-5 text-slate-500" />
              <h2 className="text-2xl font-semibold">Catégories publiées</h2>
            </div>
            <div className="mt-5 space-y-3">
              {categories.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  Aucune catégorie configurée.
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="rounded-[20px] border border-slate-200 p-4">
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
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-3 text-slate-900">
              <Settings2 className="size-5 text-slate-500" />
              <h2 className="text-2xl font-semibold">Etat du site</h2>
            </div>
            <div className="mt-5 rounded-[20px] border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Maintenance</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {siteSettings.maintenanceMode ? "Activée" : "Désactivée"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{siteSettings.maintenanceMessage}</p>
            </div>

            <div className="mt-5 rounded-[20px] border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Inbox className="size-4 text-slate-500" />
                <p className="font-semibold">Indisponibilités globales</p>
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                {siteSettings.globalBlackoutPeriods.length === 0 ? (
                  <li className="rounded-2xl border border-slate-200 px-4 py-3">Aucune indisponibilité globale.</li>
                ) : (
                  siteSettings.globalBlackoutPeriods.map((period) => (
                    <li key={period.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {period.startDate} → {period.endDate}
                      </p>
                      <p className="mt-1">{period.message}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
