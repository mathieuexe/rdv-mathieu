import Link from "next/link";
import { CheckCircle2, Inbox, LogOut } from "lucide-react";

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
      <section className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tableau de bord</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Vue d'ensemble</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">Consultez les rendez-vous, les categories et l'etat du site.</p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="size-4" />
              <span>Se deconnecter</span>
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[16px] border border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Demandes</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.totalAppointments}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.pendingAppointments}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Confirmes</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.acceptedAppointments}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Refuses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.refusedAppointments}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Categories</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.onlineCategories}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Demandes recentes</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">A traiter</h2>
            </div>
            <Link
              href="/admin/rendez-vous/en-attente"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Voir tout
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {appointments.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                Aucun rendez-vous pour le moment.
              </div>
            ) : (
              appointments.slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-[16px] border border-slate-200 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {appointment.firstName} {appointment.lastName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.category?.title ?? "Categorie supprimee"}</p>
                      <p className="mt-2 text-sm text-slate-600">{formatDateTimeFr(appointment.startsAt)}</p>
                    </div>

                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
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
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 text-slate-900">
              <h2 className="text-2xl font-semibold">Categories publiees</h2>
            </div>
            <div className="mt-5 space-y-3">
              {categories.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
                  Aucune categorie configuree.
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="rounded-[16px] border border-slate-200 p-4">
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

          <div className="rounded-[20px] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 text-slate-900">
              <h2 className="text-2xl font-semibold">Etat du site</h2>
            </div>
            <div className="mt-5 rounded-[16px] border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Maintenance</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {siteSettings.maintenanceMode ? "Activee" : "Desactivee"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{siteSettings.maintenanceMessage}</p>
            </div>

            <div className="mt-5 rounded-[16px] border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Inbox className="size-4 text-blue-700" />
                <p className="font-semibold">Indisponibilites globales</p>
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                {siteSettings.globalBlackoutPeriods.length === 0 ? (
                  <li className="rounded-xl border border-slate-200 px-4 py-3">Aucune indisponibilite globale.</li>
                ) : (
                  siteSettings.globalBlackoutPeriods.map((period) => (
                    <li key={period.id} className="rounded-xl border border-slate-200 px-4 py-3">
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
