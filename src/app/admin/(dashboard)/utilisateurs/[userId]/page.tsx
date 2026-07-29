import Link from "next/link";
import { notFound } from "next/navigation";
import { LaptopMinimal, MapPinned, MonitorSmartphone, ShieldCheck } from "lucide-react";

import { updateAdminUserProfileAction, updateAdminUserSecurityAction } from "@/app/admin/(dashboard)/actions";
import { AdminUserProfileForm } from "@/components/admin/admin-user-profile-form";
import { AdminUserSecurityForm } from "@/components/admin/admin-user-security-form";
import { getAdminUserDetail } from "@/lib/data-access";
import { formatAppointmentMode, formatAppointmentStatus, formatDateTimeFr } from "@/lib/utils";

function formatLocation(log: {
  city?: string;
  region?: string;
  country?: string;
}) {
  const parts = [log.city, log.region, log.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Lieu non disponible";
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const detail = await getAdminUserDetail(userId);

  if (!detail) {
    notFound();
  }

  const { profile, appointments, logs } = detail;

  return (
    <section className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Utilisateur</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {profile.email}
          {profile.phone ? ` · ${profile.phone}` : ""}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rôle</p>
            <p className="mt-2 font-semibold text-slate-950">{profile.role}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Création</p>
            <p className="mt-2 font-semibold text-slate-950">
              {formatDateTimeFr(profile.createdAt, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sécurité</p>
            <p className="mt-2 font-semibold text-slate-950">
              {profile.requiresPasswordChange ? "Changement de mot de passe requis" : "Aucune action requise"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-2xl font-semibold text-slate-950">Informations personnelles</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Modifiez ici les informations utilisées dans le compte client et pour les rendez-vous liés.
            </p>
          </div>

          <div className="mt-6">
            <AdminUserProfileForm user={profile} action={updateAdminUserProfileAction} />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-2xl font-semibold text-slate-950">Paramètres</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Gérez ici les paramètres de sécurité du compte client.
            </p>
          </div>

          <div className="mt-6">
            <AdminUserSecurityForm user={profile} action={updateAdminUserSecurityAction} />
          </div>
        </section>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Rendez-vous</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Liste de ses rendez-vous</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {appointments.length} rendez-vous
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
            Aucun rendez-vous lié à cet utilisateur.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{appointment.category?.title ?? "Rendez-vous"}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDateTimeFr(appointment.startsAt, { dateStyle: "full", timeStyle: "short" })}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.category?.appointmentMode
                        ? formatAppointmentMode(appointment.category.appointmentMode)
                        : "Type non disponible"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {formatAppointmentStatus(appointment.status)}
                    </span>
                    <Link
                      href={`/admin/rendez-vous/${appointment.id}`}
                      className="text-sm font-semibold text-slate-950 underline underline-offset-4"
                    >
                      Ouvrir la fiche
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Logs</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Logs complets</h2>
        </div>

        {logs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
            Aucun log n&apos;est encore disponible pour cet utilisateur.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{log.actionLabel}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">
                      {formatDateTimeFr(log.createdAt, { dateStyle: "full", timeStyle: "short" })}
                    </h3>
                    {log.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{log.description}</p> : null}
                  </div>

                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {log.actionType.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <MapPinned className="size-4 text-slate-500" />
                      <p className="text-sm font-medium">Lieu</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{formatLocation(log)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ShieldCheck className="size-4 text-slate-500" />
                      <p className="text-sm font-medium">Adresse IP</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{log.ipAddress ?? "Non disponible"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <MonitorSmartphone className="size-4 text-slate-500" />
                      <p className="text-sm font-medium">Appareil</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{log.deviceType ?? "Non disponible"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <LaptopMinimal className="size-4 text-slate-500" />
                      <p className="text-sm font-medium">Système / navigateur</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {[log.operatingSystem, log.browser].filter(Boolean).join(" · ") || "Non disponible"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
