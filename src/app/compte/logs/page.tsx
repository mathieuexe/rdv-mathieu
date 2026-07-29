import { redirect } from "next/navigation";
import { LaptopMinimal, MapPinned, MonitorSmartphone, ShieldCheck } from "lucide-react";

import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";
import { getUserAccountActivityLogs } from "@/lib/data-access";
import { formatDateTimeFr } from "@/lib/utils";

function formatLocation(log: {
  city?: string;
  region?: string;
  country?: string;
}) {
  const parts = [log.city, log.region, log.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Lieu non disponible";
}

export default async function AccountLogsPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.userId) {
    redirect("/connexion");
  }

  const logs = await getUserAccountActivityLogs(session.userId);

  return (
    <AccountShell
      session={session}
      currentPath="/compte/logs"
      title="Logs"
      description="Retrouvez ici l'historique de vos actions sur le site, ainsi que les informations techniques liées à vos connexions à votre espace."
    >
      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
          <p className="text-lg font-medium text-neutral-900">Aucun log n&apos;est encore disponible.</p>
          <p className="mt-3 text-sm text-neutral-500">Les prochaines connexions et actions réalisées depuis votre compte apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {logs.map((log) => (
            <article
              key={log.id}
              className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{log.actionLabel}</p>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-950">
                    {formatDateTimeFr(log.createdAt, { dateStyle: "full", timeStyle: "short" })}
                  </h2>
                  {log.description ? <p className="mt-3 text-sm leading-7 text-neutral-600">{log.description}</p> : null}
                </div>

                <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
                  {log.actionType.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <MapPinned className="size-4 text-neutral-500" />
                    <p className="text-sm font-medium">Lieu</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">{formatLocation(log)}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <ShieldCheck className="size-4 text-neutral-500" />
                    <p className="text-sm font-medium">Adresse IP</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">{log.ipAddress ?? "Non disponible"}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <MonitorSmartphone className="size-4 text-neutral-500" />
                    <p className="text-sm font-medium">Appareil</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">{log.deviceType ?? "Non disponible"}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <LaptopMinimal className="size-4 text-neutral-500" />
                    <p className="text-sm font-medium">Système / navigateur</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">
                    {[log.operatingSystem, log.browser].filter(Boolean).join(" · ") || "Non disponible"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
