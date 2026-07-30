import Link from "next/link";
import { notFound } from "next/navigation";
import { LaptopMinimal, MapPinned, MonitorSmartphone, ShieldCheck, User, Calendar, History, Settings, KeyRound } from "lucide-react";

import { updateAdminUserProfileAction, updateAdminUserSecurityAction } from "@/app/admin/(dashboard)/actions";
import { AdminUserProfileForm } from "@/components/admin/admin-user-profile-form";
import { AdminUserSecurityForm } from "@/components/admin/admin-user-security-form";
import { getAdminUserDetail } from "@/lib/data-access";
import { formatAppointmentStatus, formatDateTimeFr } from "@/lib/utils";

function safeDecode(value?: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatLocation(log: {
  city?: string;
  region?: string;
  country?: string;
}) {
  const parts = [safeDecode(log.city), safeDecode(log.region), safeDecode(log.country)].filter(Boolean);
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

  const { profile, authProvider, appointments, logs } = detail;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Salesforce Highlights Panel */}
      <section className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
            <User className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</p>
              {authProvider === "google" && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  <svg className="size-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 md:gap-12">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900">{profile.email}</p>
          </div>
          {profile.phone && (
            <div>
              <p className="text-xs text-slate-500">Téléphone</p>
              <p className="text-sm font-medium text-slate-900">{profile.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500">Rôle</p>
            <p className="text-sm font-medium text-slate-900">{profile.role}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Dernière activité</p>
            <p className="text-sm font-medium text-slate-900">
              {logs[0] ? formatDateTimeFr(logs[0].createdAt, { dateStyle: "short", timeStyle: "short" }) : "Aucune"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        
        {/* Left Column: Details & Settings */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Details Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <Settings className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Détails du Contact</h2>
            </div>
            <div className="p-4 md:p-6">
              <AdminUserProfileForm user={profile} action={updateAdminUserProfileAction} />
            </div>
          </section>

          {/* Security Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <KeyRound className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Sécurité & Accès</h2>
            </div>
            <div className="p-4 md:p-6">
              <div className="mb-6 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Statut : </span> 
                {profile.requiresPasswordChange ? "Changement de mot de passe requis" : "Normal"}
              </div>
              <AdminUserSecurityForm user={profile} action={updateAdminUserSecurityAction} />
            </div>
          </section>

          {/* Activity Logs Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <History className="size-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Historique d'Activité</h2>
            </div>
            <div className="p-4 md:p-6">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">Aucun log disponible</div>
              ) : (
                <div className="space-y-6">
                  {logs.map((log) => (
                    <article key={log.id} className="relative pl-4">
                      <div className="absolute left-0 top-1.5 h-full w-[2px] bg-slate-100"></div>
                      <div className="absolute -left-[5px] top-1.5 size-3 rounded-full border-2 border-blue-600 bg-white"></div>
                      
                      <div className="ml-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900">{log.actionLabel}</p>
                          <span className="text-xs text-slate-500">
                            {formatDateTimeFr(log.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>
                        {log.description && <p className="mt-1 text-sm text-slate-600">{log.description}</p>}
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <MapPinned className="size-3" />
                            <span className="truncate">{formatLocation(log)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="size-3" />
                            <span className="truncate">{log.ipAddress ?? "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MonitorSmartphone className="size-3" />
                            <span className="truncate">{log.deviceType ?? "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <LaptopMinimal className="size-3" />
                            <span className="truncate">
                              {[log.operatingSystem, log.browser].filter(Boolean).join(" · ") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Related Lists */}
        <div className="space-y-6">
          {/* Appointments Related List */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Rendez-vous</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {appointments.length}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {appointments.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">Aucun rendez-vous</div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <Link 
                          href={`/admin/rendez-vous/${appointment.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {appointment.category?.title ?? "Rendez-vous"}
                        </Link>
                        <span className="shrink-0 text-xs font-medium text-slate-500">
                          {formatAppointmentStatus(appointment.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {formatDateTimeFr(appointment.startsAt, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
