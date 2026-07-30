import { redirect } from "next/navigation";
import { LaptopMinimal, MapPinned, MonitorSmartphone, ShieldCheck, Activity } from "lucide-react";

import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";
import { getUserAccountActivityLogs } from "@/lib/data-access";
import { formatDateTimeFr } from "@/lib/utils";

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

export default async function AccountLogsPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.userId) {
    redirect("/connexion");
  }

  if (session.isBanned) {
    redirect("/");
  }

  const logs = await getUserAccountActivityLogs(session.userId);

  return (
    <AccountShell
      session={session}
      currentPath="/compte/logs"
      title="Logs d'activité"
      description="Retrouvez ici l'historique de vos actions sur le site, ainsi que les informations techniques liées à vos connexions à votre espace."
    >
      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <Activity className="mx-auto size-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">Aucun log n&apos;est encore disponible.</p>
          <p className="mt-2 text-sm text-slate-500">Les prochaines connexions et actions réalisées depuis votre compte apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <article
              key={log.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {formatDateTimeFr(log.createdAt, { dateStyle: "full", timeStyle: "short" })}
                    </h2>
                    <p className="text-sm font-medium text-slate-700 mt-1">{log.actionLabel}</p>
                    {log.description && <p className="mt-1 text-sm text-slate-600">{log.description}</p>}
                  </div>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm capitalize">
                    {log.actionType.replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Lieu</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <MapPinned className="size-4 text-slate-400" />
                      <span className="truncate">{formatLocation(log)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Adresse IP</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <ShieldCheck className="size-4 text-slate-400" />
                      <span>{log.ipAddress ?? "Non disponible"}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Appareil</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <MonitorSmartphone className="size-4 text-slate-400" />
                      <span>{log.deviceType ?? "Non disponible"}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Système / Navigateur</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <LaptopMinimal className="size-4 text-slate-400" />
                      <span className="truncate">
                        {[log.operatingSystem, log.browser].filter(Boolean).join(" · ") || "Non disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
