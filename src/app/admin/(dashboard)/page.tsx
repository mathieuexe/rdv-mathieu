import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus2,
  CircleAlert,
  Clock,
  Inbox,
  Shapes,
  type IconComponent,
  XCircle,
} from "@/components/icons";

import { StatusBadge } from "@/components/admin/status-badge";
import { getAppointmentsView, getCategories, getDashboardMetrics, getSiteSettings } from "@/lib/data-access";
import { cn, formatDateTimeFr } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: IconComponent;
  tone: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-lg", tone)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 adm-stat-value">{value}</p>
    </>
  );

  return href ? (
    <Link href={href} className="adm-card block p-5 transition-colors hover:border-slate-300">
      {content}
    </Link>
  ) : (
    <div className="adm-card p-5">{content}</div>
  );
}

function initialsOf(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
}

export default async function AdminDashboardPage() {
  const [metrics, appointments, categories, siteSettings] = await Promise.all([
    getDashboardMetrics(),
    getAppointmentsView(),
    getCategories(),
    getSiteSettings(),
  ]);

  const recentAppointments = [...appointments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const upcomingBlackouts = siteSettings.globalBlackoutPeriods.filter(
    (period) => new Date(`${period.endDate}T${period.endTime}:00`) >= new Date(),
  );

  return (
    <div className="adm-page">
      <section className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">Vue d&apos;ensemble de votre activité et des demandes en cours.</p>
        </div>
        <Link href="/admin/rendez-vous/nouveau" className="adm-btn adm-btn-primary">
          <CalendarPlus2 className="size-4" />
          Nouveau rendez-vous
        </Link>
      </section>

      {metrics.pendingAppointments > 0 ? (
        <Link
          href="/admin/rendez-vous/en-attente"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:bg-amber-100/70"
        >
          <CircleAlert className="size-5 shrink-0 text-amber-600" />
          <span className="flex-1">
            <strong className="font-semibold">
              {metrics.pendingAppointments} demande{metrics.pendingAppointments > 1 ? "s" : ""}
            </strong>{" "}
            attend{metrics.pendingAppointments > 1 ? "ent" : ""} votre validation.
          </span>
          <ArrowRight className="size-4 shrink-0 text-amber-700" />
        </Link>
      ) : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Demandes totales" value={metrics.totalAppointments} icon={Inbox} tone="bg-blue-50 text-blue-600" />
        <StatCard
          label="En attente"
          value={metrics.pendingAppointments}
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
          href="/admin/rendez-vous/en-attente"
        />
        <StatCard
          label="Confirmés"
          value={metrics.acceptedAppointments}
          icon={CalendarCheck}
          tone="bg-emerald-50 text-emerald-600"
          href="/admin/rendez-vous/agenda"
        />
        <StatCard label="Refusés" value={metrics.refusedAppointments} icon={XCircle} tone="bg-rose-50 text-rose-600" />
        <StatCard
          label="Catégories en ligne"
          value={metrics.onlineCategories}
          icon={Shapes}
          tone="bg-violet-50 text-violet-600"
          href="/admin/categories"
        />
      </section>

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="adm-card overflow-hidden lg:col-span-2">
          <div className="adm-card-header justify-between">
            <h2 className="adm-card-title">Demandes récentes</h2>
            <Link href="/admin/rendez-vous" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Tout voir
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Inbox className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-900">Aucune demande pour le moment</p>
              <p className="mt-1 text-sm text-slate-500">Les nouvelles réservations apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentAppointments.map((appointment) => (
                <li key={appointment.id}>
                  <Link
                    href={`/admin/rendez-vous/${appointment.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {initialsOf(appointment.firstName, appointment.lastName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {appointment.firstName} {appointment.lastName}
                        {appointment.companyName ? (
                          <span className="font-normal text-slate-500"> · {appointment.companyName}</span>
                        ) : null}
                      </span>
                      <span className="block truncate text-[13px] text-slate-500">
                        {appointment.category?.title ?? "Catégorie supprimée"} ·{" "}
                        {formatDateTimeFr(appointment.startsAt, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </span>
                    <StatusBadge status={appointment.status} className="hidden shrink-0 sm:inline-flex" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="adm-card overflow-hidden">
            <div className="adm-card-header justify-between">
              <h2 className="adm-card-title">Catégories</h2>
              <Link href="/admin/categories" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Gérer
              </Link>
            </div>
            {categories.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Aucune catégorie configurée.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/admin/categories/${category.slug}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">{category.title}</span>
                        <span className="block truncate text-xs text-slate-500">/rdv/{category.slug}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {category.isHidden ? <span className="adm-badge bg-violet-50 text-violet-700">Privée</span> : null}
                        <span
                          className={cn(
                            "adm-badge",
                            category.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
                          )}
                        >
                          <span
                            className={cn("size-1.5 rounded-full", category.isOnline ? "bg-emerald-500" : "bg-slate-400")}
                            aria-hidden="true"
                          />
                          {category.isOnline ? "En ligne" : "Hors ligne"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="adm-card overflow-hidden">
            <div className="adm-card-header justify-between">
              <h2 className="adm-card-title">État du site</h2>
              <Link href="/admin/parametres" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Paramètres
              </Link>
            </div>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Maintenance</dt>
                <dd className="flex items-center gap-2 font-medium text-slate-900">
                  <span
                    className={cn("size-2 rounded-full", siteSettings.maintenanceMode ? "bg-rose-500" : "bg-emerald-500")}
                    aria-hidden="true"
                  />
                  {siteSettings.maintenanceMode ? "Activée" : "Désactivée"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Prise de rendez-vous</dt>
                <dd className="flex items-center gap-2 font-medium text-slate-900">
                  <span
                    className={cn("size-2 rounded-full", siteSettings.bookingBlocked ? "bg-amber-500" : "bg-emerald-500")}
                    aria-hidden="true"
                  />
                  {siteSettings.bookingBlocked ? "Suspendue" : "Ouverte"}
                </dd>
              </div>
              <div className="px-5 py-3">
                <dt className="text-slate-500">Indisponibilités à venir</dt>
                <dd className="mt-2">
                  {upcomingBlackouts.length === 0 ? (
                    <p className="font-medium text-slate-900">Aucune</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {upcomingBlackouts.map((period) => (
                        <li key={period.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                          {formatDateTimeFr(new Date(`${period.startDate}T${period.startTime}:00`), {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}{" "}
                          →{" "}
                          {formatDateTimeFr(new Date(`${period.endDate}T${period.endTime}:00`), {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
