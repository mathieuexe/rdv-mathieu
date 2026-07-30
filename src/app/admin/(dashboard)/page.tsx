import Link from "next/link";
import { CalendarPlus2, CheckCircle2, Inbox, LogOut, Settings2, Shapes, CalendarCheck, Clock, XCircle, Users } from "lucide-react";

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
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Page Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            Vue d'ensemble de votre activité et des demandes en cours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/rendez-vous/nouveau"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <CalendarPlus2 className="size-4" />
            Nouveau rendez-vous
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="size-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Demandes totales</p>
            <Users className="size-4 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.totalAppointments}</p>
        </div>
        
        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">En attente</p>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.pendingAppointments}</p>
        </div>
        
        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Confirmés</p>
            <CalendarCheck className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.acceptedAppointments}</p>
        </div>
        
        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Refusés</p>
            <XCircle className="size-4 text-rose-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.refusedAppointments}</p>
        </div>
        
        <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Catégories</p>
            <Shapes className="size-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metrics.onlineCategories}</p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Appointments */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="font-semibold text-slate-800">Demandes récentes</h2>
            <Link
              href="/admin/rendez-vous/en-attente"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="p-0">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Aucun rendez-vous pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <Link 
                        href={`/admin/rendez-vous/${appointment.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {appointment.firstName} {appointment.lastName}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <span className="truncate max-w-[200px]">{appointment.category?.title ?? "Catégorie supprimée"}</span>
                        <span>•</span>
                        <span>{formatDateTimeFr(appointment.startsAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {formatAppointmentStatus(appointment.status)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className="size-3" />
                        <span>{appointment.origin === "administrateur" ? "Admin" : "Web"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Config Summary */}
        <div className="space-y-6">
          {/* Categories List */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Shapes className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Catégories publiées</h2>
            </div>
            <div className="p-4">
              {categories.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  Aucune catégorie configurée.
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{category.title}</p>
                        <p className="text-xs text-slate-500">/{category.slug}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          category.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {category.isOnline ? "En ligne" : "Hors ligne"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Settings2 className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">État du système</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Mode Maintenance</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`relative flex size-2.5`}>
                    {siteSettings.maintenanceMode ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex size-2.5 rounded-full bg-rose-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {siteSettings.maintenanceMode ? "Activé" : "Désactivé"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Inbox className="size-3" />
                  <p>Indisponibilités globales</p>
                </div>
                <div className="mt-2">
                  {siteSettings.globalBlackoutPeriods.length === 0 ? (
                    <p className="text-sm text-slate-600">Aucune indisponibilité prévue.</p>
                  ) : (
                    <ul className="space-y-2">
                      {siteSettings.globalBlackoutPeriods.map((period) => (
                        <li key={period.id} className="rounded border border-slate-100 bg-slate-50 p-2 text-xs">
                          <p className="font-medium text-slate-900">
                            {formatDateTimeFr(new Date(`${period.startDate}T${period.startTime}:00`), {
                              dateStyle: "short", timeStyle: "short",
                            })}{" "}
                            →{" "}
                            {formatDateTimeFr(new Date(`${period.endDate}T${period.endTime}:00`), {
                              dateStyle: "short", timeStyle: "short",
                            })}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
